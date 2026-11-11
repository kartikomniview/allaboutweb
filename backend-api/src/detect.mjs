import Anthropic from "@anthropic-ai/sdk";
import { HttpError } from "./http.mjs";
import { isStoreImageUrl } from "./storage.mjs";

// Product details detected from a photo with Claude (vision). Used by the admin
// product form to fill in the name, category, subcategory, details, specs, tags
// and search keywords, for any kind of product (furniture, decor, lighting,
// flooring, curtains, fabrics, electronics...).
//
// The category is chosen from the store's own list when one fits; otherwise the
// model may suggest a new one (categoryIsNew / subcategoryIsNew in the answer).
//
// Env: ANTHROPIC_API_KEY (required), ANTHROPIC_MODEL (optional, default below).
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-5-5";

const MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_BASE64 = 4 * 1024 * 1024; // the browser sends a ~1024px JPEG, far smaller
const MAX_CATEGORIES = 80;
const MAX_SUBCATEGORIES = 40;
const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
// Caps on the answer (products accept more; see validateProduct).
const MAX_KEYWORDS = 15;
const MAX_SPECS = 6;
const MAX_TAGS = 3;
const MAX_HIGHLIGHTS = 4;

const bad = (message) => new HttpError(400, "BAD_REQUEST", message);

let anthropic;
// Created lazily so a warm Lambda reuses the client.
function client() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new HttpError(503, "NOT_CONFIGURED", "Photo detection is not set up (ANTHROPIC_API_KEY is missing)");
  }
  // Two tries of 12 s stay inside API Gateway's 30 s limit.
  anthropic ??= new Anthropic({ timeout: 12_000, maxRetries: 1 });
  return anthropic;
}

const isName = (v) => typeof v === "string" && v.trim() && v.length <= 60;

// [{ name, subcategories: [name] }] sent by the website: the store's categories
// (its business types' predefined ones plus the ones its products already use).
function categoryList(value) {
  if (!Array.isArray(value) || value.length > MAX_CATEGORIES) {
    throw bad(`categories must be a list of at most ${MAX_CATEGORIES} items`);
  }
  return value.map((c) => {
    if (!isName(c?.name)) throw bad("Every category needs a name");
    const subs = c.subcategories;
    if (!Array.isArray(subs) || subs.length > MAX_SUBCATEGORIES || !subs.every(isName)) {
      throw bad(`Category "${c.name}" needs a list of at most ${MAX_SUBCATEGORIES} subcategory names`);
    }
    return { name: c.name.trim(), subcategories: subs.map((s) => s.trim()) };
  });
}

// ["Furniture", "Lighting"]: what the store sells (labels, for the prompt).
function businessList(value) {
  if (value === undefined) return [];
  if (
    !Array.isArray(value) ||
    value.length > 10 ||
    !value.every((v) => typeof v === "string" && v.trim() && v.length <= 40)
  ) {
    throw bad("businessTypes must be a list of at most 10 names");
  }
  return value.map((v) => v.trim());
}

function imageBlock(body, storeSlug) {
  if (typeof body.imageUrl === "string") {
    if (!isStoreImageUrl(body.imageUrl, storeSlug)) throw bad("imageUrl must be an uploaded product image");
    return { type: "image", source: { type: "url", url: body.imageUrl } };
  }
  const { data, mediaType } = body.image ?? {};
  if (!MEDIA_TYPES.includes(mediaType)) throw bad("image.mediaType must be JPEG, PNG or WebP");
  if (typeof data !== "string" || !data || data.length > MAX_IMAGE_BASE64) {
    throw bad("image.data must be a base64 image of at most 4 MB");
  }
  return { type: "image", source: { type: "base64", media_type: mediaType, data } };
}

const SYSTEM = `You catalogue products for an Indian retail store's online catalog. The store may sell furniture, home decor, lighting, flooring, curtains and blinds, fabrics, clothing, electronics or anything else.
Look at the product photo and describe the main product in it.

- productName: 3 to 6 words, a short appealing name followed by the product type, e.g. "Nilgiri L-Shape Corner Sofa", "Jaipur Brass Pendant Light", "Ivory Sheer Window Curtain", "Kashmiri Wool Area Rug", "Velvet Upholstery Fabric", "Banarasi Silk Saree", "55-inch 4K Smart LED TV".
- categoryName and subcategoryName: use the exact names from the store's list when one fits; the subcategory must belong to the chosen category. Only if nothing in the list fits, write a short new name in Title Case (e.g. "Wall Clocks"). For a new category, also write a new subcategory.
- description: 1 to 2 plain, friendly sentences for shoppers, at most 300 characters. Describe only what is visible: no prices, warranty or delivery claims.
- colors: the 1 to 3 main visible colours of the product, each with a short shopper-friendly name and its hex code.
- material: the main visible material, e.g. "Velvet Fabric Upholstery", "Brass with Glass Shade", "Polyester Blend". Empty string if unclear.
- dimensions: only if a size is printed on the product or its packaging; otherwise an empty string. Never guess a size.
- specs: 2 to 6 short label/value pairs that matter for this kind of product and are visible or clearly implied, e.g. Wood: Sheesham, Seating: 3 Seater, Bulb: LED, Mount: Ceiling, Pattern: Floral, Opacity: Sheer, Screen: 55 inch. Labels are 1 or 2 words. No prices, warranty or delivery.
- tags: 1 to 3 short descriptive labels for the product card, e.g. "Handcrafted", "Modern", "Space Saver", "Festive". No price or offer claims like "Hot Deal" or "Best Price".
- highlights: 2 to 4 short selling points, each at most 60 characters, based only on what is visible.
- keywords: 8 to 15 lowercase search terms a shopper might type to find this product, each 1 to 3 words. Cover the product type and its synonyms, including common Indian names (e.g. "almirah", "diwan", "jhoomar", "parda", "dari"), the room it suits, style, visible colours, material and visible features. Only what the photo supports; no brand names unless visible on the product.`;

// No enums for the category: a new name is allowed when nothing in the list fits.
// clean() maps the answer back onto the store's list.
const SCHEMA = {
  type: "object",
  properties: {
    productName: { type: "string" },
    categoryName: { type: "string" },
    subcategoryName: { type: "string" },
    description: { type: "string" },
    colors: {
      type: "array",
      items: {
        type: "object",
        properties: { name: { type: "string" }, hex: { type: "string" } },
        required: ["name", "hex"],
        additionalProperties: false,
      },
    },
    material: { type: "string" },
    dimensions: { type: "string" },
    specs: {
      type: "array",
      items: {
        type: "object",
        properties: { label: { type: "string" }, value: { type: "string" } },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
    tags: { type: "array", items: { type: "string" } },
    highlights: { type: "array", items: { type: "string" } },
    keywords: { type: "array", items: { type: "string" } },
  },
  required: [
    "productName",
    "categoryName",
    "subcategoryName",
    "description",
    "colors",
    "material",
    "dimensions",
    "specs",
    "tags",
    "highlights",
    "keywords",
  ],
  additionalProperties: false,
};

const clip = (v, max) => (typeof v === "string" ? v.trim().slice(0, max).trim() : "");
const same = (a, b) => a.toLowerCase() === b.toLowerCase();
const list = (v) => (Array.isArray(v) ? v : []);

// Trimmed, clipped, non-empty strings without case-insensitive duplicates.
function strings(v, max, limit) {
  const out = [];
  for (const item of list(v)) {
    const s = clip(item, max);
    if (s && !out.some((o) => same(o, s))) out.push(s);
  }
  return out.slice(0, limit);
}

// Maps the category onto the store's list (keeping the list's spelling), flags
// new names, and keeps every field inside the product limits (validateProduct).
export function clean(raw, categories) {
  const categoryText = clip(raw.categoryName, 60);
  const subText = clip(raw.subcategoryName, 60);
  const category = categoryText ? categories.find((c) => same(c.name, categoryText)) : undefined;
  const subcategory = category && subText ? category.subcategories.find((s) => same(s, subText)) : undefined;

  const specs = [];
  for (const spec of list(raw.specs)) {
    const label = clip(spec?.label, 40);
    const value = clip(spec?.value, 120);
    if (label && value && !specs.some((s) => same(s.label, label))) specs.push({ label, value });
  }

  return {
    productName: clip(raw.productName, 120),
    categoryName: category ? category.name : categoryText,
    subcategoryName: subcategory ?? subText,
    categoryIsNew: Boolean(categoryText) && !category,
    subcategoryIsNew: Boolean(subText) && !subcategory,
    description: clip(raw.description, 2000),
    colors: list(raw.colors)
      .filter((c) => HEX_RE.test(c?.hex ?? "") && clip(c?.name, 60))
      .slice(0, 3)
      .map((c) => ({ name: clip(c.name, 60), hex: c.hex.toUpperCase() })),
    material: clip(raw.material, 200),
    dimensions: clip(raw.dimensions, 200),
    specs: specs.slice(0, MAX_SPECS),
    tags: strings(raw.tags, 40, MAX_TAGS),
    highlights: strings(raw.highlights, 200, MAX_HIGHLIGHTS),
    keywords: strings(
      list(raw.keywords).map((k) => (typeof k === "string" ? k.toLowerCase() : k)),
      40,
      MAX_KEYWORDS,
    ),
  };
}

const notDetected = () => new HttpError(422, "NOT_DETECTED", "Couldn't detect this product. Fill in the details by hand.");

// POST /products/detect  { businessTypes?, categories, image: { data, mediaType } } or { ..., imageUrl }
export async function detectProduct(storeSlug, body) {
  if (!body || typeof body !== "object") throw bad("Body must be an object");
  const categories = categoryList(body.categories);
  const businesses = businessList(body.businessTypes);
  const image = imageBlock(body, storeSlug);
  const lists = categories.length
    ? categories
        .map((c) => (c.subcategories.length ? `- ${c.name}: ${c.subcategories.join(", ")}` : `- ${c.name}`))
        .join("\n")
    : "(none yet)";
  const intro = businesses.length ? `The store sells: ${businesses.join(", ")}.\n\n` : "";

  const claude = client();
  let response;
  try {
    response = await claude.messages.create({
      model: MODEL,
      max_tokens: 4000, // room for adaptive thinking plus the JSON answer
      system: SYSTEM,
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages: [
        {
          role: "user",
          content: [image, { type: "text", text: `${intro}The store's categories and their subcategories:\n${lists}` }],
        },
      ],
    });
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError) {
      // e.g. an image the API can't read
      console.error("Detect: request rejected", err.message);
      throw notDetected();
    }
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
      console.error("Detect: invalid Anthropic API key", err.message);
      throw new HttpError(503, "NOT_CONFIGURED", "Photo detection is not set up correctly (check the API key)");
    }
    if (err instanceof Anthropic.RateLimitError) {
      throw new HttpError(429, "RATE_LIMITED", "Too many detections right now. Try again in a minute.");
    }
    console.error("Detect: Claude API call failed", err);
    throw new HttpError(502, "DETECT_FAILED", "Photo detection is unavailable right now. Try again.");
  }

  // refusal / max_tokens: no usable answer. Haiku has no server-side fallback.
  if (response.stop_reason !== "end_turn") {
    console.warn("Detect: no answer", response.stop_reason, response.stop_details ?? "");
    throw notDetected();
  }
  const text = response.content.find((block) => block.type === "text")?.text;
  let raw;
  try {
    raw = JSON.parse(text ?? "");
  } catch {
    throw notDetected();
  }
  const detected = clean(raw, categories);
  if (!detected.productName && !detected.categoryName) throw notDetected();
  return detected;
}

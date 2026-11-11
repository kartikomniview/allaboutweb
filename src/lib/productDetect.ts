// Detects product details (name, category, subcategory, description, colours,
// material, size, specs, tags, highlights, search keywords) from a photo. The
// Lambda asks Claude, guided by the store's own categories (sent from here): it
// picks one of them when it fits, or suggests a new category when none does.

import { apiRequest } from "./adminAuth";
import type { ProductColor, ProductSpec } from "./adminProducts";
import { businessTypeLabel, type PickerCategory } from "./taxonomy";

export type DetectedProduct = {
  productName: string;
  categoryName: string;
  subcategoryName: string;
  /** The AI suggested a category / subcategory that isn't in the store's list. */
  categoryIsNew: boolean;
  subcategoryIsNew: boolean;
  description: string;
  colors: ProductColor[];
  material: string;
  dimensions: string;
  specs: ProductSpec[];
  tags: string[];
  highlights: string[];
  keywords: string[];
};

/** What the store sells, and the categories to choose from (storeCategories in taxonomy.ts). */
export type DetectContext = { businessTypes: readonly string[]; categories: readonly PickerCategory[] };

// The API takes at most 80 categories with 40 subcategories each.
const categoryPayload = (categories: readonly PickerCategory[]) =>
  categories.slice(0, 80).map((c) => ({ name: c.name, subcategories: c.subcategories.slice(0, 40).map((s) => s.name) }));

const list = <T,>(v: T[] | undefined) => (Array.isArray(v) ? v : []);

async function detect(
  image: { image: { data: string; mediaType: string } } | { imageUrl: string },
  context: DetectContext,
): Promise<DetectedProduct> {
  const { detected } = await apiRequest<{ detected: Partial<DetectedProduct> }>("/products/detect", {
    method: "POST",
    body: JSON.stringify({
      businessTypes: context.businessTypes.map(businessTypeLabel),
      categories: categoryPayload(context.categories),
      ...image,
    }),
  });
  // An older API build answers without the newer fields.
  return {
    productName: detected.productName ?? "",
    categoryName: detected.categoryName ?? "",
    subcategoryName: detected.subcategoryName ?? "",
    categoryIsNew: Boolean(detected.categoryIsNew),
    subcategoryIsNew: Boolean(detected.subcategoryIsNew),
    description: detected.description ?? "",
    colors: list(detected.colors),
    material: detected.material ?? "",
    dimensions: detected.dimensions ?? "",
    specs: list(detected.specs),
    tags: list(detected.tags),
    highlights: list(detected.highlights),
    keywords: list(detected.keywords),
  };
}

// A small JPEG copy is plenty for recognition and keeps the request light.
// It is only sent for detection, never stored.
async function smallJpegBase64(file: File, maxSide = 1024): Promise<string> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.85);
    return url.slice(url.indexOf(",") + 1);
  } finally {
    bitmap.close();
  }
}

export async function detectFromFile(file: File, context: DetectContext): Promise<DetectedProduct> {
  return detect({ image: { data: await smallJpegBase64(file), mediaType: "image/jpeg" } }, context);
}

export function detectFromUrl(imageUrl: string, context: DetectContext): Promise<DetectedProduct> {
  return detect({ imageUrl }, context);
}

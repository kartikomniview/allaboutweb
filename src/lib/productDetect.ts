// Detects product details (name, category, subcategory, description, size,
// specs, tags, highlights, search keywords) from a photo. The
// Lambda asks Claude to pick the category and subcategory from the predefined
// categories of the store's business types (sent from here), the closest
// subcategory when none fits exactly. When the product is a different kind of
// thing (a jug in a furniture store) the category comes back empty with
// categoryFit "none", and the form asks the owner to choose one. It never
// suggests a custom or new category.

import { apiRequest } from "./adminAuth";
import type { ProductSpec } from "./adminProducts";
import { businessTypeLabel, type PickerCategory } from "./taxonomy";

/** How well the product fits the store's categories ("" from an older API build). */
export type CategoryFit = "exact" | "close" | "none" | "";

export type DetectedProduct = {
  productName: string;
  /** What the product is, e.g. "ceramic jug" ("" from an older API build). */
  productType: string;
  categoryFit: CategoryFit;
  categoryName: string;
  subcategoryName: string;
  description: string;
  dimensions: string;
  specs: ProductSpec[];
  tags: string[];
  highlights: string[];
  keywords: string[];
};

/** What the store sells, and the categories the AI may choose from (its business types' ones). */
export type DetectContext = { businessTypes: readonly string[]; categories: readonly PickerCategory[] };

// The API takes at most 120 categories with 40 subcategories each.
const categoryPayload = (categories: readonly PickerCategory[]) =>
  categories.slice(0, 120).map((c) => ({ name: c.name, subcategories: c.subcategories.slice(0, 40).map((s) => s.name) }));

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
    productType: detected.productType ?? "",
    categoryFit: detected.categoryFit ?? "",
    categoryName: detected.categoryName ?? "",
    subcategoryName: detected.subcategoryName ?? "",
    description: detected.description ?? "",
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

/** AI recognised the product but it fits none of the store's categories. */
export const isCategoryMismatch = (d: DetectedProduct) => Boolean(d.productName && !d.categoryName);

export async function detectFromFile(file: File, context: DetectContext): Promise<DetectedProduct> {
  return detect({ image: { data: await smallJpegBase64(file), mediaType: "image/jpeg" } }, context);
}

export function detectFromUrl(imageUrl: string, context: DetectContext): Promise<DetectedProduct> {
  return detect({ imageUrl }, context);
}

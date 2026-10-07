// Client for the admin products API (backend-api/ → Firestore `products`).
// Browser-only: requests carry the admin session from adminAuth.

import { apiRequest } from "./adminAuth";

export type ProductColor = { name: string; hex: string };

// The writable fields of a product document.
export type ProductInput = {
  productName: string;
  categoryName: string;
  subcategoryName: string;
  price: number;
  originalPrice: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  colors: ProductColor[];
  material: string;
  dimensions: string;
  woodType: string;
  stockStatus: string;
  description: string;
  highlights: string[];
  isActive: boolean;
  // Public S3 URLs. images lists every image; main (cover) and plain
  // (plain-background shot) are each empty or one of images.
  mainImageUrl: string;
  plainImageUrl: string;
  images: string[];
};

// A product with its id. The catalog's dummy data (furniture-catalog/data.ts)
// uses this shape, so it matches what the admin panel stores.
export type CatalogProduct = ProductInput & { id: string };

export type Product = CatalogProduct & {
  createdAt: string | null;
  updatedAt: string | null;
};

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

// Fills in missing or wrongly typed fields, e.g. on documents added by hand in
// the Firebase console, so the UI can rely on the Product shape.
// Also used by the public catalog (catalogProducts.ts).
export function normalizeProduct(raw: Record<string, unknown>): Product {
  const price = num(raw.price);
  return {
    id: str(raw.id),
    productName: str(raw.productName),
    categoryName: str(raw.categoryName),
    subcategoryName: str(raw.subcategoryName),
    price,
    originalPrice: typeof raw.originalPrice === "number" ? raw.originalPrice : price,
    tags: strList(raw.tags),
    rating: num(raw.rating),
    reviewCount: num(raw.reviewCount),
    colors: Array.isArray(raw.colors)
      ? raw.colors
          .filter((c): c is ProductColor => typeof c?.name === "string" && typeof c?.hex === "string")
          .map((c) => ({ name: c.name, hex: c.hex }))
      : [],
    material: str(raw.material),
    dimensions: str(raw.dimensions),
    woodType: str(raw.woodType),
    stockStatus: str(raw.stockStatus),
    description: str(raw.description),
    highlights: strList(raw.highlights),
    isActive: raw.isActive !== false,
    mainImageUrl: str(raw.mainImageUrl),
    plainImageUrl: str(raw.plainImageUrl),
    images: strList(raw.images),
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

export async function listProducts(): Promise<Product[]> {
  const data = await apiRequest<{ products: Record<string, unknown>[] }>("/products");
  return sortProducts(data.products.map(normalizeProduct));
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const data = await apiRequest<{ product: Record<string, unknown> }>("/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return normalizeProduct(data.product);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const data = await apiRequest<{ product: Record<string, unknown> }>(`/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return normalizeProduct(data.product);
}

export async function deleteProduct(id: string): Promise<void> {
  await apiRequest(`/products/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// Creates products with fixed ids; ids that already exist are skipped.
export async function importProducts(
  products: CatalogProduct[],
): Promise<{ created: number; skipped: number }> {
  return apiRequest("/products/import", {
    method: "POST",
    body: JSON.stringify({ products }),
  });
}

export function productToInput(p: Product): ProductInput {
  return {
    productName: p.productName,
    categoryName: p.categoryName,
    subcategoryName: p.subcategoryName,
    price: p.price,
    originalPrice: p.originalPrice,
    tags: p.tags,
    rating: p.rating,
    reviewCount: p.reviewCount,
    colors: p.colors,
    material: p.material,
    dimensions: p.dimensions,
    woodType: p.woodType,
    stockStatus: p.stockStatus,
    description: p.description,
    highlights: p.highlights,
    isActive: p.isActive,
    mainImageUrl: p.mainImageUrl,
    plainImageUrl: p.plainImageUrl,
    images: p.images,
  };
}

// Same order as the API: category, then oldest first.
export function sortProducts(products: Product[]): Product[] {
  return [...products].sort(
    (a, b) =>
      a.categoryName.localeCompare(b.categoryName) ||
      (a.createdAt ?? "").localeCompare(b.createdAt ?? "") ||
      a.id.localeCompare(b.id),
  );
}

export const discountPercent =(price: number, originalPrice: number) =>
  originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

/* ---------- Image uploads (browser → S3, signed by the Lambda) ---------- */

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export type ImageUpload = { uploadUrl: string; fields: Record<string, string>; publicUrl: string };

// Returns an error message for files S3 would reject, or null.
export function checkImageFile(file: File): string | null {
  if (!IMAGE_TYPES.includes(file.type)) return `${file.name}: use JPG, PNG, WebP or AVIF`;
  if (file.size > MAX_IMAGE_BYTES) return `${file.name}: larger than 5 MB`;
  return null;
}

// One signed upload form per file. The S3 folder comes from the product's
// category, subcategory and name.
export async function requestImageUploads(
  product: Pick<ProductInput, "categoryName" | "subcategoryName" | "productName">,
  files: File[],
): Promise<ImageUpload[]> {
  const data = await apiRequest<{ uploads: ImageUpload[] }>("/products/uploads", {
    method: "POST",
    body: JSON.stringify({
      categoryName: product.categoryName,
      subcategoryName: product.subcategoryName,
      productName: product.productName,
      files: files.map((f) => ({ contentType: f.type, size: f.size })),
    }),
  });
  return data.uploads;
}

// Posts the file to S3 with the signed form. XHR (not fetch) for upload progress.
export function uploadToS3(upload: ImageUpload, file: File, onProgress?: (fraction: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    Object.entries(upload.fields).forEach(([key, value]) => form.append(key, value));
    form.append("file", file); // S3 requires the file to be the last field

    const xhr = new XMLHttpRequest();
    xhr.open("POST", upload.uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve(upload.publicUrl);
      const message = /<Message>([^<]+)<\/Message>/.exec(xhr.responseText)?.[1];
      reject(new Error(message ? `Upload rejected: ${message}` : `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection."));
    xhr.send(form);
  });
}

// Deletes images uploaded in the editor that were never saved to a product.
export async function discardUploads(urls: string[]): Promise<void> {
  if (!urls.length) return;
  await apiRequest("/products/uploads/discard", { method: "POST", body: JSON.stringify({ urls }) });
}

// Link previews for the public catalog: what WhatsApp, Facebook, X and co. show when
// a store, category, product or picks link is shared (Open Graph + Twitter tags).
//
// The Open Graph title is not run through the layout's title template, so it names
// the store itself ("Sofas · Nilgiri Furniture").

import type { Metadata } from "next";
import type { CatalogProduct } from "./adminProducts";

type ShareImage = { url: string; width?: number; height?: number; type?: string; alt?: string };

/** Open Graph and Twitter tags for a shared page. */
export function shareTags({
  siteName,
  title,
  description,
  image,
}: {
  siteName: string;
  title: string;
  description: string;
  image?: string | ShareImage;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const images = image ? [typeof image === "string" ? { url: image } : image] : undefined;
  // Previews show two or three lines; a long product description is cut there.
  description = description.length > 200 ? `${description.slice(0, 197).trimEnd()}…` : description;
  return {
    openGraph: { type: "website", siteName, title, description, images },
    // The large card when there's a photo; WhatsApp follows the same rule.
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
  };
}

/** The first of these products with a photo: the preview image. */
export const firstPhoto = (products: readonly CatalogProduct[]) => products.find((p) => p.mainImageUrl)?.mainImageUrl;

/** "Sofa · Bed · Chair" from product names, short enough for a preview (about 150 characters). */
export function nameList(products: readonly CatalogProduct[], max = 4): string {
  const names = products.slice(0, max).map((p) => p.productName.trim()).filter(Boolean);
  const list = names.join(" · ");
  const more = products.length > max ? ` and ${products.length - max} more` : "";
  return (list.length > 150 ? `${list.slice(0, 147).trimEnd()}…` : list) + more;
}

/** "1 product" / "12 products". */
export const productCount = (n: number) => `${n} ${n === 1 ? "product" : "products"}`;

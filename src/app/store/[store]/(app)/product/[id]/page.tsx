import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/furniture-catalog/ProductDetail";
import { formatPrice } from "@/components/furniture-catalog/data";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";

// Same cached request as the layout, so this doesn't fetch the store twice.
async function getProduct(params: Promise<{ store: string; id: string }>) {
  const { store, id } = await params;
  const catalog = await getStoreCatalog(store);
  if (!catalog || isInactive(catalog)) return undefined;
  return catalog.products.find((p) => p.id === id);
}

// Per-product title, description and image, so a shared link previews the product.
export async function generateMetadata({ params }: PageProps<"/store/[store]/product/[id]">): Promise<Metadata> {
  const product = await getProduct(params);
  if (!product) return {};

  // The layout's title template adds the store name.
  const title = `${product.productName} — ${formatPrice(product.price)}`;
  const description = product.description || `${product.categoryName} · ${product.subcategoryName}`;
  const images = product.mainImageUrl ? [{ url: product.mainImageUrl }] : undefined;

  return {
    title,
    description,
    openGraph: { type: "website", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ProductPage({ params }: PageProps<"/store/[store]/product/[id]">) {
  const product = await getProduct(params);
  if (!product) notFound();

  // Keyed so moving between products starts at the top with fresh gallery state
  return <ProductDetail key={product.id} product={product} />;
}

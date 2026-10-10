import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/furniture-catalog/ProductDetail";
import { formatINR } from "@/components/furniture-catalog/data";
import { getCatalogProducts } from "@/lib/catalogProducts";

// Same cached request as the layout, so this doesn't fetch the products twice.
async function getProduct(id: string) {
  const products = await getCatalogProducts();
  return products.find((p) => p.id === id);
}

// Per-product title, description and image, so a shared link previews the product.
export async function generateMetadata({
  params,
}: PageProps<"/app/catalog/furniture/product/[id]">): Promise<Metadata> {
  const product = await getProduct((await params).id);
  if (!product) return {};

  const title = `${product.productName} — ${formatINR(product.price)} | MyStore`;
  const description = product.description || `${product.categoryName} · ${product.subcategoryName}`;
  const images = product.mainImageUrl ? [{ url: product.mainImageUrl }] : undefined;

  return {
    title,
    description,
    openGraph: { type: "website", title, description, images },
    twitter: { card: "summary_large_image", title, description, images },
  };
}

export default async function ProductPage({ params }: PageProps<"/app/catalog/furniture/product/[id]">) {
  const product = await getProduct((await params).id);
  if (!product) notFound();

  // Keyed so moving between products starts at the top with fresh gallery state
  return <ProductDetail key={product.id} product={product} />;
}

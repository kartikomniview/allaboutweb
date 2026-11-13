import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/furniture-catalog/ProductDetail";
import { formatPrice } from "@/components/furniture-catalog/data";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";
import { shareTags } from "@/lib/shareMeta";
import { categoryLabel } from "@/lib/taxonomy";

// Same cached request as the layout, so this doesn't fetch the store twice.
async function getProduct(params: Promise<{ store: string; id: string }>) {
  const { store, id } = await params;
  const catalog = await getStoreCatalog(store);
  if (!catalog || isInactive(catalog)) return undefined;
  const product = catalog.products.find((p) => p.id === id);
  return product && { product, storeName: catalog.store.name };
}

// Per-product title, description and image, so a shared link previews the product.
export async function generateMetadata({ params }: PageProps<"/store/[store]/product/[id]">): Promise<Metadata> {
  const found = await getProduct(params);
  if (!found) return {};
  const { product, storeName } = found;

  // The layout's title template adds the store name to the tab title.
  const title = `${product.productName} — ${formatPrice(product.price)}`;
  const kind = [product.subcategoryName, categoryLabel(product.categoryName)].filter(Boolean).join(" · ");
  const description = product.description || `${kind} at ${storeName}. Enquire on WhatsApp.`;

  return {
    title,
    description,
    ...shareTags({ siteName: storeName, title: `${title} · ${storeName}`, description, image: product.mainImageUrl }),
  };
}

export default async function ProductPage({ params }: PageProps<"/store/[store]/product/[id]">) {
  const product = (await getProduct(params))?.product;
  if (!product) notFound();

  // Keyed so moving between products starts at the top with fresh gallery state
  return <ProductDetail key={product.id} product={product} />;
}

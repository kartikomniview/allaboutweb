import type { Metadata } from "next";
import { parsePicksIds } from "@/components/furniture-catalog/shareLinks";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";

// Hand-picked products shared from the catalog or the admin panel: /picks/<id>,<id>,…
// The title and preview image say what the link opens (the layout adds the store name).
export async function generateMetadata({ params }: PageProps<"/store/[store]/picks/[ids]">): Promise<Metadata> {
  const { store, ids } = await params;
  const catalog = await getStoreCatalog(store);
  if (!catalog || isInactive(catalog)) return {};
  const wanted = parsePicksIds(ids);
  const picked = wanted.flatMap((id) => catalog.products.find((p) => p.id === id) ?? []);
  if (!picked.length) return { title: "Selected products" };

  const title =
    picked.length === 1 ? picked[0].productName : `${picked.length} products picked for you`;
  const description = picked
    .slice(0, 4)
    .map((p) => p.productName)
    .join(" · ");
  const image = picked.find((p) => p.mainImageUrl)?.mainImageUrl;
  const images = image ? [{ url: image }] : undefined;

  return {
    title,
    description,
    openGraph: { type: "website", title, description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title, description, images },
  };
}

// The catalog app (in the layout) reads the products from the URL and shows them.
export default function PicksPage() {
  return null;
}

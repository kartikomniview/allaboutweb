import type { Metadata } from "next";
import { parsePicksIds } from "@/components/furniture-catalog/shareLinks";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";
import { firstPhoto, nameList, shareTags } from "@/lib/shareMeta";

// Hand-picked products shared from the catalog or the admin panel: /picks/<id>,<id>,…
// The title and preview image say what the link opens (the layout adds the store name).
export async function generateMetadata({ params }: PageProps<"/store/[store]/picks/[ids]">): Promise<Metadata> {
  const { store, ids } = await params;
  const catalog = await getStoreCatalog(store);
  if (!catalog || isInactive(catalog)) return {};
  const wanted = parsePicksIds(ids);
  const picked = wanted.flatMap((id) => catalog.products.find((p) => p.id === id) ?? []);
  if (!picked.length) return { title: "Selected products" };

  const storeName = catalog.store.name;
  const title =
    picked.length === 1 ? picked[0].productName : `${picked.length} products picked for you`;
  const description = `${nameList(picked)}. From ${storeName}, enquire on WhatsApp.`;

  return {
    title,
    description,
    ...shareTags({ siteName: storeName, title: `${title} · ${storeName}`, description, image: firstPhoto(picked) }),
  };
}

// The catalog app (in the layout) reads the products from the URL and shows them.
export default function PicksPage() {
  return null;
}

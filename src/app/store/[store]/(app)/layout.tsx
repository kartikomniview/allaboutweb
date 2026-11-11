import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import FurnitureCatalogApp from "@/components/furniture-catalog/FurnitureCatalogApp";
import StoreUnavailable from "@/components/furniture-catalog/StoreUnavailable";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// The demo store is AllAboutWeb's live demo, so a shared link previews the e-catalog
// offer (image + pitch) rather than the store. Product links override this with
// their own photo and price.
const DEMO_SHARE = {
  title: "Get your own e-catalog — see the live demo",
  description:
    "No hosting, no domain — we manage everything. Just send your products and get a live catalog link with always-updated prices.",
  // JPG, not WebP: WhatsApp shows the large preview card more reliably for JPG/PNG.
  image: {
    url: "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/sharing/diwali-e-catalog.jpg",
    width: 1024,
    height: 541,
    type: "image/jpeg",
    alt: "Get your catalog & showcase your products — AllAboutWeb e-catalog",
  },
};

export async function generateMetadata({ params }: LayoutProps<"/store/[store]">): Promise<Metadata> {
  const catalog = await getStoreCatalog((await params).store);
  if (!catalog) return { title: "Store not found" };
  if (isInactive(catalog)) return { title: `${catalog.name} · Store unavailable`, robots: { index: false } };
  const { store } = catalog;

  const description =
    [store.tagline, store.category].filter(Boolean).join(" · ") || `Browse ${store.name}'s catalog and enquire on WhatsApp.`;
  const share = store.isDemo
    ? DEMO_SHARE
    : { title: store.name, description, image: store.coverImage ? { url: store.coverImage } : undefined };
  const images = share.image ? [share.image] : undefined;

  return {
    // Tab pages set just their own name: "Cart | Demo Store".
    title: { default: store.name, template: `%s | ${store.name}` },
    description,
    openGraph: { type: "website", siteName: store.name, title: share.title, description: share.description, images },
    twitter: { card: images ? "summary_large_image" : "summary", title: share.title, description: share.description, images },
  };
}

// A store's details and products come from its admin panel (Firestore) through the
// public API and are refreshed in the background every minute (see getStoreCatalog).
// The catalog lives in this layout so it stays mounted while product pages
// (`children`) open on top of it — tab, scroll and cart are kept.
export default async function StoreCatalogLayout({ children, params }: LayoutProps<"/store/[store]">) {
  const catalog = await getStoreCatalog((await params).store);
  if (!catalog) notFound();
  // Switched off by a Catalog24 admin: no products, no product pages.
  if (isInactive(catalog)) return <StoreUnavailable name={catalog.name} />;

  return (
    <div
      className={`${plusJakarta.variable} ${poppins.variable} furniture-catalog flex-1 bg-white text-[#111111] antialiased selection:bg-[#111111] selection:text-white`}
    >
      <FurnitureCatalogApp store={catalog.store} products={catalog.products}>
        {children}
      </FurnitureCatalogApp>
    </div>
  );
}

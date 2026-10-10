import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import FurnitureCatalogApp from "@/components/furniture-catalog/FurnitureCatalogApp";
import { getCatalogProducts } from "@/lib/catalogProducts";

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

const TITLE = "MyStore - Modern Designer Furniture";
const DESCRIPTION =
  "Explore MyStore's exclusive collections of modern furniture, handcrafted wooden dining sets, ergonomic chairs, and curated interior designs with up to 70% off.";

// This catalog is AllAboutWeb's live demo, so a shared link previews the e-catalog
// offer (image + pitch) rather than the demo store. The browser tab keeps the store
// title. Product links override this with their own photo and price.
const SHARE_TITLE = "This Diwali, get your own e-catalog — see the live demo";
const SHARE_DESCRIPTION =
  "No hosting, no domain — we manage everything. Just send your products and get a live catalog link with always-updated prices.";
const SHARE_IMAGE = {
  url: "https://aawsite.s3.ap-south-1.amazonaws.com/website/landing/sharing/diwali-e-catalog.webp",
  width: 1024,
  height: 541,
  type: "image/webp",
  alt: "This Diwali, get your catalog & showcase your products — AllAboutWeb e-catalog",
};

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: "AllAboutWeb",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [SHARE_IMAGE],
  },
};

// Products come from the admin panel (Firestore) through the public API and
// are refreshed in the background every minute (see getCatalogProducts).
// The catalog lives in this layout so it stays mounted while product pages
// (`children`) open on top of it — tab, scroll and saved items are kept.
export default async function FurnitureCatalogLayout({
  children,
}: LayoutProps<"/app/catalog/furniture">) {
  const products = await getCatalogProducts();

  return (
    <div
      className={`${plusJakarta.variable} ${poppins.variable} furniture-catalog flex-1 bg-white text-[#111111] antialiased selection:bg-[#111111] selection:text-white`}
    >
      <FurnitureCatalogApp products={products}>{children}</FurnitureCatalogApp>
    </div>
  );
}

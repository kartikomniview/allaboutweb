import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Poppins } from "next/font/google";
import FurnitureCatalogApp from "@/components/furniture-catalog/FurnitureCatalogApp";

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

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function FurnitureCatalogPage() {
  return (
    <div
      className={`${plusJakarta.variable} ${poppins.variable} furniture-catalog flex-1 bg-white text-[#111111] antialiased selection:bg-[#111111] selection:text-white`}
    >
      <FurnitureCatalogApp />
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import EcatalogPromo from "@/components/furniture-catalog/EcatalogPromo";

export const metadata: Metadata = {
  title: "Get an E-Catalog for your Business — AllAboutWeb",
  description:
    "Like this furniture e-catalog? Get one for your business to showcase your products and increase customer conversion.",
};

// Shown on direct visits or refreshes; soft navigation opens the modal version instead.
export default function GetEcatalogPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-xl rounded-panel border border-line bg-white p-5 shadow-sm sm:p-8">
        <EcatalogPromo headingLevel="h1" />
        <p className="mt-6 text-center text-sm">
          <Link href="/app/catalog/furniture" className="font-semibold text-primary hover:underline">
            ← Back to the furniture catalog
          </Link>
        </p>
      </div>
    </main>
  );
}

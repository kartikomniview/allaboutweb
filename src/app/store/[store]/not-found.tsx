import Link from "next/link";
import { CATALOG_SITE_URL } from "@/lib/catalogDomain";

// An unknown store subdomain (nope.catalog24.in), or a product that no longer exists.
export default function StoreNotFound() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF9F6] px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <h1 className="text-base font-bold text-[#111111]">This page isn&apos;t available</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
          The store or product you&apos;re looking for doesn&apos;t exist. If you typed the store&apos;s address, check
          the spelling.
        </p>
        <Link
          href={CATALOG_SITE_URL}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#8B5A2B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6E3D19]"
        >
          Go to Catalog24
        </Link>
      </div>
    </main>
  );
}

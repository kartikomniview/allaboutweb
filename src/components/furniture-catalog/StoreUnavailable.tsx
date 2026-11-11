import { Store } from "lucide-react";
import { CATALOG_SITE_URL } from "@/lib/catalogDomain";

// Shown on the link of a store that a Catalog24 admin has switched off.
export default function StoreUnavailable({ name }: { name: string }) {
  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-5 bg-white px-6 py-12 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-neutral-100 text-neutral-500">
        <Store className="h-7 w-7" aria-hidden />
      </span>
      <div className="max-w-sm">
        <h1 className="text-xl font-bold text-neutral-900">{name}</h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600">
          This store is currently unavailable. Please check back later.
        </p>
      </div>
      <a
        href={CATALOG_SITE_URL}
        className="inline-flex h-11 items-center rounded-md border border-neutral-200 px-5 text-sm font-semibold text-neutral-800 transition-colors hover:bg-neutral-50"
      >
        Visit Catalog24
      </a>
    </main>
  );
}

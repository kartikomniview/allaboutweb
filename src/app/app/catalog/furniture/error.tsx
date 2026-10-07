"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

// Shown when the catalog products can't be loaded from the API (and there is
// no earlier cached version of the page to fall back to).
export default function FurnitureCatalogError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center bg-[#FAF9F6] px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <h1 className="text-base font-bold text-[#111111]">We couldn&apos;t load the catalog</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-neutral-500">
          Please check your connection and try again in a moment.
        </p>
        <button
          type="button"
          onClick={() => retry()}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#8B5A2B] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6E3D19]"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Try again
        </button>
        <Link href="/" className="mt-3 inline-block text-xs font-medium text-neutral-500 hover:text-[#111111]">
          Back to AllAboutWeb
        </Link>
      </div>
    </main>
  );
}

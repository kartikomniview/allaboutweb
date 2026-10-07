"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { LIVE_CATALOG_PATH, useAdminUser } from "@/components/admin/AdminShell";
import { Card, PageHeader, SectionLabel, Skeleton } from "@/components/admin/ui";
import { listProducts } from "@/lib/adminProducts";

type Counts = { total: number; published: number; hidden: number };

function Stat({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate">{label}</dt>
      <dd className="mt-1 text-xl font-bold tabular-nums tracking-[-0.02em] text-ink">
        {value === null ? <Skeleton className="h-6 w-10" /> : value}
      </dd>
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useAdminUser();
  const name = user.email.split("@")[0];
  const [counts, setCounts] = useState<Counts | null>(null);
  const [countsError, setCountsError] = useState(false);

  useEffect(() => {
    listProducts()
      .then((products) => {
        const published = products.filter((p) => p.isActive).length;
        setCounts({ total: products.length, published, hidden: products.length - published });
      })
      .catch(() => setCountsError(true));
  }, []);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Dashboard"
        description={
          <>
            Welcome back, <span className="font-semibold text-ink">{name}</span>. Choose what you&apos;d like to
            manage.
          </>
        }
      />

      <section className="flex flex-col gap-3">
        <SectionLabel>Content</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card className="group relative flex flex-col transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(1,18,60,0.18)]">
            <div className="flex items-start gap-4 p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-tint text-primary ring-1 ring-inset ring-primary/15">
                <BookOpen className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink">
                  <Link href="/admin/ecatalog" className="after:absolute after:inset-0 focus-visible:outline-none">
                    E-Catalog
                  </Link>
                </h3>
                <p className="mt-0.5 text-sm leading-relaxed text-slate">
                  Products, prices, categories and tags shown in your furniture catalog.
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-3 gap-4 border-t border-line px-5 py-4">
              {countsError ? (
                <p className="col-span-3 text-sm text-slate">Product counts are unavailable right now.</p>
              ) : (
                <>
                  <Stat label="Products" value={counts?.total ?? null} />
                  <Stat label="Published" value={counts?.published ?? null} />
                  <Stat label="Hidden" value={counts?.hidden ?? null} />
                </>
              )}
            </dl>

            <div className="flex items-center justify-between border-t border-line bg-paper/60 px-5 py-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                Manage E-Catalog
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
              <a
                href={LIVE_CATALOG_PATH}
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 inline-flex items-center gap-1 font-medium text-slate hover:text-ink"
              >
                View live
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

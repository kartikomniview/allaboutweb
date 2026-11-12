import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findBySlug } from "@/components/furniture-catalog/categoryPath";
import { getStoreCatalog, isInactive } from "@/lib/catalogProducts";
import { categoryLabel } from "@/lib/taxonomy";

// "Sofas" or "L-Shape · Sofas" in the tab title (the layout adds the store name),
// so a shared category link says what it opens.
export async function generateMetadata({ params }: PageProps<"/store/[store]/category/[...slug]">): Promise<Metadata> {
  const { store, slug } = await params;
  const catalog = await getStoreCatalog(store);
  if (!catalog || isInactive(catalog)) return {};
  const [categorySlug = "", subSlug = ""] = slug.map((s) => {
    try {
      return decodeURIComponent(s);
    } catch {
      return s;
    }
  });

  const category = findBySlug(new Set(catalog.products.map((p) => p.categoryName)), categorySlug);
  if (!category) return {};
  const subCategory = subSlug
    ? findBySlug(
        new Set(catalog.products.filter((p) => p.categoryName === category).map((p) => p.subcategoryName)),
        subSlug,
      )
    : undefined;

  const label = categoryLabel(category);
  return { title: subCategory ? `${subCategory} · ${label}` : label };
}

// A category, or one of its product types, on the Catalog tab. The catalog app (in the
// layout) reads the category from the URL; an unknown one shows the first category.
export default async function CategoryPage({ params }: PageProps<"/store/[store]/category/[...slug]">) {
  // A category and at most one product type.
  if ((await params).slug.length > 2) notFound();
  return null;
}

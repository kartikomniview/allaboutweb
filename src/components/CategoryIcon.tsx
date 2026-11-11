import { createElement } from "react";
import type { LucideProps } from "lucide-react";
import { categoryIcon } from "@/lib/taxonomy";

/** The icon of a product category (src/lib/taxonomy.ts), or a box for unknown ones. */
export default function CategoryIcon({ category, ...props }: { category: string } & LucideProps) {
  return createElement(categoryIcon(category), props);
}

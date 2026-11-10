import { redirect } from "next/navigation";

// The catalog is now the start page, so the old Catalog-tab URL goes there. The proxy
// then moves this to the short URL on catalog24.in and yourstore.catalog24.in.
export default function CatalogTabPage() {
  redirect("/app/catalog/furniture");
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminUser } from "@/components/admin/AdminShell";
import ProductFormDrawer from "@/components/admin/ecatalog/ProductFormDrawer";
import { ProductLimitScreen, limitState } from "@/components/admin/ProductLimit";
import { createProduct, listProducts, type Product } from "@/lib/adminProducts";

// "Add product": the step-by-step flow on its own page (/admin/ecatalog/new).
// AdminShell shows it full screen, without the sidebar.
export default function NewProductPage() {
  const router = useRouter();
  // The store's products: their categories are offered in the pickers too.
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const { store } = useAdminUser();
  // Bumped by "Add another product" so the flow starts fresh.
  const [run, setRun] = useState(0);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .catch(() => {
        // The pickers still offer the predefined categories; the API still enforces the limit.
      })
      .finally(() => setLoaded(true));
  }, []);

  // A store at its product limit can't add more (the API refuses too). Checked once on
  // load: the product just added on this page doesn't swap the success screen away.
  const [startCount, setStartCount] = useState<number | null>(null);
  if (loaded && startCount === null) setStartCount(products.length);
  const limit = limitState(startCount ?? 0, store.productLimit);
  if (startCount !== null && limit.full) return <ProductLimitScreen state={limit} storeName={store.name} />;

  return (
    <ProductFormDrawer
      key={run}
      layout="page"
      product={null}
      products={products}
      onClose={() => router.replace("/admin/ecatalog")}
      onSave={async (input) => {
        const saved = await createProduct(input);
        setProducts((list) => [...list, saved]);
        return saved;
      }}
      onAddAnother={() => {
        // Re-check the limit with the products added so far.
        setStartCount(null);
        setRun((n) => n + 1);
      }}
    />
  );
}

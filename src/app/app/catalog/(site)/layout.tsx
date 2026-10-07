import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CatalogLayout({ children }: LayoutProps<"/app/catalog">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

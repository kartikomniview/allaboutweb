import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function CatalogLayout({ children }: LayoutProps<"/app/catalog">) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

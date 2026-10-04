import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingForm from "@/components/PricingForm";
import { isServiceKey } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Get the Pricing — AllAboutWeb",
  description:
    "Tell us what you need — website, e-catalog or PDF catalog — and get pricing on WhatsApp.",
};

export default async function GetPricingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { service } = await searchParams;
  const initialService = isServiceKey(service) ? service : undefined;

  return (
    <>
      <Header />
      <main className="flex-1 bg-paper">
        <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
          <div className="rounded-panel border border-line bg-white overflow-clip p-5 shadow-sm sm:p-8">
            <PricingForm
              key={initialService}
              initialService={initialService}
              headingLevel="h1"
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

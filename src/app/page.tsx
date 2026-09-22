import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Work from "@/components/Work";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Pricing from "@/components/Pricing";
import Faq from "@/components/Faq";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Work />
        <Process />
        <WhyUs />
        <Pricing />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
    </>
  );
}

import Modal from "@/components/Modal";
import PricingForm from "@/components/PricingForm";
import { isServiceKey } from "@/lib/contact";

export default async function PricingModal({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { service } = await searchParams;
  const initialService = isServiceKey(service) ? service : undefined;

  return (
    <Modal title="Get the pricing">
      <PricingForm key={initialService} initialService={initialService} />
    </Modal>
  );
}

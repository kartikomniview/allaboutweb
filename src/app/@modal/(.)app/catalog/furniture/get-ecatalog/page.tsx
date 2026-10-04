import Modal from "@/components/Modal";
import EcatalogPromo from "@/components/furniture-catalog/EcatalogPromo";

// Opens over the furniture catalog on soft navigation, keeping the catalog's state behind it.
export default function EcatalogPromoModal() {
  return (
    <Modal title="Get an E-Catalog for your business">
      <EcatalogPromo />
    </Modal>
  );
}

export const WHATSAPP_NUMBER = "918269329125";

export const PRICING_PATH = "/get-pricing";

export type ServiceKey = "website" | "ecatalog" | "pdf";

export const SERVICE_KEYS: ServiceKey[] = ["website", "ecatalog", "pdf"];

/** Detail page for each core service */
export const SERVICE_PAGES: Record<ServiceKey, string> = {
  website: "/website-services",
  ecatalog: "/e-catalog-services",
  pdf: "/pdf-services",
};

export function isServiceKey(value: unknown): value is ServiceKey {
  return typeof value === "string" && (SERVICE_KEYS as string[]).includes(value);
}

export function whatsappUrl(text?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function pricingHref(service?: ServiceKey) {
  return service ? `${PRICING_PATH}?service=${service}` : PRICING_PATH;
}

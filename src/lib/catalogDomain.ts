// catalog24.in is a second, e-catalog-only site served by this same app.
// src/proxy.ts picks the site from the request's hostname and maps its URLs onto our routes.

export const MAIN_SITE_URL = "https://allaboutw3b.in";
export const CATALOG_SITE_URL = "https://catalog24.in";

/**
 * Hostnames that get the Catalog24 site. `catalog24.localhost` is for local dev:
 * browsers resolve any *.localhost to this machine, so open http://catalog24.localhost:3000.
 */
export const CATALOG_DOMAINS = ["catalog24.in", "www.catalog24.in", "catalog24.localhost"];

/** Where the furniture demo lives on catalog24.in (it's /app/catalog/furniture on allaboutw3b.in). */
export const CATALOG_DEMO_BASE = "/furniture";

/** The internal route of the Catalog24 landing page, served at catalog24.in/. */
export const CATALOG_LANDING_ROUTE = "/catalog24";

export function isCatalogDomain(host: string | null | undefined) {
  if (!host) return false;
  const hostname = host.split(",")[0].trim().split(":")[0].toLowerCase();
  return CATALOG_DOMAINS.includes(hostname);
}

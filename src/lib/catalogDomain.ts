// catalog24.in is a second, e-catalog-only site served by this same app, and
// yourstore.catalog24.in is the furniture demo store on its own subdomain.
// src/proxy.ts picks the site from the request's hostname and maps its URLs onto our routes.

export const MAIN_SITE_URL = "https://allaboutw3b.in";
export const CATALOG_SITE_URL = "https://catalog24.in";

/**
 * Hostnames that get the Catalog24 site. `catalog24.localhost` is for local dev:
 * browsers resolve any *.localhost to this machine, so open http://catalog24.localhost:3000.
 */
export const CATALOG_DOMAINS = ["catalog24.in", "www.catalog24.in", "catalog24.localhost"];

/** Hostnames that get the furniture demo store at the root (dev: http://yourstore.catalog24.localhost:3000). */
export const DEMO_STORE_DOMAINS = ["yourstore.catalog24.in", "yourstore.catalog24.localhost"];

/** Where the furniture demo lives on catalog24.in (it's /app/catalog/furniture on allaboutw3b.in). */
export const CATALOG_DEMO_BASE = "/furniture";

/** The internal route of the Catalog24 landing page, served at catalog24.in/. */
export const CATALOG_LANDING_ROUTE = "/catalog24";

const hostnameOf = (host: string) => host.split(",")[0].trim().split(":")[0].toLowerCase();

export function isCatalogDomain(host: string | null | undefined) {
  return !!host && CATALOG_DOMAINS.includes(hostnameOf(host));
}

export function isDemoStoreDomain(host: string | null | undefined) {
  return !!host && DEMO_STORE_DOMAINS.includes(hostnameOf(host));
}

/** The Catalog24 site's origin as seen from the browser: catalog24.localhost in dev. */
export function catalogSiteOriginFor(location: { protocol: string; port: string }) {
  if (process.env.NODE_ENV !== "development") return CATALOG_SITE_URL;
  return `${location.protocol}//catalog24.localhost${location.port ? `:${location.port}` : ""}`;
}

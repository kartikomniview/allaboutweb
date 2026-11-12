// catalog24.in is a second, e-catalog-only site served by this same app. Every
// registered store has its own subdomain: "Demo Store" -> demostore.catalog24.in.
// src/proxy.ts picks the site from the request's hostname and maps its URLs onto our routes.

export const MAIN_SITE_URL = "https://allaboutw3b.in";
export const CATALOG_SITE_URL = "https://catalog24.in";
const CATALOG_ROOT_DOMAIN = "catalog24.in";

/**
 * Hostnames that get the Catalog24 site. `catalog24.localhost` is for local dev:
 * browsers resolve any *.localhost to this machine, so open http://catalog24.localhost:3000.
 */
export const CATALOG_DOMAINS = ["catalog24.in", "www.catalog24.in", "catalog24.localhost"];

/**
 * The Catalog24 favicon, for every Catalog24 page (landing, admin, store catalogs).
 * A segment's `icons` replaces the AllAboutWeb src/app/icon.png and apple-icon.png.
 */
export const CATALOG_ICONS = { icon: { url: "/catalog24/favicon.webp", type: "image/webp", sizes: "128x128" } };

/** The store that holds the original demo products (demo.catalog24.in). */
export const DEMO_STORE_SLUG = "demo";

/** The old demo subdomain, now an alias of the demo store. */
export const LEGACY_DEMO_SUBDOMAIN = "yourstore";

/** Where the demo store is also shown on catalog24.in (it's /app/catalog/furniture on allaboutw3b.in). */
export const CATALOG_DEMO_BASE = "/furniture";

/** The internal route of the Catalog24 landing page, served at catalog24.in/. */
export const CATALOG_LANDING_ROUTE = "/catalog24";

/** The internal route of a store's catalog: /store/<slug>/... (never shown in the browser). */
export const STORE_ROUTE = "/store";

export const STORE_SLUG_RE = /^[a-z0-9]{3,30}$/;

const hostnameOf = (host: string) => host.split(",")[0].trim().split(":")[0].toLowerCase();

export function isCatalogDomain(host: string | null | undefined) {
  return !!host && CATALOG_DOMAINS.includes(hostnameOf(host));
}

/**
 * The store subdomain in a hostname, or null: demostore.catalog24.in, and in dev
 * demostore.localhost or demostore.catalog24.localhost.
 */
export function storeSubdomainOf(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = hostnameOf(host);
  for (const root of [CATALOG_ROOT_DOMAIN, "catalog24.localhost", "localhost"]) {
    if (!hostname.endsWith(`.${root}`)) continue;
    const sub = hostname.slice(0, -root.length - 1);
    if (sub === "www" || sub === "catalog24" || sub.includes(".")) return null;
    return sub === LEGACY_DEMO_SUBDOMAIN || STORE_SLUG_RE.test(sub) ? sub : null;
  }
  return null;
}

/** The Catalog24 site's origin as seen from the browser: catalog24.localhost in dev. */
export function catalogSiteOriginFor(location: { protocol: string; port: string }) {
  if (process.env.NODE_ENV !== "development") return CATALOG_SITE_URL;
  return `${location.protocol}//catalog24.localhost${location.port ? `:${location.port}` : ""}`;
}

/** A store's public catalog URL: https://demostore.catalog24.in (dev: http://demostore.localhost:3000). */
export function storeUrlFor(slug: string, location?: { protocol: string; port: string }) {
  if (process.env.NODE_ENV !== "development" || !location) return `https://${slug}.${CATALOG_ROOT_DOMAIN}`;
  return `${location.protocol}//${slug}.localhost${location.port ? `:${location.port}` : ""}`;
}

import { NextResponse, type NextRequest } from "next/server";
import {
  CATALOG_DEMO_BASE,
  CATALOG_LANDING_ROUTE,
  CATALOG_SITE_URL,
  DEMO_STORE_SLUG,
  LEGACY_DEMO_SUBDOMAIN,
  MAIN_SITE_URL,
  STORE_ROUTE,
  STORE_SLUG_RE,
  isCatalogDomain,
  storeSubdomainOf,
} from "@/lib/catalogDomain";

// Serves three kinds of site from this app, picked by hostname:
//
// <store>.catalog24.in — a registered store's own catalog (dev: <store>.localhost:3000)
//   /, /cart, /saved, /help, /product/... → the store route (app/store/[store]/...)
//   anything else                         → the same path on catalog24.in
//   yourstore.catalog24.in (the old demo address) → demo.catalog24.in
//
// catalog24.in
//   /                     → the Catalog24 landing page (app/catalog24)
//   /furniture/...        → the demo store
//   /admin/..., /login, /register → the store owners' admin panel
//   /get-pricing          → as is (the quote form)
//   anything else         → the same path on allaboutw3b.in
//
// Any other host is the AllAboutWeb site: /app/catalog/furniture/... shows the demo
// store, and the admin panel moved to catalog24.in.

// The demo store at a path, on allaboutw3b.in and on catalog24.in.
const MAIN_DEMO_PATH = "/app/catalog/furniture";

// A store catalog's own pages, relative to its base path.
const isStorePath = (path: string) =>
  path === "/" || ["/saved", "/cart", "/help"].includes(path) || path.startsWith("/product/");

// Local dev: `npm run dev:catalog24` serves Catalog24 on every host, for testing from a
// phone on the LAN. Otherwise open http://catalog24.localhost:3000.
const FORCE_CATALOG = process.env.NODE_ENV === "development" && process.env.DEV_SITE === "catalog24";

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);
const isAdminPath = (pathname: string) => isUnder(pathname, "/admin");

const devPort = (request: NextRequest) => (request.nextUrl.port ? `:${request.nextUrl.port}` : "");

/** Another site's origin: production domains, or the matching localhost names in dev. */
function siteOrigin(request: NextRequest, site: "main" | "catalog") {
  if (process.env.NODE_ENV !== "development") return site === "main" ? MAIN_SITE_URL : CATALOG_SITE_URL;
  return site === "main" ? `http://localhost${devPort(request)}` : `http://catalog24.localhost${devPort(request)}`;
}

/** A store's origin: https://demostore.catalog24.in (dev: http://demostore.localhost:3000). */
function storeOrigin(request: NextRequest, slug: string) {
  if (process.env.NODE_ENV !== "development") return `https://${slug}.catalog24.in`;
  return `http://${slug}.localhost${devPort(request)}`;
}

const redirectTo = (url: string | URL) => NextResponse.redirect(url, 308);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Behind Amplify/CloudFront the visitor's domain may arrive in either header.
  const hosts = [request.headers.get("x-forwarded-host"), request.headers.get("host")];

  // One address for Catalog24: www.catalog24.in -> catalog24.in. The admin keeps its
  // login and device id per address, and the API only accepts calls from catalog24.in.
  if (hosts.some((h) => h?.split(",")[0].trim().split(":")[0].toLowerCase() === "www.catalog24.in")) {
    return redirectTo(new URL(pathname + search, CATALOG_SITE_URL));
  }

  const storeSlug = FORCE_CATALOG ? null : (hosts.map(storeSubdomainOf).find(Boolean) ?? null);
  const catalogHost = FORCE_CATALOG ? (hosts[1] ?? "localhost") : hosts.find(isCatalogDomain);

  const rewriteTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url);
  };

  // The demo store at a base path: <base>/cart -> /store/demo/cart. The old Catalog-tab
  // URL (<base>/catalog) is now the start page.
  const demoAt = (base: string, redirect: (path: string) => NextResponse) => {
    const sub = pathname.slice(base.length);
    if (sub === "/catalog") return redirect(base);
    if (!isStorePath(sub || "/")) return null;
    return rewriteTo(`${STORE_ROUTE}/${DEMO_STORE_SLUG}${sub === "/" ? "" : sub}`);
  };

  // The internal store route is never a public URL: send it to the store's subdomain.
  const internal = new RegExp(`^${STORE_ROUTE}/([a-z0-9]{3,30})(/.*)?$`).exec(pathname);
  if (internal && STORE_SLUG_RE.test(internal[1])) {
    return redirectTo(new URL((internal[2] ?? "/") + search, storeOrigin(request, internal[1])));
  }

  // --- A store's own subdomain ---
  if (storeSlug) {
    if (storeSlug === LEGACY_DEMO_SUBDOMAIN) {
      return redirectTo(new URL(pathname + search, storeOrigin(request, DEMO_STORE_SLUG)));
    }
    if (pathname === "/catalog") return redirectTo(new URL("/" + search, storeOrigin(request, storeSlug)));
    if (isStorePath(pathname)) {
      return rewriteTo(`${STORE_ROUTE}/${storeSlug}${pathname === "/" ? "" : pathname}`);
    }
    return redirectTo(new URL(pathname + search, siteOrigin(request, "catalog")));
  }

  // --- AllAboutWeb (any host that isn't Catalog24) ---
  if (!catalogHost) {
    // The landing page and the admin panel live on catalog24.in.
    if (isUnder(pathname, CATALOG_LANDING_ROUTE)) return redirectTo(siteOrigin(request, "catalog"));
    if (isAdminPath(pathname)) return redirectTo(new URL(pathname + search, siteOrigin(request, "catalog")));
    if (isUnder(pathname, MAIN_DEMO_PATH)) {
      const toPath = (path: string) => redirectTo(new URL(path + search, request.nextUrl));
      return demoAt(MAIN_DEMO_PATH, toPath) ?? NextResponse.next();
    }
    return NextResponse.next();
  }

  // --- catalog24.in ---
  // A redirect within the site. Built from the matched hostname, not request.nextUrl,
  // whose host can be the server's internal address. In dev, keep the host and port in use.
  const siteHost = catalogHost.split(",")[0].trim();
  const redirectWithinSite = (path: string) => {
    const origin =
      process.env.NODE_ENV === "development"
        ? `${request.nextUrl.protocol}//${siteHost}`
        : `https://${siteHost.split(":")[0]}`;
    return redirectTo(new URL(path + search, origin));
  };

  if (pathname === "/") return rewriteTo(CATALOG_LANDING_ROUTE);

  if (isUnder(pathname, CATALOG_DEMO_BASE)) {
    return demoAt(CATALOG_DEMO_BASE, redirectWithinSite) ?? redirectWithinSite(CATALOG_DEMO_BASE);
  }

  if (isUnder(pathname, MAIN_DEMO_PATH)) {
    // Old links move to the short URL (the client router follows this on soft navigations too).
    return redirectWithinSite(CATALOG_DEMO_BASE + pathname.slice(MAIN_DEMO_PATH.length));
  }

  // The store owners' admin panel.
  if (isAdminPath(pathname)) return NextResponse.next();
  if (pathname === "/login") return rewriteTo("/admin");
  if (pathname === "/register") return rewriteTo("/admin/register");

  if (pathname === "/get-pricing") return NextResponse.next();

  if (isUnder(pathname, CATALOG_LANDING_ROUTE)) return redirectWithinSite("/");

  // The rest of AllAboutWeb. With FORCE_CATALOG every host is Catalog24, so there's no
  // other site to send it to — serve it as is.
  if (FORCE_CATALOG) return NextResponse.next();
  return redirectTo(new URL(pathname + search, siteOrigin(request, "main")));
}

export const config = {
  // Skip Next.js internals and files (anything with an extension: icons, images, PDFs).
  matcher: ["/((?!_next/|__nextjs|.*\\..*).*)"],
};

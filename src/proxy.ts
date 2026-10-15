import { NextResponse, type NextRequest } from "next/server";
import {
  CATALOG_DEMO_BASE,
  CATALOG_LANDING_ROUTE,
  CATALOG_SITE_URL,
  MAIN_SITE_URL,
  isCatalogDomain,
  isDemoStoreDomain,
} from "@/lib/catalogDomain";

// Serves three sites from this app, picked by hostname:
//
// catalog24.in
//   /                → the Catalog24 landing page (app/catalog24)
//   /furniture/...   → the furniture demo (app/app/catalog/furniture/...)
//   /get-pricing     → as is (the quote form)
//   anything else    → the same path on allaboutw3b.in
//
// yourstore.catalog24.in — the furniture demo as a store of its own
//   /, /cart, /product/... → the furniture demo (app/app/catalog/furniture/...)
//   anything else          → the same path on catalog24.in
//
// Any other host is the AllAboutWeb site and is left alone.

const FURNITURE_ROUTE = "/app/catalog/furniture";

// The furniture demo's own pages, relative to its base path.
const isStorePath = (path: string) =>
  path === "/" || ["/catalog", "/cart", "/help", "/get-ecatalog"].includes(path) || path.startsWith("/product/");

// Local dev: `npm run dev:catalog24` serves Catalog24 on every host, for testing from a
// phone on the LAN. Otherwise open http://catalog24.localhost:3000.
const FORCE_CATALOG = process.env.NODE_ENV === "development" && process.env.DEV_SITE === "catalog24";

const isUnder = (pathname: string, base: string) => pathname === base || pathname.startsWith(`${base}/`);

/** Another site's origin: production domains, or the matching localhost names in dev. */
function siteOrigin(request: NextRequest, site: "main" | "catalog") {
  if (process.env.NODE_ENV !== "development") return site === "main" ? MAIN_SITE_URL : CATALOG_SITE_URL;
  const port = request.nextUrl.port ? `:${request.nextUrl.port}` : "";
  return site === "main" ? `http://localhost${port}` : `http://catalog24.localhost${port}`;
}

const redirectTo = (url: string | URL) => NextResponse.redirect(url, 308);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Behind Amplify/CloudFront the visitor's domain may arrive in either header.
  const hosts = [request.headers.get("x-forwarded-host"), request.headers.get("host")];
  const storeHost = hosts.find(isDemoStoreDomain);
  const catalogHost = FORCE_CATALOG ? (hosts[1] ?? "localhost") : hosts.find(isCatalogDomain);

  if (!storeHost && !catalogHost) {
    // The landing page only exists on catalog24.in.
    if (isUnder(pathname, CATALOG_LANDING_ROUTE)) return redirectTo(siteOrigin(request, "catalog"));
    return NextResponse.next();
  }

  const rewriteTo = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url);
  };

  // A redirect within the same site. Built from the matched hostname, not request.nextUrl,
  // whose host can be the server's internal address. In dev, keep the host and port in use.
  const siteHost = (storeHost ?? catalogHost)!.split(",")[0].trim();
  const redirectWithinSite = (path: string) => {
    const origin =
      process.env.NODE_ENV === "development"
        ? `${request.nextUrl.protocol}//${siteHost}`
        : `https://${siteHost.split(":")[0]}`;
    return redirectTo(new URL(path + search, origin));
  };

  if (storeHost) {
    if (isStorePath(pathname)) return rewriteTo(FURNITURE_ROUTE + (pathname === "/" ? "" : pathname));
    // Links to the demo under its longer paths move to the root.
    for (const base of [FURNITURE_ROUTE, CATALOG_DEMO_BASE]) {
      if (isUnder(pathname, base)) return redirectWithinSite(pathname.slice(base.length) || "/");
    }
    return redirectTo(new URL(pathname + search, siteOrigin(request, "catalog")));
  }

  if (pathname === "/") return rewriteTo(CATALOG_LANDING_ROUTE);

  if (isUnder(pathname, CATALOG_DEMO_BASE)) {
    return rewriteTo(FURNITURE_ROUTE + pathname.slice(CATALOG_DEMO_BASE.length));
  }

  if (isUnder(pathname, FURNITURE_ROUTE)) {
    // Old links move to the short URL (the client router follows this on soft navigations too).
    return redirectWithinSite(CATALOG_DEMO_BASE + pathname.slice(FURNITURE_ROUTE.length));
  }

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

// Tells a store's catalog that its owner is logged in on this browser, so it can show
// a "Manage products / Dashboard" strip. The catalogs live on their own subdomains
// (demostore.catalog24.in), which can't read the admin's localStorage on catalog24.in,
// so the store's slug goes in a cookie shared with every *.catalog24.in subdomain.
//
// It's only a hint for showing links: the admin pages still check the real session.
// Browser-only.

const COOKIE = "c24_owner";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, renewed whenever the admin checks the session

// catalog24.in and its subdomains share the cookie; in dev, catalog24.localhost and the
// stores at <slug>.catalog24.localhost (browsers refuse a cookie for all of "localhost",
// so stores opened at <slug>.localhost don't see it). Any other host keeps it to itself.
const ROOTS = ["catalog24.in", "catalog24.localhost"];
const domainAttr = () => {
  const host = window.location.hostname;
  const root = ROOTS.find((r) => host === r || host.endsWith(`.${r}`));
  return root ? `; domain=${root}` : "";
};

/** Remembers which store is logged in on this browser; null forgets it. */
export function setOwnerHint(slug: string | null): void {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  if (slug) {
    document.cookie = `${COOKIE}=${encodeURIComponent(slug)}; path=/; max-age=${MAX_AGE}; samesite=lax${domainAttr()}${secure}`;
    return;
  }
  // Clears the shared cookie and any copy kept on this host alone.
  document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax${domainAttr()}${secure}`;
  document.cookie = `${COOKIE}=; path=/; max-age=0; samesite=lax${secure}`;
}

/** The slug of the store logged in on this browser, or null. */
export function getOwnerHint(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) || null : null;
}

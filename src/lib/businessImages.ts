// Photos of each kind of shop (4:3 landscape), shown on the catalog24.in home page and
// in the "What do you sell?" picker. They live on S3, named after the label:
// catalog24/business_types/<name>.webp, e.g. "Bath & sanitaryware.webp".

import { businessTypeLabel, type BusinessTypeId } from "./taxonomy";

const BASE = "https://aawsite.s3.ap-south-1.amazonaws.com/catalog24/business_types/";

/** The photo named `name` ("Home decor", "Clothing & fabrics"). */
export const businessImage = (name: string) => `${BASE}${encodeURIComponent(name)}.webp`;

// Business types that share a photo. Upload "Clothing.webp" and "Fabrics.webp" and
// remove them here to give each its own.
const SHARED: Partial<Record<BusinessTypeId, string>> = {
  clothing: "Clothing & fabrics",
  fabrics: "Clothing & fabrics",
};

/** The photo for a business type, named after its label. */
export const businessTypeImage = (id: BusinessTypeId) => businessImage(SHARED[id] ?? businessTypeLabel(id));

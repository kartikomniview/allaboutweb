// The predefined business types, categories and subcategories of Catalog24.
//
// - A store picks one or more business types at sign-up (Store settings can
//   change them). The admin category picker and the AI photo detection offer
//   the categories of those types first.
// - Products may also use a category that isn't listed here (added by the owner
//   or suggested by the AI). The public catalog shows whatever categories the
//   store's products use, so nothing here limits what a store can sell.
// - `name` is what's stored on a product (categoryName); `label` is shown. Never
//   rename a `name` once products use it. The furniture names predate stores.
//
// The business type ids are mirrored in backend-api/src/stores.mjs (BUSINESS_TYPE_IDS).

import {
  AirVent,
  Amphora,
  Image,
  Archive,
  Armchair,
  Bath,
  BedDouble,
  Blinds,
  BrickWall,
  Coffee,
  CookingPot,
  DoorClosed,
  Fan,
  Flame,
  Flower2,
  Footprints,
  Gem,
  Headphones,
  Lamp,
  LampCeiling,
  LampWallUp,
  Laptop,
  Layers,
  Lightbulb,
  Package,
  Refrigerator,
  Scissors,
  Shirt,
  Snowflake,
  Baby,
  Venus,
  Moon,
  Smartphone,
  Sofa,
  Sparkles,
  Sun,
  Table2,
  Tv,
  UtensilsCrossed,
  Wallpaper,
  type LucideIcon,
} from "lucide-react";
import FabricRollIcon from "@/components/icons/FabricRollIcon";
import FloorTilesIcon from "@/components/icons/FloorTilesIcon";

export const BUSINESS_TYPES = [
  { id: "furniture", label: "Furniture" },
  { id: "decor", label: "Home decor" },
  { id: "lighting", label: "Lighting" },
  { id: "flooring", label: "Flooring" },
  { id: "curtains", label: "Curtains & blinds" },
  { id: "fabrics", label: "Fabrics" },
  { id: "clothing", label: "Clothing" },
  { id: "electronics", label: "Electronics" },
] as const;

export type BusinessTypeId = (typeof BUSINESS_TYPES)[number]["id"];

const BUSINESS_TYPE_IDS: readonly string[] = BUSINESS_TYPES.map((t) => t.id);
export const isBusinessType = (v: unknown): v is BusinessTypeId =>
  typeof v === "string" && BUSINESS_TYPE_IDS.includes(v);

export const businessTypeLabel = (id: string) => BUSINESS_TYPES.find((t) => t.id === id)?.label ?? id;

// Stores created before business types existed (the Demo store) sell furniture.
export const DEFAULT_BUSINESS_TYPES: BusinessTypeId[] = ["furniture"];

/** The valid business types in a raw API value, in the order of BUSINESS_TYPES. */
export function toBusinessTypes(raw: unknown): BusinessTypeId[] {
  if (!Array.isArray(raw)) return [...DEFAULT_BUSINESS_TYPES];
  return BUSINESS_TYPES.map((t) => t.id).filter((id) => raw.includes(id));
}

export type TaxonomyCategory = {
  name: string;
  label: string;
  icon: LucideIcon;
  businessType: BusinessTypeId;
  /** Thumbnail in public/ (furniture only; other categories use a product photo). */
  image?: string;
  subcategories: { name: string; image?: string }[];
};

// Thumbnail for a furniture subcategory: public/e-catalog/subcategories/<slug>.webp,
// e.g. "Diwan & Daybed" -> diwan-daybed.webp. Drop a file there to add one.
export const subcategoryImage = (name: string) =>
  `/e-catalog/subcategories/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}.webp`;

type Def = [name: string, label: string, icon: LucideIcon, subcategories: string[], image?: string];

const FURNITURE: Def[] = [
  [
    "Sofa",
    "Sofas",
    Sofa,
    ["L-Shape Sofa", "3-Seater Sofa", "2-Seater Sofa", "Diwan & Daybed", "Sofa Cum Bed", "Recliner Sofa", "Sofa Set"],
    "/e-catalog/highlights/sofas.webp",
  ],
  [
    "Wardrobe",
    "Wardrobes",
    DoorClosed,
    ["2-Door Wardrobe", "3-Door Wardrobe", "4-Door Wardrobe", "Sliding Door Wardrobe", "Kids Wardrobe"],
    "/e-catalog/highlights/wardrobes.webp",
  ],
  [
    "Dresser",
    "Dressers",
    Archive,
    ["Dressing Table with Mirror", "Chest of Drawers", "Vanity Table with Stool", "Wall-Mounted Dresser"],
    "/e-catalog/highlights/dresser.webp",
  ],
  [
    "Bed",
    "Beds",
    BedDouble,
    ["King Size Bed", "Queen Size Bed", "Hydraulic Storage Bed", "Single Bed", "Four Poster Bed", "Bunk Bed"],
    "/e-catalog/highlights/beds.webp",
  ],
  [
    "Dining",
    "Dining",
    UtensilsCrossed,
    ["2-Seater Dining Set", "4-Seater Dining Set", "6-Seater Dining Set", "8-Seater Dining Set", "Dining Bench", "Bar Stool"],
    "/e-catalog/highlights/dining.webp",
  ],
  [
    "CenterTable",
    "Center Tables",
    Coffee,
    ["Rectangular Center Table", "Round Center Table", "Nesting Tables", "Storage Center Table", "Lift-Top Center Table"],
    "/e-catalog/highlights/tables.webp",
  ],
  [
    "Chair",
    "Chairs",
    Armchair,
    ["Living Room Armchair", "Lounge Armchair", "Accent Chair", "Dining Chair", "Study & Office Chair", "Rocking Chair"],
    "/e-catalog/highlights/chair.webp",
  ],
  ["TV Unit", "TV Units", Table2, ["Wall-Mounted TV Unit", "Floor TV Unit", "TV Cabinet with Storage"]],
  ["Shoe Rack", "Shoe Racks", Footprints, ["Open Shoe Rack", "Shoe Cabinet", "Shoe Rack with Seat"]],
];

const DECOR: Def[] = [
  ["Wall Decor", "Wall Decor", Image, ["Wall Art & Paintings", "Wall Clocks", "Mirrors", "Wall Shelves", "Wall Hangings"]],
  ["Vases & Planters", "Vases & Planters", Amphora, ["Flower Vases", "Indoor Planters", "Hanging Planters", "Plant Stands"]],
  ["Showpieces", "Showpieces", Gem, ["Figurines & Idols", "Sculptures", "Decorative Bowls", "Brass & Metal Decor"]],
  ["Cushions & Throws", "Cushions & Throws", Sofa, ["Cushion Covers", "Filled Cushions", "Throws & Blankets"]],
  ["Candles & Fragrance", "Candles & Fragrance", Flame, ["Candles", "Candle Holders", "Diffusers", "Diyas & Lanterns"]],
  ["Table Decor", "Table Decor", Coffee, ["Table Runners", "Trays & Coasters", "Photo Frames", "Desk Decor"]],
  ["Artificial Plants", "Artificial Plants", Flower2, ["Artificial Flowers", "Artificial Plants", "Bonsai & Succulents"]],
];

const LIGHTING: Def[] = [
  ["Ceiling Lights", "Ceiling Lights", LampCeiling, ["Chandeliers", "Pendant Lights", "Flush Mount Lights", "Ceiling Fan Lights"]],
  ["Wall Lights", "Wall Lights", LampWallUp, ["Wall Sconces", "Picture Lights", "Mirror Lights", "Bracket Lights"]],
  ["Table & Floor Lamps", "Table & Floor Lamps", Lamp, ["Table Lamps", "Floor Lamps", "Study Lamps", "Bedside Lamps"]],
  ["Outdoor Lights", "Outdoor Lights", Sun, ["Garden Lights", "Gate Lights", "Solar Lights", "Flood Lights"]],
  ["LED & Strip Lights", "LED & Strip Lights", Lightbulb, ["LED Bulbs", "LED Panels", "Strip Lights", "Spot Lights"]],
  ["Decorative Lights", "Decorative Lights", Sparkles, ["Fairy & String Lights", "Lanterns", "Festive Lights", "Night Lamps"]],
];

const FLOORING: Def[] = [
  ["Flooring", "Flooring", FloorTilesIcon, ["Wooden Flooring", "Laminate Flooring", "Vinyl Flooring", "Tiles", "Artificial Grass"]],
  ["Carpets & Rugs", "Carpets & Rugs", Layers, ["Area Rugs", "Runners", "Wall-to-Wall Carpet", "Kids Rugs"]],
  ["Doormats", "Doormats", Footprints, ["Indoor Doormats", "Outdoor Doormats", "Anti-Slip Mats"]],
];

const CURTAINS: Def[] = [
  ["Curtains", "Curtains", Blinds, ["Window Curtains", "Door Curtains", "Sheer Curtains", "Blackout Curtains"]],
  ["Blinds", "Blinds", Blinds, ["Roller Blinds", "Roman Blinds", "Zebra Blinds", "Vertical Blinds", "Wooden Blinds"]],
  ["Wallpaper", "Wallpaper", Wallpaper, ["Wallpaper Rolls", "3D Wall Panels", "Wall Stickers", "Kids Wallpaper"]],
  ["Curtain Accessories", "Curtain Accessories", BrickWall, ["Curtain Rods & Tracks", "Tie-Backs", "Curtain Rings & Hooks"]],
];

const FABRICS: Def[] = [
  ["Upholstery Fabric", "Upholstery Fabric", Sofa, ["Velvet", "Linen", "Leatherette", "Jacquard", "Suede"]],
  ["Curtain Fabric", "Curtain Fabric", Blinds, ["Sheer Fabric", "Blackout Fabric", "Printed Fabric", "Plain Fabric"]],
  ["Dress Material", "Dress Material", FabricRollIcon, ["Cotton", "Silk", "Georgette", "Rayon", "Unstitched Suits"]],
  ["Bed Linen", "Bed Linen", BedDouble, ["Bedsheets", "Comforters & Quilts", "Pillow Covers", "Bed Covers"]],
  ["Bath Linen", "Bath Linen", Bath, ["Bath Towels", "Hand Towels", "Bath Mats"]],
  ["Table Linen", "Table Linen", Scissors, ["Table Covers", "Table Mats", "Napkins"]],
];

// Ready-made garments (raw cloth is under FABRICS).
const CLOTHING: Def[] = [
  ["Men's Wear", "Men's Wear", Shirt, ["Shirts", "T-Shirts", "Trousers & Jeans", "Kurtas & Ethnic Wear", "Suits & Blazers"]],
  [
    "Women's Wear",
    "Women's Wear",
    Venus,
    ["Sarees", "Kurtis & Kurtas", "Salwar Suits", "Lehengas", "Tops & Dresses", "Jeans & Trousers"],
  ],
  ["Kids' Wear", "Kids' Wear", Baby, ["Boys' Clothing", "Girls' Clothing", "Infant Wear", "Kids' Ethnic Wear"]],
  ["Winter Wear", "Winter Wear", Snowflake, ["Jackets", "Sweaters", "Shawls & Stoles", "Thermals"]],
  ["Innerwear & Nightwear", "Innerwear & Nightwear", Moon, ["Innerwear", "Nightwear", "Loungewear"]],
];

const ELECTRONICS: Def[] = [
  ["TVs", "TVs", Tv, ["LED TVs", "Smart TVs", "4K TVs", "TV Accessories"]],
  ["Home Appliances", "Home Appliances", Refrigerator, ["Refrigerators", "Washing Machines", "Air Conditioners", "Water Purifiers", "Geysers"]],
  ["Kitchen Appliances", "Kitchen Appliances", CookingPot, ["Mixer Grinders", "Microwave Ovens", "Induction Cooktops", "Chimneys", "Kettles & Toasters"]],
  ["Fans & Coolers", "Fans & Coolers", Fan, ["Ceiling Fans", "Table & Pedestal Fans", "Air Coolers", "Exhaust Fans"]],
  ["Audio", "Audio", Headphones, ["Speakers", "Soundbars & Home Theatre", "Headphones & Earbuds"]],
  ["Mobiles & Accessories", "Mobiles & Accessories", Smartphone, ["Smartphones", "Chargers & Cables", "Power Banks", "Covers & Screen Guards"]],
  ["Computers", "Computers", Laptop, ["Laptops", "Desktops", "Monitors", "Printers", "Accessories"]],
  ["Air Purifiers", "Air Purifiers & Heaters", AirVent, ["Air Purifiers", "Room Heaters", "Dehumidifiers"]],
];

const DEFS: Record<BusinessTypeId, Def[]> = {
  furniture: FURNITURE,
  decor: DECOR,
  lighting: LIGHTING,
  flooring: FLOORING,
  curtains: CURTAINS,
  fabrics: FABRICS,
  clothing: CLOTHING,
  electronics: ELECTRONICS,
};

/** Every predefined category, in display order (business type, then category). */
export const TAXONOMY: TaxonomyCategory[] = BUSINESS_TYPES.flatMap(({ id }) =>
  DEFS[id].map(([name, label, icon, subcategories, image]) => ({
    name,
    label,
    icon,
    businessType: id,
    image,
    subcategories: subcategories.map((sub) => ({
      name: sub,
      // Only furniture has subcategory thumbnails (public/e-catalog/subcategories/).
      image: id === "furniture" ? subcategoryImage(sub) : undefined,
    })),
  })),
);

const key = (s: string) => s.trim().toLowerCase();
const BY_NAME = new Map(TAXONOMY.map((c) => [key(c.name), c]));

/** The predefined category with this name (case-insensitive), if any. */
export const findCategory = (name: string) => BY_NAME.get(key(name));

export const categoryLabel = (name: string) => findCategory(name)?.label ?? name;
export const categoryIcon = (name: string): LucideIcon => findCategory(name)?.icon ?? Package;
export const isFurnitureCategory = (name: string) => findCategory(name)?.businessType === "furniture";

/** The predefined categories of these business types (all of them when none are given). */
export function categoriesFor(types: readonly string[]): TaxonomyCategory[] {
  return types.length ? TAXONOMY.filter((c) => types.includes(c.businessType)) : TAXONOMY;
}

/** Category names in display order: predefined ones first (taxonomy order), then the rest A–Z. */
export function sortCategoryNames(names: Iterable<string>): string[] {
  const order = new Map(TAXONOMY.map((c, i) => [c.name, i]));
  return [...new Set(names)].sort((a, b) => {
    const ia = order.get(a) ?? Infinity;
    const ib = order.get(b) ?? Infinity;
    return ia !== ib ? ia - ib : a.localeCompare(b);
  });
}

export const CUSTOM_GROUP = "Your categories";

/** A category as offered in the admin picker and sent to the AI detection. */
export type PickerCategory = {
  name: string;
  label: string;
  icon: LucideIcon;
  image?: string;
  /** Business type label, or CUSTOM_GROUP for the store's own categories. */
  group: string;
  subcategories: { name: string; image?: string }[];
};

/**
 * The categories a store works with: the predefined categories of its business
 * types, plus every category and subcategory its products already use (custom
 * ones, or predefined ones from another business type).
 */
export function storeCategories(
  types: readonly string[],
  products: readonly { categoryName: string; subcategoryName: string }[],
): PickerCategory[] {
  const result: PickerCategory[] = categoriesFor(types).map((c) => ({
    name: c.name,
    label: c.label,
    icon: c.icon,
    image: c.image,
    group: businessTypeLabel(c.businessType),
    subcategories: [...c.subcategories],
  }));
  const byName = new Map(result.map((c) => [key(c.name), c]));

  for (const p of products) {
    const name = p.categoryName.trim();
    if (!name) continue;
    let category = byName.get(key(name));
    if (!category) {
      const known = findCategory(name);
      category = known
        ? {
            name: known.name,
            label: known.label,
            icon: known.icon,
            image: known.image,
            group: businessTypeLabel(known.businessType),
            subcategories: [...known.subcategories],
          }
        : { name, label: name, icon: Package, group: CUSTOM_GROUP, subcategories: [] };
      result.push(category);
      byName.set(key(name), category);
    }
    const sub = p.subcategoryName.trim();
    if (sub && !category.subcategories.some((s) => key(s.name) === key(sub))) {
      category.subcategories.push({ name: sub });
    }
  }
  return result;
}

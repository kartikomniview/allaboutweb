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
  BatteryCharging,
  BedDouble,
  Blinds,
  BrickWall,
  Cable,
  Camera,
  Coffee,
  CookingPot,
  Crown,
  Diamond,
  DoorClosed,
  Droplets,
  Dumbbell,
  Eye,
  Fan,
  Flame,
  Flower2,
  Footprints,
  Gamepad2,
  Gem,
  Glasses,
  HardDrive,
  Headphones,
  Lamp,
  LampCeiling,
  LampWallUp,
  Laptop,
  Layers,
  Lightbulb,
  Package,
  Refrigerator,
  ScanEye,
  Scissors,
  Shield,
  Shirt,
  ShoppingBag,
  ShowerHead,
  Snowflake,
  Baby,
  Venus,
  Moon,
  Smartphone,
  SmartphoneCharging,
  Sofa,
  Sparkles,
  Sun,
  Table2,
  Toilet,
  Tv,
  UtensilsCrossed,
  Wallet,
  Wallpaper,
  Watch,
  Wrench,
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
  { id: "bath", label: "Bath & sanitaryware" },
  { id: "clothing", label: "Clothing" },
  { id: "footwear", label: "Footwear" },
  { id: "jewellery", label: "Jewellery & accessories" },
  { id: "optical", label: "Optical & eyewear" },
  { id: "electronics", label: "Electronics" },
  { id: "mobiles", label: "Mobiles & accessories" },
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
  /** Other words shoppers and owners use for these products (for the picker's search). */
  keywords: string[];
};

// Other names for each category's products, so typing "jug", "almirah" or "parda"
// in the category picker finds it. Lowercase; matched as substrings.
const KEYWORDS: Record<string, string> = {
  Sofa: "couch settee divan sectional recliner",
  Wardrobe: "almirah cupboard closet armoire",
  Dresser: "dressing table vanity drawers chest mirror",
  Bed: "cot palang bunk mattress",
  Dining: "dining table bench stool",
  CenterTable: "coffee table tea table centre table",
  Chair: "armchair seat kursi office chair stool",
  "TV Unit": "tv stand entertainment unit media console",
  "Shoe Rack": "shoe stand footwear",
  "Wall Decor": "painting frame art clock mirror shelf hanging",
  "Vases & Planters": "vase jug pitcher pot planter urn matka",
  Showpieces: "showpiece figurine idol statue sculpture bowl brass ornament decor",
  "Cushions & Throws": "cushion pillow throw blanket",
  "Candles & Fragrance": "candle diya lantern diffuser fragrance incense",
  "Table Decor": "tray coaster runner photo frame desk",
  "Artificial Plants": "fake plant artificial flower bonsai",
  "Ceiling Lights": "chandelier jhoomar pendant hanging light",
  "Wall Lights": "sconce wall lamp",
  "Table & Floor Lamps": "lamp study lamp bedside",
  "Outdoor Lights": "garden light gate light solar flood",
  "LED & Strip Lights": "bulb led panel strip spot light",
  "Decorative Lights": "fairy lights string lights lantern festive night lamp",
  Flooring: "floor tiles laminate vinyl wooden grass",
  "Carpets & Rugs": "carpet rug dari durrie runner",
  Doormats: "mat doormat",
  Curtains: "parda drape curtain",
  Blinds: "blind roller roman zebra",
  Wallpaper: "wallpaper wall panel sticker",
  "Curtain Accessories": "rod track hook ring tie back",
  "Upholstery Fabric": "upholstery cloth velvet leatherette",
  "Curtain Fabric": "curtain cloth sheer blackout",
  "Dress Material": "cloth suit piece cotton silk",
  "Bed Linen": "bedsheet chadar quilt comforter razai pillow cover",
  "Bath Linen": "towel bath mat",
  "Table Linen": "tablecloth table cover napkin",
  "Men's Wear": "shirt tshirt trouser jeans kurta blazer suit men",
  "Women's Wear": "saree sari kurti suit lehenga dress top women",
  "Kids' Wear": "kids children baby boys girls",
  "Winter Wear": "jacket sweater shawl stole thermal woollen",
  "Innerwear & Nightwear": "innerwear nightwear pyjama night suit lounge",
  TVs: "tv television led smart",
  "Home Appliances": "fridge refrigerator washing machine ac air conditioner purifier geyser",
  "Kitchen Appliances": "mixer grinder microwave oven induction chimney kettle toaster",
  "Fans & Coolers": "fan cooler exhaust",
  Audio: "speaker soundbar home theatre headphones earbuds",
  "Mobiles & Accessories": "mobile phone smartphone charger cable power bank cover",
  Computers: "laptop desktop monitor printer keyboard mouse computer",
  "Air Purifiers": "air purifier heater dehumidifier",
  "Cameras & CCTV": "camera cctv security dslr webcam doorbell",
  Gaming: "gaming console playstation xbox controller joystick",
  Sportswear: "sportswear activewear gym track suit lower jersey",
  // Bath & sanitaryware
  "Faucets & Taps": "tap nal tonti faucet mixer bib cock",
  Showers: "shower hand shower health faucet jet spray",
  "Wash Basins": "wash basin washbasin sink",
  Toilets: "toilet commode wc western indian flush cistern seat cover",
  "Bath Accessories": "towel rod soap dish hook shelf corner tumbler holder",
  "Bathroom Cabinets & Mirrors": "bathroom cabinet bathroom mirror vanity",
  "Kitchen Sinks": "kitchen sink steel sink quartz",
  "Bathtubs & Enclosures": "bathtub tub shower enclosure glass partition",
  "Plumbing Fittings": "angle valve drain jali connection pipe fitting",
  // Footwear
  "Men's Footwear": "shoes joota chappal sandal floater slipper loafer mojari men",
  "Women's Footwear": "heels sandal bellies jutti kolhapuri chappal sneakers women",
  "Kids' Footwear": "kids shoes school shoes booties",
  "Sports Shoes": "sports shoes running sneakers studs",
  "Footwear Care": "socks insole polish shoe care",
  // Jewellery & accessories ("neckless" and "breslet" are common spellings)
  "Necklaces & Chains": "necklace neckless haar chain pendant locket mangalsutra choker",
  Earrings: "earring jhumka jhumki bali tops stud hoop",
  Rings: "ring angoothi bichiya toe ring band",
  "Bangles & Bracelets": "bangle kada kangan chudi bracelet breslet",
  "Jewellery Sets": "bridal set kundan polki temple jewellery",
  "Anklets & Body Jewellery": "anklet payal pajeb nose pin nath maang tikka kamarbandh",
  Watches: "watch ghadi wrist watch analog digital",
  "Bags & Wallets": "bag purse handbag clutch sling backpack wallet",
  "Belts & Accessories": "belt hair clip hairband cufflink keychain brooch",
  // Optical & eyewear
  Eyeglasses: "specs spectacles chashma frame eyeglasses",
  Sunglasses: "sunglasses goggles shades chashma",
  "Computer & Reading Glasses": "blue cut computer glasses reading readers",
  "Contact Lenses": "contact lens coloured lens",
  "Spectacle Lenses": "lens lenses power glass photochromic",
  "Eyewear Accessories": "case cover cleaner cord solution",
  // Mobiles & accessories
  "Mobile Phones": "mobile phone smartphone android iphone keypad",
  "Cases & Covers": "cover case back cover flip pouch",
  "Screen Guards": "screen guard tempered glass protector",
  "Chargers & Cables": "charger adapter cable data cable type c usb",
  "Power Banks": "power bank portable charger battery",
  "Earphones & Headsets": "earphones earbuds tws neckband headphones headset",
  "Smartwatches & Bands": "smartwatch smart watch fitness band strap",
  "Holders & Stands": "holder stand car mount selfie stick tripod ring light",
  "Memory & Storage": "memory card sd card pendrive otg",
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
  [
    "Men's Wear",
    "Men's Wear",
    Shirt,
    ["Shirts", "T-Shirts", "Trousers & Jeans", "Kurtas & Ethnic Wear", "Suits & Blazers", "Shorts & Track Pants"],
  ],
  [
    "Women's Wear",
    "Women's Wear",
    Venus,
    [
      "Sarees",
      "Kurtis & Kurtas",
      "Salwar Suits",
      "Lehengas",
      "Tops & Dresses",
      "Jeans & Trousers",
      "Co-ord Sets",
      "Leggings & Palazzos",
    ],
  ],
  [
    "Kids' Wear",
    "Kids' Wear",
    Baby,
    ["Boys' Clothing", "Girls' Clothing", "Infant Wear", "Kids' Ethnic Wear", "School Uniforms"],
  ],
  ["Winter Wear", "Winter Wear", Snowflake, ["Jackets", "Sweaters", "Shawls & Stoles", "Thermals"]],
  ["Innerwear & Nightwear", "Innerwear & Nightwear", Moon, ["Innerwear", "Nightwear", "Loungewear"]],
  ["Sportswear", "Sportswear", Dumbbell, ["Track Suits", "Sports T-Shirts", "Track Pants", "Gym Wear"]],
];

const ELECTRONICS: Def[] = [
  ["TVs", "TVs", Tv, ["LED TVs", "Smart TVs", "4K TVs", "TV Accessories"]],
  ["Home Appliances", "Home Appliances", Refrigerator, ["Refrigerators", "Washing Machines", "Air Conditioners", "Water Purifiers", "Geysers"]],
  ["Kitchen Appliances", "Kitchen Appliances", CookingPot, ["Mixer Grinders", "Microwave Ovens", "Induction Cooktops", "Chimneys", "Kettles & Toasters"]],
  ["Fans & Coolers", "Fans & Coolers", Fan, ["Ceiling Fans", "Table & Pedestal Fans", "Air Coolers", "Exhaust Fans"]],
  ["Audio", "Audio", Headphones, ["Speakers", "Soundbars & Home Theatre", "Headphones & Earbuds"]],
  // A mobile shop gets the detailed MOBILES categories; this one stays for electronics stores.
  ["Mobiles & Accessories", "Mobiles & Accessories", Smartphone, ["Smartphones", "Chargers & Cables", "Power Banks", "Covers & Screen Guards"]],
  ["Computers", "Computers", Laptop, ["Laptops", "Desktops", "Monitors", "Printers", "Tablets", "Accessories"]],
  ["Air Purifiers", "Air Purifiers & Heaters", AirVent, ["Air Purifiers", "Room Heaters", "Dehumidifiers"]],
  ["Cameras & CCTV", "Cameras & CCTV", Camera, ["Digital Cameras", "CCTV Cameras", "Action Cameras", "Video Doorbells"]],
  ["Gaming", "Gaming", Gamepad2, ["Consoles", "Controllers", "Gaming Accessories"]],
];

const BATH: Def[] = [
  ["Faucets & Taps", "Faucets & Taps", Droplets, ["Basin Taps", "Sink Taps", "Wall Mixers", "Bib Cocks", "Sensor Taps"]],
  ["Showers", "Showers", ShowerHead, ["Overhead Showers", "Hand Showers", "Health Faucets", "Rain Showers", "Shower Panels"]],
  ["Wash Basins", "Wash Basins", Bath, ["Table-Top Basins", "Wall-Hung Basins", "Pedestal Basins", "Counter Basins"]],
  ["Toilets", "Toilets", Toilet, ["Wall-Hung WC", "Floor-Mounted WC", "Indian Toilets", "Toilet Seat Covers", "Flush Tanks"]],
  [
    "Bath Accessories",
    "Bath Accessories",
    Sparkles,
    ["Towel Rods & Rings", "Soap Dishes", "Robe Hooks", "Corner Shelves", "Tumbler Holders", "Paper Holders"],
  ],
  ["Bathroom Cabinets & Mirrors", "Bathroom Cabinets & Mirrors", Archive, ["Mirror Cabinets", "Bathroom Mirrors", "Vanity Units"]],
  ["Kitchen Sinks", "Kitchen Sinks", CookingPot, ["Single Bowl Sinks", "Double Bowl Sinks", "Sinks with Drainboard", "Quartz Sinks"]],
  ["Bathtubs & Enclosures", "Bathtubs & Enclosures", Bath, ["Bathtubs", "Shower Enclosures", "Shower Partitions"]],
  ["Plumbing Fittings", "Plumbing Fittings", Wrench, ["Angle Valves", "Floor Drains", "Connection Pipes", "Waste Couplings"]],
];

const FOOTWEAR: Def[] = [
  [
    "Men's Footwear",
    "Men's Footwear",
    Footprints,
    ["Formal Shoes", "Casual Shoes", "Sports Shoes", "Sandals & Floaters", "Slippers & Flip-Flops", "Mojaris"],
  ],
  [
    "Women's Footwear",
    "Women's Footwear",
    Footprints,
    ["Heels", "Flats & Bellies", "Sandals", "Juttis & Kolhapuris", "Sneakers", "Slippers"],
  ],
  ["Kids' Footwear", "Kids' Footwear", Baby, ["School Shoes", "Sports Shoes", "Sandals", "Baby Booties"]],
  ["Sports Shoes", "Sports Shoes", Dumbbell, ["Running Shoes", "Walking Shoes", "Training Shoes", "Sports Studs"]],
  ["Footwear Care", "Footwear Care", Sparkles, ["Socks", "Insoles", "Shoe Polish & Care"]],
];

const JEWELLERY: Def[] = [
  ["Necklaces & Chains", "Necklaces & Chains", Gem, ["Chains", "Necklaces", "Pendants", "Mangalsutra", "Chokers"]],
  ["Earrings", "Earrings", Diamond, ["Studs", "Jhumkas", "Hoops", "Drops & Danglers", "Ear Cuffs"]],
  ["Rings", "Rings", Diamond, ["Couple & Engagement Rings", "Cocktail Rings", "Men's Rings", "Toe Rings"]],
  ["Bangles & Bracelets", "Bangles & Bracelets", Gem, ["Bangles", "Kadas", "Bracelets", "Charm Bracelets"]],
  ["Jewellery Sets", "Jewellery Sets", Crown, ["Bridal Sets", "Necklace Sets", "Kundan & Polki", "Temple Jewellery"]],
  ["Anklets & Body Jewellery", "Anklets & Body Jewellery", Sparkles, ["Anklets", "Nose Pins & Nath", "Maang Tikka", "Kamarbandh"]],
  ["Watches", "Watches", Watch, ["Men's Watches", "Women's Watches", "Kids' Watches", "Couple Watches", "Smartwatches"]],
  ["Bags & Wallets", "Bags & Wallets", ShoppingBag, ["Handbags", "Sling Bags", "Clutches", "Backpacks", "Wallets"]],
  ["Belts & Accessories", "Belts & Accessories", Wallet, ["Belts", "Hair Accessories", "Cufflinks & Tie Pins", "Keychains"]],
];

const OPTICAL: Def[] = [
  ["Eyeglasses", "Eyeglasses", Glasses, ["Full Rim Frames", "Half Rim Frames", "Rimless Frames", "Kids' Frames"]],
  ["Sunglasses", "Sunglasses", Sun, ["Aviator", "Wayfarer", "Round", "Polarised", "Sports Sunglasses"]],
  ["Computer & Reading Glasses", "Computer & Reading Glasses", Laptop, ["Blue-Cut Glasses", "Reading Glasses", "Progressive Glasses"]],
  ["Contact Lenses", "Contact Lenses", Eye, ["Daily Disposable", "Monthly Lenses", "Coloured Lenses", "Toric Lenses"]],
  ["Spectacle Lenses", "Spectacle Lenses", ScanEye, ["Single Vision", "Bifocal", "Progressive", "Photochromic"]],
  ["Eyewear Accessories", "Eyewear Accessories", Package, ["Cases", "Lens Cleaners", "Chains & Cords", "Lens Solution"]],
];

const MOBILES: Def[] = [
  ["Mobile Phones", "Mobile Phones", Smartphone, ["Smartphones", "Feature Phones", "Refurbished Phones"]],
  ["Cases & Covers", "Cases & Covers", Shield, ["Back Covers", "Flip Covers", "Silicone Cases", "Rugged Cases", "Pouches"]],
  ["Screen Guards", "Screen Guards", Layers, ["Tempered Glass", "Privacy Glass", "Camera Lens Protectors", "Hydrogel Film"]],
  ["Chargers & Cables", "Chargers & Cables", Cable, ["Wall Chargers", "Fast Chargers", "Wireless Chargers", "Car Chargers", "USB Cables"]],
  ["Power Banks", "Power Banks", BatteryCharging, ["10000 mAh", "20000 mAh", "Wireless Power Banks", "Magnetic Power Banks"]],
  ["Earphones & Headsets", "Earphones & Headsets", Headphones, ["Wireless Earbuds", "Neckbands", "Wired Earphones", "Bluetooth Headphones"]],
  ["Smartwatches & Bands", "Smartwatches & Bands", Watch, ["Smartwatches", "Fitness Bands", "Watch Straps"]],
  ["Holders & Stands", "Holders & Stands", SmartphoneCharging, ["Car Mounts", "Desk Stands", "Selfie Sticks & Tripods", "Ring Lights"]],
  ["Memory & Storage", "Memory & Storage", HardDrive, ["Memory Cards", "Pen Drives", "OTG Adapters"]],
];

const DEFS: Record<BusinessTypeId, Def[]> = {
  furniture: FURNITURE,
  decor: DECOR,
  lighting: LIGHTING,
  flooring: FLOORING,
  curtains: CURTAINS,
  fabrics: FABRICS,
  bath: BATH,
  clothing: CLOTHING,
  footwear: FOOTWEAR,
  jewellery: JEWELLERY,
  optical: OPTICAL,
  electronics: ELECTRONICS,
  mobiles: MOBILES,
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
    keywords: KEYWORDS[name]?.split(" ") ?? [],
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
  /** Other words for its products, for the picker's search (none on custom categories). */
  keywords: string[];
};

const toPicker = (c: TaxonomyCategory): PickerCategory => ({
  name: c.name,
  label: c.label,
  icon: c.icon,
  image: c.image,
  group: businessTypeLabel(c.businessType),
  subcategories: [...c.subcategories],
  keywords: c.keywords,
});

/**
 * The predefined categories of the business types a store does NOT sell, offered as
 * suggestions while searching the category picker (e.g. "Vases & Planters" for a jug
 * in a furniture store).
 */
export function otherCategories(types: readonly string[]): PickerCategory[] {
  return types.length ? TAXONOMY.filter((c) => !types.includes(c.businessType)).map(toPicker) : [];
}

/**
 * The categories a store works with: the predefined categories of its business
 * types, plus every category and subcategory its products already use (custom
 * ones, or predefined ones from another business type).
 */
export function storeCategories(
  types: readonly string[],
  products: readonly { categoryName: string; subcategoryName: string }[],
): PickerCategory[] {
  const result: PickerCategory[] = categoriesFor(types).map(toPicker);
  const byName = new Map(result.map((c) => [key(c.name), c]));

  for (const p of products) {
    const name = p.categoryName.trim();
    if (!name) continue;
    let category = byName.get(key(name));
    if (!category) {
      const known = findCategory(name);
      category = known
        ? toPicker(known)
        : { name, label: name, icon: Package, group: CUSTOM_GROUP, subcategories: [], keywords: [] };
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

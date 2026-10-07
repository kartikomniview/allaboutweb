// All static data for the furniture e-catalog: store details, categories,
// festive offers, home-screen content, help-centre content and WhatsApp
// message templates. Edit copy here; FurnitureCatalogApp only renders it.
// The catalog's products come from Firestore (managed in /admin/ecatalog).
// PRODUCTS below is only the starter set for the admin "Import" button.

import { RotateCcw, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';
import type { CatalogProduct } from '@/lib/adminProducts';

export type MainCategory = 'Sofa' | 'Wardrobe' | 'Dresser' | 'Bed' | 'Dining' | 'CenterTable' | 'Chair';

// Order of the category tabs on the Catalog screen (and the admin category dropdown).
export const MAIN_CATEGORIES: MainCategory[] = ['Sofa', 'Wardrobe', 'Dresser', 'Bed', 'Dining', 'CenterTable', 'Chair'];

// Display name for each category, e.g. on the Catalog screen's category switch.
export const CATEGORY_TAB_LABELS: Record<MainCategory, string> = {
  Sofa: 'Sofas',
  Wardrobe: 'Wardrobes',
  Dresser: 'Dressers',
  Bed: 'Beds',
  Dining: 'Dining',
  CenterTable: 'Center Tables',
  Chair: 'Chairs',
};

// ---------------------------------------------------------------------------
// Store details
// ---------------------------------------------------------------------------

export const STORE = {
  name: 'MyStore',
  initial: 'M',
  tagline: 'Solid Wood',
  deliveryArea: 'Local Region Delivery',
  deliveryPerk: 'Free Doorstep Assembly',
  phone: {
    display: '1800-123-4567',
    tel: '18001234567',
    hours: '10 AM - 8 PM',
  },
  showroom: {
    title: 'Showroom & Experience Center',
    address: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038',
    hours: 'Open daily: 10:30 AM to 8:30 PM',
  },
  whatsappSupport: {
    status: 'Online Now',
    replyTime: 'Avg reply: 2 mins',
    title: 'Chat with Master Carpenter',
    description:
      'Ask for real workshop timber photos, wood polish samples, custom sizes, or delivery timelines.',
  },
  warranty: {
    title: '10-Year Replacement Guarantee',
    description:
      'Every piece is built with kiln-dried seasoned hardwood. Protected by industrial anti-termite vac-treatment. Guaranteed not to bend, warp, or crack under normal household use.',
  },
};

// Strip at the very top linking back to the AllAboutWeb site.
export const AAW_PROMO = {
  text: 'Get an E-Catalog for your Business',
  whatsappMessage:
    'Hi AllAboutWeb! I saw your furniture e-catalog demo and would like an e-catalog for my business. Please share the details.',
};

export const formatINR = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

// Dummy products in the same shape as the admin panel's Firestore products
// (ProductInput + id). Also used by the admin "import starter products" action.
export const PRODUCTS: CatalogProduct[] = [
  // --- SOFA ---
  {
    id: 'sofa-1',
    productName: 'Nilgiri L-Shape Corner Sofa',
    categoryName: 'Sofa',
    subcategoryName: 'L-Shape Sofa',
    price: 42999,
    originalPrice: 56999,
    rating: 4.9,
    reviewCount: 142,
    tags: ['Most Popular'],
    colors: [
      { name: 'Warm Cream', hex: '#F0ECE1' },
      { name: 'Dark Grey', hex: '#373A40' },
      { name: 'Deep Green', hex: '#2C4A3E' }
    ],
    material: 'Comfortable Linen Fabric & Soft Spring Cushions',
    dimensions: '8 ft × 5.2 ft (Spacious 5-6 Seater)',
    woodType: 'Solid Sal Wood Inner Frame',
    stockStatus: 'Ready in Stock · Free Home Assembly',
    description: 'A roomy L-shaped sofa designed for family time and TV viewing. The long chaise can be set up on either left or right side based on your living room layout.',
    highlights: [
      'Chaise fits on both left or right side',
      'Washable fabric covers that resist tea & coffee stains',
      'Firm back support for comfortable long seating'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-2',
    productName: 'Malabar Solid Teakwood 3-Seater Sofa',
    categoryName: 'Sofa',
    subcategoryName: '3-Seater Sofa',
    price: 29999,
    originalPrice: 38999,
    rating: 4.8,
    reviewCount: 98,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Honey Polish', hex: '#9E6B47' },
      { name: 'Navy Blue', hex: '#1F3160' },
      { name: 'Warm Cream', hex: '#F0ECE1' }
    ],
    material: '100% Real Teak Wood with Thick Washable Cushions',
    dimensions: '6.5 ft Length × 2.8 ft Depth',
    woodType: 'Pure Central Province (CP) Teak Wood',
    stockStatus: 'In Stock · 3 Days Delivery',
    description: 'Classic wooden 3-seater sofa made with thick teakwood planks. Heavy, sturdy, and built to last for generations without wobbling.',
    highlights: [
      'Made from 100% pure teak wood (no plywood or MDF)',
      'Removable cushion covers with smooth zippers',
      'Termite proof and water-resistant finish'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-3',
    productName: 'Aura Compact 2-Seater Sofa (Loveseat)',
    categoryName: 'Sofa',
    subcategoryName: '2-Seater Sofa',
    price: 19499,
    originalPrice: 24999,
    rating: 4.7,
    reviewCount: 64,
    tags: ['Small Space Pick'],
    colors: [
      { name: 'Warm Mustard', hex: '#C68B59' },
      { name: 'Slate Grey', hex: '#373A40' }
    ],
    material: 'Soft Textured Fabric & Solid Wooden Legs',
    dimensions: '4.6 ft Length × 2.6 ft Depth',
    woodType: 'Solid Hardwood Frame',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A space-saving 2-person couch perfect for smaller apartments, bedroom reading corners, or home offices. Very cozy and stylish.',
    highlights: [
      'Slim arms that take less floor space',
      'Easily holds up to 250 kg body weight',
      'High ground clearance for easy broom & robot vacuum cleaning'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-4',
    productName: 'Vayu Solid Wood Daybed & Diwan',
    categoryName: 'Sofa',
    subcategoryName: 'Diwan & Daybed',
    price: 32000,
    originalPrice: 41000,
    rating: 4.6,
    reviewCount: 39,
    tags: ['Traditional'],
    colors: [
      { name: 'Natural Brown', hex: '#B87C4C' },
      { name: 'Cream White', hex: '#F0ECE1' }
    ],
    material: 'Pure Sheesham Wood with 2 Bolster Pillows',
    dimensions: '6.7 ft Length × 3 ft Width',
    woodType: 'Pure Sheesham Wood (Indian Rosewood)',
    stockStatus: 'Made on Order · 7 Days',
    description: 'A traditional Indian diwan bed that works as an afternoon resting spot and doubles as a comfortable bed when guests stay over.',
    highlights: [
      'Includes two round side bolster cushions',
      'Smooth wooden polish that does not fade',
      'Can be used with any standard single mattress'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-5',
    productName: 'Coorg Sheesham L-Shape Sofa',
    categoryName: 'Sofa',
    subcategoryName: 'L-Shape Sofa',
    price: 58999,
    originalPrice: 76999,
    rating: 4.8,
    reviewCount: 87,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Sand Beige', hex: '#D8C7A8' }
    ],
    material: 'Solid Sheesham Frame with High-Density Foam Cushions',
    dimensions: '8.5 ft × 5.5 ft (Roomy 6 Seater)',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A wooden-framed L-shape sofa with exposed Sheesham arms and thick cushions. The chaise has a hidden storage box for blankets and cushions.',
    highlights: [
      'Storage box under the chaise for blankets',
      'Exposed Sheesham arms double as side ledges for cups',
      'High-density foam that does not sag over time'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-6',
    productName: 'Marina Velvet L-Shape Sofa',
    categoryName: 'Sofa',
    subcategoryName: 'L-Shape Sofa',
    price: 38999,
    originalPrice: 49999,
    rating: 4.6,
    reviewCount: 121,
    tags: ['Best Value'],
    colors: [
      { name: 'Ash Grey', hex: '#8A8D91' },
      { name: 'Navy Blue', hex: '#1F3160' }
    ],
    material: 'Soft Velvet Fabric on Solid Wood Frame',
    dimensions: '7.5 ft × 5 ft (5 Seater)',
    woodType: 'Seasoned Rubberwood Frame',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'An affordable L-shape sofa in soft velvet that fits neatly into a corner of most 2BHK living rooms. Plush, deep seats for movie nights.',
    highlights: [
      'Fits most 2BHK living room corners',
      'Stain-resistant velvet that is easy to wipe clean',
      'Deep seats you can sit cross-legged on'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-7',
    productName: 'Rajwada Carved Teak L-Shape Sofa',
    categoryName: 'Sofa',
    subcategoryName: 'L-Shape Sofa',
    price: 74999,
    originalPrice: 96999,
    rating: 4.9,
    reviewCount: 33,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Hand-Carved Teak Wood with Cotton-Silk Cushions',
    dimensions: '9 ft × 6 ft (Large 7 Seater)',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'Made on Order · 15 Days',
    description: 'A grand L-shape sofa with royal Rajasthani carvings on the back rail and arms. Made for large living rooms and big family gatherings.',
    highlights: [
      'Hand-carved floral border by Rajasthani artisans',
      'Seats 7 people comfortably',
      'Cotton-silk cushion covers with zip closure'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-8',
    productName: 'Kaveri Classic 3-Seater Sofa',
    categoryName: 'Sofa',
    subcategoryName: '3-Seater Sofa',
    price: 24999,
    originalPrice: 32999,
    rating: 4.7,
    reviewCount: 156,
    tags: ['Bestseller'],
    colors: [
      { name: 'Rust Orange', hex: '#A4553A' },
      { name: 'Sand Beige', hex: '#D8C7A8' },
      { name: 'Teal Blue', hex: '#2F6F73' }
    ],
    material: 'Linen-Blend Fabric with Pocket Spring Seat',
    dimensions: '6.8 ft Length × 2.9 ft Depth',
    woodType: 'Solid Sal Wood Frame',
    stockStatus: 'In Stock · Free Delivery',
    description: 'Our bestselling everyday sofa. Pocket springs under the seat keep it bouncy for years, and the linen-blend fabric stays cool in summer.',
    highlights: [
      'Pocket spring seats that keep their bounce',
      'Breathable linen-blend fabric',
      'Available in three warm colours'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-9',
    productName: 'Mysore Chesterfield 3-Seater Sofa',
    categoryName: 'Sofa',
    subcategoryName: '3-Seater Sofa',
    price: 44999,
    originalPrice: 57999,
    rating: 4.8,
    reviewCount: 47,
    tags: ['Premium'],
    colors: [
      { name: 'Mahogany Leatherette', hex: '#6B2E1F' },
      { name: 'Deep Green', hex: '#2C4A3E' }
    ],
    material: 'Button-Tufted Leatherette with Rolled Arms',
    dimensions: '7 ft Length × 3 ft Depth',
    woodType: 'Solid Hardwood Frame',
    stockStatus: 'Made on Order · 10 Days',
    description: 'A classic Chesterfield with deep button tufting and rolled arms. Gives your living room or study a rich, library-style look.',
    highlights: [
      'Hand-tufted buttons across the back and arms',
      'Leatherette that does not crack or peel',
      'Solid hardwood frame for a heavy, sturdy build'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-10',
    productName: 'Sagwan Wooden Slat 3-Seater Sofa',
    categoryName: 'Sofa',
    subcategoryName: '3-Seater Sofa',
    price: 27999,
    originalPrice: 35999,
    rating: 4.6,
    reviewCount: 72,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Mustard Cushions', hex: '#C68B59' }
    ],
    material: 'Solid Teak Frame with Slatted Arms & Foam Cushions',
    dimensions: '6.5 ft Length × 2.7 ft Depth',
    woodType: 'Plantation Teak Wood',
    stockStatus: 'In Stock · 3 Days Delivery',
    description: 'A light, airy wooden sofa with slatted arms and loose cushions. Looks great in living rooms, verandas and sit-outs.',
    highlights: [
      'Slatted wooden arms with an open, airy look',
      'Loose cushions are easy to flip and wash',
      'Light enough to move around for cleaning'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-11',
    productName: 'Nook Mango Wood 2-Seater Sofa',
    categoryName: 'Sofa',
    subcategoryName: '2-Seater Sofa',
    price: 16999,
    originalPrice: 21999,
    rating: 4.5,
    reviewCount: 58,
    tags: ['Small Space Pick'],
    colors: [
      { name: 'Mint Green', hex: '#A8C9B5' },
      { name: 'Ivory White', hex: '#F5F3EE' }
    ],
    material: 'Mango Wood Frame with Cotton Cushions',
    dimensions: '4.5 ft Length × 2.5 ft Depth',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A compact two-seater for balconies, bedrooms and small living rooms. Soft pastel cushions on a sturdy mango wood frame.',
    highlights: [
      'Fits in balconies and bedroom corners',
      'Washable cotton cushion covers',
      'Rounded wooden arms with no sharp edges'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-12',
    productName: 'Velvet Bloom 2-Seater Loveseat',
    categoryName: 'Sofa',
    subcategoryName: '2-Seater Sofa',
    price: 21999,
    originalPrice: 28999,
    rating: 4.7,
    reviewCount: 41,
    tags: ['New Arrival'],
    colors: [
      { name: 'Blush Pink', hex: '#D9A5A0' },
      { name: 'Teal Blue', hex: '#2F6F73' }
    ],
    material: 'Plush Velvet with Channel-Tufted Back',
    dimensions: '4.8 ft Length × 2.7 ft Depth',
    woodType: 'Solid Hardwood Frame with Brass-Tipped Legs',
    stockStatus: 'In Stock',
    description: 'A stylish loveseat with a channel-tufted back and slim brass-tipped legs. A statement piece for bedrooms and reading corners.',
    highlights: [
      'Channel-tufted back for a designer look',
      'Brass-tipped legs that will not rust',
      'Soft velvet in bold colours'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-13',
    productName: 'Bundi Carved Wooden Diwan',
    categoryName: 'Sofa',
    subcategoryName: 'Diwan & Daybed',
    price: 26999,
    originalPrice: 34999,
    rating: 4.7,
    reviewCount: 29,
    tags: ['Traditional'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Sheesham Wood with Jaali Carving & Mattress',
    dimensions: '6.5 ft Length × 2.8 ft Width',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 7 Days',
    description: 'A traditional diwan with hand-cut jaali panels on the sides. Comes with a thin mattress and works as extra seating or a guest bed.',
    highlights: [
      'Hand-cut jaali side panels',
      'Mattress and two bolsters included',
      'Doubles as a single guest bed'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-14',
    productName: 'Sleepwell Pull-Out Sofa Cum Bed',
    categoryName: 'Sofa',
    subcategoryName: 'Sofa Cum Bed',
    price: 29999,
    originalPrice: 39999,
    rating: 4.6,
    reviewCount: 133,
    tags: ['2-in-1'],
    colors: [
      { name: 'Dark Grey', hex: '#373A40' },
      { name: 'Navy Blue', hex: '#1F3160' }
    ],
    material: 'Fabric Upholstery with Pull-Out Wooden Bed Frame',
    dimensions: 'Sofa: 6 ft × 3 ft · Bed: 6 ft × 4.5 ft',
    woodType: 'Solid Pine Wood Frame',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A sofa by day and a double bed by night. The bed section pulls out in one smooth motion, perfect for guests staying over.',
    highlights: [
      'Opens into a double bed in seconds',
      'No need to remove cushions to convert',
      'Strong pine frame tested for daily use'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-15',
    productName: 'Guest Room Wooden Sofa Cum Bed',
    categoryName: 'Sofa',
    subcategoryName: 'Sofa Cum Bed',
    price: 34999,
    originalPrice: 45999,
    rating: 4.7,
    reviewCount: 64,
    tags: ['Space Saver'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Sand Beige', hex: '#D8C7A8' }
    ],
    material: 'Sheesham Wood Frame with Fold-Out Mattress',
    dimensions: 'Sofa: 6.2 ft × 2.8 ft · Bed: 6.2 ft × 4 ft',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'A solid wood sofa cum bed for study rooms and guest rooms. The wooden base slides out and the backrest cushions fold down into a mattress.',
    highlights: [
      'Solid Sheesham wood, not metal or MDF',
      'Backrest cushions fold into the mattress',
      'Wooden slats keep the bed firm and level'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-16',
    productName: 'Futon Folding Sofa Cum Bed',
    categoryName: 'Sofa',
    subcategoryName: 'Sofa Cum Bed',
    price: 23999,
    originalPrice: 30999,
    rating: 4.4,
    reviewCount: 88,
    tags: ['Best Value'],
    colors: [
      { name: 'Charcoal', hex: '#2B2B2B' },
      { name: 'Warm Mustard', hex: '#C68B59' }
    ],
    material: 'Washable Fabric Futon on Wooden Slat Base',
    dimensions: 'Sofa: 5.8 ft × 2.8 ft · Bed: 5.8 ft × 4 ft',
    woodType: 'Seasoned Rubberwood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A simple futon that folds flat into a bed. Light, budget-friendly and ideal for first homes, hostels and studio apartments.',
    highlights: [
      'Folds flat into a bed with one push',
      'Removable, machine-washable futon cover',
      'Light enough for one person to move'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-17',
    productName: 'Royal Comfort 1-Seater Recliner',
    categoryName: 'Sofa',
    subcategoryName: 'Recliner Sofa',
    price: 28999,
    originalPrice: 37999,
    rating: 4.8,
    reviewCount: 102,
    tags: ['Relax Pick'],
    colors: [
      { name: 'Mocha Brown', hex: '#5A3E2B' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Premium Leatherette with Manual Recline Lever',
    dimensions: '3 ft Width × 3.2 ft Depth (5.3 ft fully reclined)',
    woodType: 'Solid Hardwood & Steel Mechanism',
    stockStatus: 'In Stock · Free Delivery',
    description: 'A single-seat recliner with a pop-up footrest and padded headrest. The favourite chair for TV time, afternoon naps and elders at home.',
    highlights: [
      'Reclines into three comfortable positions',
      'Pop-up footrest with a simple side lever',
      'Thick padded headrest and arms'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-18',
    productName: 'Cinema 3-Seater Motorised Recliner',
    categoryName: 'Sofa',
    subcategoryName: 'Recliner Sofa',
    price: 89999,
    originalPrice: 114999,
    rating: 4.9,
    reviewCount: 26,
    tags: ['Premium'],
    colors: [
      { name: 'Jet Black', hex: '#1F1F1F' },
      { name: 'Mocha Brown', hex: '#5A3E2B' }
    ],
    material: 'Breathable Leatherette with Motorised Recline & USB Charging',
    dimensions: '7.2 ft Length × 3.3 ft Depth',
    woodType: 'Solid Hardwood Frame',
    stockStatus: 'Made on Order · 12 Days',
    description: 'A home-theatre style sofa where both end seats recline at the touch of a button. Has cup holders and USB charging in the arms.',
    highlights: [
      'Two motorised recliner seats with touch buttons',
      'USB charging ports and cup holders in the arms',
      'Breathable leatherette that stays cool'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-19',
    productName: 'Ashoka Teak 3+1+1 Sofa Set',
    categoryName: 'Sofa',
    subcategoryName: 'Sofa Set',
    price: 64999,
    originalPrice: 84999,
    rating: 4.8,
    reviewCount: 57,
    tags: ['Full Living Room'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Warm Cream', hex: '#F0ECE1' }
    ],
    material: 'Solid Teak Wood with Removable Cushion Covers',
    dimensions: '3-Seater: 6.5 ft · Single Seaters: 2.6 ft each',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'In Stock · Free In-Home Fitting',
    description: 'A complete living room set: one 3-seater sofa and two matching single seaters, all in solid teak. Seats five people for family evenings.',
    highlights: [
      'Complete set: 1 Three-Seater + 2 Single Seaters',
      'Matching teak polish across all pieces',
      'Removable, washable cushion covers'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'sofa-20',
    productName: 'Lotus Fabric 3+2 Sofa Set',
    categoryName: 'Sofa',
    subcategoryName: 'Sofa Set',
    price: 52999,
    originalPrice: 68999,
    rating: 4.6,
    reviewCount: 39,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Sand Beige', hex: '#D8C7A8' },
      { name: 'Teal Blue', hex: '#2F6F73' }
    ],
    material: 'Linen Fabric with Solid Wood Legs',
    dimensions: '3-Seater: 6.6 ft · 2-Seater: 4.8 ft',
    woodType: 'Solid Sal Wood Frame',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'A modern fabric sofa set with one 3-seater and one 2-seater. Clean lines and tapered wooden legs suit both new flats and older homes.',
    highlights: [
      'Complete set: 1 Three-Seater + 1 Two-Seater',
      'Seats five people comfortably',
      'Tapered solid wood legs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- CHAIR ---
  {
    id: 'chair-1',
    productName: 'Royal Sheesham Wooden Easy Armchair',
    categoryName: 'Chair',
    subcategoryName: 'Living Room Armchair',
    price: 14999,
    originalPrice: 19999,
    rating: 4.9,
    reviewCount: 215,
    tags: ['Customer Favorite'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Solid Sheesham Wood with Natural Cane Weave',
    dimensions: '2.1 ft Width × 2.2 ft Depth × 2.7 ft Height',
    woodType: 'Pure Solid Sheesham Wood',
    stockStatus: 'In Stock · Ships in 48 Hours',
    description: 'Our most loved wooden easy chair. Features natural airy cane mesh at the back that stays cool during summers, paired with a soft seating cushion.',
    highlights: [
      'Authentic cane mesh back allows cooling airflow',
      'Relaxing back angle for reading books or newspaper',
      'Floor-friendly rubber pads on all legs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-2',
    productName: 'ErgoPro Wooden Study & Office Chair',
    categoryName: 'Chair',
    subcategoryName: 'Study & Office Chair',
    price: 11499,
    originalPrice: 15999,
    rating: 4.7,
    reviewCount: 88,
    tags: ['Work From Home'],
    colors: [
      { name: 'Matte Black', hex: '#373A40' },
      { name: 'Natural Wood', hex: '#B87C4C' }
    ],
    material: 'Solid Oak Timber with Memory Foam Cushion',
    dimensions: '1.9 ft Width × 1.9 ft Depth (Height Adjustable)',
    woodType: 'Solid Oak Wood Frame',
    stockStatus: 'In Stock · Free Delivery',
    description: 'A handsome solid wood study chair built for work from home. Has smooth height adjustment and rolling wheels, keeping your back pain-free during long work hours.',
    highlights: [
      'Smooth height adjust lever & 360 degree wheels',
      'Cushioned seat prevents thigh numbness',
      'Strong solid wood frame that looks premium in rooms'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-3',
    productName: 'Kashmiri Handcrafted Floral Armchair',
    categoryName: 'Chair',
    subcategoryName: 'Lounge Armchair',
    price: 17999,
    originalPrice: 22999,
    rating: 4.8,
    reviewCount: 52,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Warm Ivory', hex: '#F0ECE1' },
      { name: 'Walnut Brown', hex: '#9E6B47' }
    ],
    material: 'Solid Walnut Wood with Soft Cotton Upholstery',
    dimensions: '2.3 ft Width × 2.5 ft Depth × 2.6 ft Height',
    woodType: 'Himalayan Walnut Hardwood',
    stockStatus: 'In Stock',
    description: 'Features gentle floral hand-carvings on the wooden arms. Adds a grand, traditional touch to your living room or master bedroom.',
    highlights: [
      'Hand-carved by traditional artisan craftsmen',
      'Brass caps on front legs for royal look',
      'Extra thick seat cushion that keeps its shape'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-4',
    productName: 'Koto Wooden Dining Chairs (Set of 2)',
    categoryName: 'Chair',
    subcategoryName: 'Dining Chair',
    price: 13499,
    originalPrice: 17999,
    rating: 4.6,
    reviewCount: 114,
    tags: ['Pair of 2'],
    colors: [
      { name: 'Honey Teak', hex: '#B87C4C' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Solid Sheesham Wood & Easy-Clean Padded Seat',
    dimensions: '1.6 ft Width × 1.7 ft Depth × 2.8 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Setup',
    description: 'Set of two matching solid wood dining chairs. Features curved wooden back support and easy-to-wipe cushion seats that survive food or curry spills.',
    highlights: [
      'Sold as a pair of two chairs together',
      'Food-proof wipe-clean seat cushion',
      'Curved back gives great support while eating'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-5',
    productName: 'Shanti Cane Back Armchair',
    categoryName: 'Chair',
    subcategoryName: 'Living Room Armchair',
    price: 12999,
    originalPrice: 16999,
    rating: 4.7,
    reviewCount: 93,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Plantation Teak with Natural Rattan Back',
    dimensions: '2.2 ft Width × 2.3 ft Depth × 2.8 ft Height',
    woodType: 'Plantation Teak Wood',
    stockStatus: 'In Stock · Ships in 48 Hours',
    description: 'A light teak armchair with a woven rattan back and a soft seat cushion. Pairs well with any sofa as extra living room seating.',
    highlights: [
      'Woven rattan back that stays cool',
      'Soft seat cushion with washable cover',
      'Light enough to carry from room to room'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-6',
    productName: 'Heritage Wingback Armchair',
    categoryName: 'Chair',
    subcategoryName: 'Living Room Armchair',
    price: 19999,
    originalPrice: 25999,
    rating: 4.8,
    reviewCount: 45,
    tags: ['Premium'],
    colors: [
      { name: 'Deep Green', hex: '#2C4A3E' },
      { name: 'Navy Blue', hex: '#1F3160' }
    ],
    material: 'Velvet Upholstery on Solid Wood Frame',
    dimensions: '2.5 ft Width × 2.6 ft Depth × 3.4 ft Height',
    woodType: 'Solid Hardwood Frame',
    stockStatus: 'Made on Order · 8 Days',
    description: 'A tall wingback armchair that wraps around you for reading and tea time. The high back supports your head and neck.',
    highlights: [
      'High wingback supports head and neck',
      'Rich velvet in deep jewel tones',
      'Turned wooden front legs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-7',
    productName: 'Scholar Wooden Study Chair',
    categoryName: 'Chair',
    subcategoryName: 'Study & Office Chair',
    price: 6999,
    originalPrice: 8999,
    rating: 4.6,
    reviewCount: 168,
    tags: ['Student Pick'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Solid Sheesham Wood with Cushioned Seat',
    dimensions: '1.6 ft Width × 1.7 ft Depth × 3 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Delivery',
    description: 'A simple, sturdy wooden chair for study tables. Upright back support helps children and students sit correctly for long hours.',
    highlights: [
      'Upright back for correct sitting posture',
      'Cushioned seat for long study hours',
      'Solid Sheesham that lasts for years'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-8',
    productName: 'Executive High-Back Office Chair',
    categoryName: 'Chair',
    subcategoryName: 'Study & Office Chair',
    price: 15999,
    originalPrice: 21999,
    rating: 4.7,
    reviewCount: 76,
    tags: ['Work From Home'],
    colors: [
      { name: 'Jet Black', hex: '#1F1F1F' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Leatherette with Wooden Armrests & Tilt Lock',
    dimensions: '2.2 ft Width × 2.2 ft Depth (Height Adjustable)',
    woodType: 'Walnut Wood Armrests on Steel Base',
    stockStatus: 'In Stock · 3 Days Delivery',
    description: 'A high-back executive chair with walnut wood armrests. Tilt and lock the backrest at your preferred angle for long work calls.',
    highlights: [
      'Tilt-and-lock backrest',
      'Walnut wood armrests for a premium feel',
      'Smooth-rolling, floor-safe wheels'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-9',
    productName: 'Zen Low Lounge Chair',
    categoryName: 'Chair',
    subcategoryName: 'Lounge Armchair',
    price: 16499,
    originalPrice: 21499,
    rating: 4.6,
    reviewCount: 38,
    tags: ['New Arrival'],
    colors: [
      { name: 'Sand Beige', hex: '#D8C7A8' },
      { name: 'Rust Orange', hex: '#A4553A' }
    ],
    material: 'Acacia Wood Frame with Thick Bouclé Cushions',
    dimensions: '2.4 ft Width × 2.7 ft Depth × 2.4 ft Height',
    woodType: 'Solid Acacia Wood',
    stockStatus: 'In Stock',
    description: 'A low, wide lounge chair with thick bouclé cushions. Sink in with a book or coffee in a quiet corner of your home.',
    highlights: [
      'Low, wide seat for relaxed lounging',
      'Thick bouclé cushions with a soft texture',
      'Solid acacia frame with a natural grain'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-10',
    productName: 'Mehrab Cushioned Dining Chairs (Set of 2)',
    categoryName: 'Chair',
    subcategoryName: 'Dining Chair',
    price: 11999,
    originalPrice: 15999,
    rating: 4.7,
    reviewCount: 84,
    tags: ['Pair of 2'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Sand Beige', hex: '#D8C7A8' }
    ],
    material: 'Sheesham Wood with Arched Back & Padded Seat',
    dimensions: '1.6 ft Width × 1.7 ft Depth × 3.1 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Setup',
    description: 'Two dining chairs with an elegant arched back inspired by Mughal doorways. Padded seats make long family dinners comfortable.',
    highlights: [
      'Sold as a pair of two chairs',
      'Mughal-inspired arched backrest',
      'Padded seat with wipe-clean fabric'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-11',
    productName: 'Cross-Back Dining Chairs (Set of 4)',
    categoryName: 'Chair',
    subcategoryName: 'Dining Chair',
    price: 19999,
    originalPrice: 26999,
    rating: 4.6,
    reviewCount: 61,
    tags: ['Set of 4'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Solid Mango Wood with Woven Seat',
    dimensions: '1.5 ft Width × 1.7 ft Depth × 2.9 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'A set of four farmhouse-style dining chairs with an X-shaped back and woven seat. Matches most wooden dining tables.',
    highlights: [
      'Set of four matching chairs',
      'Classic X-shaped cross back',
      'Hand-woven seat that lets air through'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-12',
    productName: 'Dadi Maa Teak Rocking Chair',
    categoryName: 'Chair',
    subcategoryName: 'Rocking Chair',
    price: 17999,
    originalPrice: 23999,
    rating: 4.9,
    reviewCount: 112,
    tags: ['Customer Favorite'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Solid Teak with Cane Seat & Back',
    dimensions: '2 ft Width × 3 ft Depth × 3.4 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'In Stock · Ships in 48 Hours',
    description: 'The classic teak rocking chair found in Indian homes for generations. Smooth, gentle rocking with a cool cane seat and back.',
    highlights: [
      'Smooth, gentle rocking motion',
      'Cane seat and back stay cool in summer',
      'Curved runners will not tip over'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-13',
    productName: 'Easy Glide Cushioned Rocking Chair',
    categoryName: 'Chair',
    subcategoryName: 'Rocking Chair',
    price: 14499,
    originalPrice: 18999,
    rating: 4.6,
    reviewCount: 54,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Navy Cushions', hex: '#1F3160' }
    ],
    material: 'Sheesham Frame with Removable Cushions',
    dimensions: '2.1 ft Width × 3.1 ft Depth × 3.3 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock',
    description: 'A cushioned rocking chair for nursing mothers, elders and relaxed evenings. Thick tie-on cushions make it extra comfortable.',
    highlights: [
      'Thick tie-on seat and back cushions',
      'Wide armrests for resting your arms',
      'Felt pads on the runners protect the floor'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-14',
    productName: 'Petal Velvet Accent Chair',
    categoryName: 'Chair',
    subcategoryName: 'Accent Chair',
    price: 9999,
    originalPrice: 13999,
    rating: 4.5,
    reviewCount: 47,
    tags: ['Pop of Colour'],
    colors: [
      { name: 'Warm Mustard', hex: '#C68B59' },
      { name: 'Teal Blue', hex: '#2F6F73' }
    ],
    material: 'Velvet Shell Seat on Solid Wood Legs',
    dimensions: '2 ft Width × 2.1 ft Depth × 2.6 ft Height',
    woodType: 'Solid Rubberwood Legs',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A petal-shaped velvet chair that adds a pop of colour to bedrooms, dressing areas and living room corners.',
    highlights: [
      'Curved petal-shaped velvet shell',
      'Compact size fits beside a bed or dresser',
      'Solid wood tapered legs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'chair-15',
    productName: 'Kantha Print Accent Chair',
    categoryName: 'Chair',
    subcategoryName: 'Accent Chair',
    price: 12499,
    originalPrice: 16499,
    rating: 4.7,
    reviewCount: 28,
    tags: ['Handcrafted'],
    colors: [
      { name: 'Kantha Red', hex: '#B23A3A' },
      { name: 'Indigo Blue', hex: '#2E3A6B' }
    ],
    material: 'Hand-Stitched Kantha Fabric on Mango Wood',
    dimensions: '2.1 ft Width × 2.2 ft Depth × 2.7 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'Made on Order · 6 Days',
    description: 'Upholstered in hand-stitched Kantha fabric from Bengal, so no two chairs are exactly alike. A colourful conversation piece.',
    highlights: [
      'Hand-stitched Kantha fabric from Bengal',
      'Each chair has a unique pattern',
      'Solid mango wood frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- DINING ---
  {
    id: 'dining-1',
    productName: 'Royal Teak 6-Seater Dining Table Set',
    categoryName: 'Dining',
    subcategoryName: '6-Seater Dining Set',
    price: 54999,
    originalPrice: 69999,
    rating: 4.9,
    reviewCount: 78,
    tags: ['Full Family Set'],
    colors: [
      { name: 'Teak Polish', hex: '#B87C4C' },
      { name: 'Walnut Polish', hex: '#9E6B47' }
    ],
    material: 'Pure Teakwood with Brass Inlays & Cushioned Chairs',
    dimensions: '6 ft Length × 3 ft Width × 2.5 ft Height',
    woodType: '100% Solid Central Province Teakwood',
    stockStatus: 'In Stock · Free In-Home Fitting',
    description: 'Our flagship family dining set. Includes one heavy 6-seater dining table, 4 comfortable chairs, and 1 full-size bench that easily accommodates family and guests during festive meals.',
    highlights: [
      'Complete Set: 1 Large Table + 4 Chairs + 1 Bench',
      'Heat & water resistant table top polish',
      'Smooth rounded corners so children do not get hurt'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-2',
    productName: 'Aangan 4-Seater Compact Dining Set',
    categoryName: 'Dining',
    subcategoryName: '4-Seater Dining Set',
    price: 34999,
    originalPrice: 44999,
    rating: 4.8,
    reviewCount: 92,
    tags: ['Compact Size'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Warm Cream', hex: '#F0ECE1' }
    ],
    material: 'Pure Sheesham Wood with 4 Padded Chairs',
    dimensions: '4 ft Length × 2.7 ft Width × 2.5 ft Height',
    woodType: 'Pure Solid Sheesham Wood',
    stockStatus: 'Fast Delivery',
    description: 'Made specifically for 2BHK and 3BHK flats. All 4 chairs push completely inside the table so your dining area never feels crowded.',
    highlights: [
      'All 4 chairs slide fully under the table',
      'Thick 35mm pure solid wood tabletop',
      '100% termite proof with 10-year warranty'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-3',
    productName: 'Samar Solid Wood 3-Person Dining Bench',
    categoryName: 'Dining',
    subcategoryName: 'Dining Bench',
    price: 9999,
    originalPrice: 13999,
    rating: 4.7,
    reviewCount: 46,
    tags: ['Multipurpose'],
    colors: [
      { name: 'Natural Teak', hex: '#B87C4C' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Solid Hardwood with Padded Seating Cushion',
    dimensions: '4.6 ft Length × 1.3 ft Width × 1.5 ft Height',
    woodType: 'Pure Hardwood Timber',
    stockStatus: 'In Stock',
    description: 'A cozy wooden bench that seats 3 adults or 4 kids easily at the dining table. Also looks great near the home entryway for putting on shoes.',
    highlights: [
      'Seats 3 adults comfortably (supports 300 kg)',
      'Soft padded top cushion included',
      'Slides easily under dining tables to save space'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-4',
    productName: 'Chowk Wooden Breakfast Bar Stools (Set of 2)',
    categoryName: 'Dining',
    subcategoryName: 'Bar Stool',
    price: 12499,
    originalPrice: 16999,
    rating: 4.6,
    reviewCount: 31,
    tags: ['Set of 2'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Matte Black', hex: '#373A40' }
    ],
    material: 'Solid Teak Wood with Brass Foot Ring',
    dimensions: '2.5 ft Height (Standard Kitchen Counter Size)',
    woodType: 'Pure Solid Teakwood',
    stockStatus: 'Made on Order',
    description: 'Set of two counter-height wooden stools with comfortable saddle-shaped tops and shiny brass rings where you can rest your feet while having breakfast.',
    highlights: [
      'Includes 2 matching counter bar stools',
      'Contoured wooden seat shaped for natural sitting comfort',
      'Brass footrest ring protects the wood from shoe marks'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-5',
    productName: 'Shahi Sheesham 6-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '6-Seater Dining Set',
    price: 49999,
    originalPrice: 64999,
    rating: 4.8,
    reviewCount: 66,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Sheesham Table + 6 Cushioned Chairs',
    dimensions: 'Table: 6 ft × 3 ft × 2.5 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free In-Home Fitting',
    description: 'A full 6-seater set with a thick Sheesham table and six cushioned chairs. Made for daily family meals and festive dinners alike.',
    highlights: [
      'Complete Set: 1 Table + 6 Cushioned Chairs',
      'Thick 40mm solid wood tabletop',
      'Heat-resistant polish for hot dishes'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-6',
    productName: 'Marble Top 6-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '6-Seater Dining Set',
    price: 72999,
    originalPrice: 92999,
    rating: 4.9,
    reviewCount: 31,
    tags: ['Premium'],
    colors: [
      { name: 'White Marble', hex: '#EDEBE6' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Marble Top on Solid Wood Base + 6 Upholstered Chairs',
    dimensions: 'Table: 6 ft × 3.2 ft × 2.5 ft Height',
    woodType: 'Solid Teak Wood Base',
    stockStatus: 'Made on Order · 14 Days',
    description: 'A luxurious dining set with a white marble top on a solid teak base. The marble stays cool and is easy to wipe after every meal.',
    highlights: [
      'Genuine marble top, sealed against stains',
      'Solid teak base and chair frames',
      'Six upholstered high-back chairs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-7',
    productName: 'Rustic Mango Wood 6-Seater Set with Bench',
    categoryName: 'Dining',
    subcategoryName: '6-Seater Dining Set',
    price: 45999,
    originalPrice: 58999,
    rating: 4.6,
    reviewCount: 52,
    tags: ['Family Pick'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Mango Wood Table + 4 Chairs + 1 Bench',
    dimensions: 'Table: 5.8 ft × 3 ft × 2.5 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'A rustic farmhouse dining set with four chairs and a bench. Children love the bench, and it slides under the table when not in use.',
    highlights: [
      'Complete Set: 1 Table + 4 Chairs + 1 Bench',
      'Bench slides fully under the table',
      'Rustic distressed finish hides daily scratches'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-8',
    productName: 'Nest 4-Seater Round Dining Set',
    categoryName: 'Dining',
    subcategoryName: '4-Seater Dining Set',
    price: 31999,
    originalPrice: 40999,
    rating: 4.7,
    reviewCount: 74,
    tags: ['Compact Size'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Sand Beige', hex: '#D8C7A8' }
    ],
    material: 'Round Sheesham Table + 4 Padded Chairs',
    dimensions: 'Table: 3.6 ft Diameter × 2.5 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Fast Delivery',
    description: 'A round 4-seater set that fits neatly into small dining areas. With no corners, it is safer for kids and easier to walk around.',
    highlights: [
      'Round top with no sharp corners',
      'Fits small dining areas and kitchen nooks',
      'Four padded chairs included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-9',
    productName: 'Glass Top 4-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '4-Seater Dining Set',
    price: 28999,
    originalPrice: 37999,
    rating: 4.5,
    reviewCount: 89,
    tags: ['Best Value'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Jet Black', hex: '#1F1F1F' }
    ],
    material: 'Tempered Glass Top on Wooden Frame + 4 Chairs',
    dimensions: 'Table: 4 ft × 2.6 ft × 2.5 ft Height',
    woodType: 'Seasoned Rubberwood',
    stockStatus: 'In Stock · Free Setup',
    description: 'A modern 4-seater with a toughened glass top that makes small rooms feel bigger. Wipes clean in seconds after meals.',
    highlights: [
      '8mm toughened safety glass top',
      'Makes small dining areas look more spacious',
      'Four cushioned chairs included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-10',
    productName: 'Maharaja Teak 8-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '8-Seater Dining Set',
    price: 98999,
    originalPrice: 129999,
    rating: 4.9,
    reviewCount: 22,
    tags: ['Grand Family Set'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Teak Table + 8 High-Back Chairs',
    dimensions: 'Table: 8 ft × 3.5 ft × 2.5 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'Made on Order · 20 Days',
    description: 'A grand 8-seater for joint families and big festive feasts. A heavy teak table with eight high-back chairs carved at the top rail.',
    highlights: [
      'Complete Set: 1 Large Table + 8 Chairs',
      'Seats the whole joint family together',
      'Carved top rail on every chair'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-11',
    productName: 'Utsav Extendable 6-8 Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '8-Seater Dining Set',
    price: 84999,
    originalPrice: 109999,
    rating: 4.8,
    reviewCount: 18,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Warm Cream', hex: '#F0ECE1' }
    ],
    material: 'Sheesham Butterfly-Extension Table + 8 Chairs',
    dimensions: 'Table: 6 ft (extends to 8 ft) × 3.3 ft',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 15 Days',
    description: 'A 6-seater table that opens to seat 8 when guests come home. The extra leaf folds and stores inside the table itself.',
    highlights: [
      'Extends from 6 to 8 seats in under a minute',
      'Extension leaf stores inside the table',
      'Eight cushioned chairs included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-12',
    productName: 'Duo Compact 2-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '2-Seater Dining Set',
    price: 14999,
    originalPrice: 19999,
    rating: 4.6,
    reviewCount: 97,
    tags: ['Small Space Pick'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Mint Green', hex: '#A8C9B5' }
    ],
    material: 'Solid Wood Table + 2 Chairs',
    dimensions: 'Table: 2.5 ft × 2.5 ft × 2.5 ft Height',
    woodType: 'Seasoned Rubberwood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A small square table with two chairs for couples, studio flats and kitchen corners. Also works as a breakfast or work-from-home table.',
    highlights: [
      'Fits studio flats and kitchen corners',
      'Doubles as a breakfast or work table',
      'Two matching chairs included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-13',
    productName: 'Wall-Folding 2-Seater Dining Set',
    categoryName: 'Dining',
    subcategoryName: '2-Seater Dining Set',
    price: 12999,
    originalPrice: 16999,
    rating: 4.4,
    reviewCount: 63,
    tags: ['Space Saver'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Drop-Leaf Wall Table + 2 Folding Chairs',
    dimensions: 'Open: 3 ft × 2 ft · Folded: 3 ft × 0.6 ft',
    woodType: 'Engineered Wood with Sheesham Veneer',
    stockStatus: 'In Stock',
    description: 'A wall-mounted table that folds flat when not in use, with two folding chairs. Gives you a dining spot without losing floor space.',
    highlights: [
      'Folds flat against the wall after meals',
      'Two folding chairs hang neatly on the wall',
      'Wall fixing and installation included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-14',
    productName: 'Haveli Carved Dining Bench',
    categoryName: 'Dining',
    subcategoryName: 'Dining Bench',
    price: 13999,
    originalPrice: 18499,
    rating: 4.7,
    reviewCount: 24,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham Bench with Carved Apron & Backrest',
    dimensions: '5 ft Length × 1.5 ft Width × 2.8 ft Height (with back)',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 7 Days',
    description: 'A dining bench with a low backrest and haveli-style carving along the front. Seats three adults and looks lovely in an entrance hall too.',
    highlights: [
      'Low backrest for extra comfort',
      'Haveli-style carving on the front apron',
      'Seats three adults'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dining-15',
    productName: 'Loft Swivel Bar Stools (Set of 2)',
    categoryName: 'Dining',
    subcategoryName: 'Bar Stool',
    price: 10999,
    originalPrice: 14499,
    rating: 4.5,
    reviewCount: 42,
    tags: ['Set of 2'],
    colors: [
      { name: 'Jet Black', hex: '#1F1F1F' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Wooden Seat on Height-Adjustable Steel Stand',
    dimensions: '2.1 ft to 2.8 ft Adjustable Height',
    woodType: 'Solid Acacia Wood Seat',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'Two swivel bar stools with solid acacia seats and a gas-lift stand. Adjust the height to suit your kitchen counter or breakfast bar.',
    highlights: [
      'Gas-lift height adjustment',
      '360 degree swivel seat',
      'Rubber base ring protects the floor'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- CENTER TABLE ---
  {
    id: 'center-table-1',
    productName: 'Udaipur Brass Inlay Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Rectangular Center Table',
    price: 13999,
    originalPrice: 18999,
    rating: 4.8,
    reviewCount: 83,
    tags: ['Living Room Star'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Cream Accent', hex: '#F0ECE1' }
    ],
    material: 'Pure Sheesham Wood with Real Brass Metal Inlay',
    dimensions: '3.5 ft Length × 2 ft Width × 1.4 ft Height',
    woodType: 'Pure Solid Sheesham Wood',
    stockStatus: 'In Stock',
    description: 'An eye-catching center table featuring real golden brass wire patterns hand-set into solid Sheesham wood. Includes a lower shelf to keep TV remotes and magazines.',
    highlights: [
      'Real golden brass wire hand-fitted into wood',
      'Bottom shelf to store remotes, magazines & coasters',
      'Water-proof polish: hot tea cups will not leave white marks'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-2',
    productName: 'Narmada Round Nesting Tables (Set of 2)',
    categoryName: 'CenterTable',
    subcategoryName: 'Nesting Tables',
    price: 8999,
    originalPrice: 12499,
    rating: 4.7,
    reviewCount: 128,
    tags: ['Space Saver'],
    colors: [
      { name: 'Natural Wood', hex: '#B87C4C' },
      { name: 'Charcoal Black', hex: '#373A40' }
    ],
    material: 'Solid Oak Wood Tops with Strong Metal Legs',
    dimensions: 'Large: 2 ft Round, Small: 1.5 ft Round',
    woodType: 'Solid Oak Wood Tops',
    stockStatus: 'In Stock · Ships Fast',
    description: 'Pair of two round tables. The smaller table slides right under the bigger one when you need space, and pulls out instantly when guests come over for tea.',
    highlights: [
      'Small table tucks completely under the large table',
      'Round safe edges with zero sharp corners',
      'Sturdy steel legs that do not wobble'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-3',
    productName: 'Pinewood Minimal Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Rectangular Center Table',
    price: 7999,
    originalPrice: 10499,
    rating: 4.5,
    reviewCount: 91,
    tags: ['Best Value'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Solid Pine Wood with Lower Shelf',
    dimensions: '3.5 ft Length × 1.8 ft Width × 1.4 ft Height',
    woodType: 'Solid Pine Wood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A clean, simple center table with an open lower shelf. Light on the pocket and suits any style of living room.',
    highlights: [
      'Open lower shelf for books and remotes',
      'Clean, minimal design',
      'Budget-friendly solid wood'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-4',
    productName: 'Jodhpur Jaali Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Rectangular Center Table',
    price: 15999,
    originalPrice: 20999,
    rating: 4.8,
    reviewCount: 36,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham with Hand-Cut Jaali Panels',
    dimensions: '3.8 ft Length × 2 ft Width × 1.5 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 6 Days',
    description: 'A center table with hand-cut jaali panels on all four sides, inspired by the stone screens of Jodhpur palaces.',
    highlights: [
      'Hand-cut jaali panels on all four sides',
      'Thick solid Sheesham top',
      'Lower shelf hidden behind the jaali'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-5',
    productName: 'Slab Live-Edge Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Rectangular Center Table',
    price: 21999,
    originalPrice: 28999,
    rating: 4.7,
    reviewCount: 19,
    tags: ['Premium'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Single Live-Edge Acacia Slab on Iron Legs',
    dimensions: '4 ft Length × 2 ft Width × 1.4 ft Height',
    woodType: 'Solid Acacia Wood',
    stockStatus: 'Made on Order · 10 Days',
    description: 'Cut from a single acacia slab with its natural edge left intact, so every table has its own unique shape and grain.',
    highlights: [
      'Single solid slab with a natural live edge',
      'Every piece has a unique grain pattern',
      'Powder-coated iron legs'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-6',
    productName: 'Chandni Round Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Round Center Table',
    price: 11999,
    originalPrice: 15499,
    rating: 4.7,
    reviewCount: 58,
    tags: ['Living Room Star'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Warm Cream', hex: '#F0ECE1' }
    ],
    material: 'Round Sheesham Top with Brass-Capped Legs',
    dimensions: '2.8 ft Diameter × 1.4 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock',
    description: 'A round center table with brass-capped legs. Its soft curves balance the straight lines of most sofas.',
    highlights: [
      'Round top with no sharp corners',
      'Brass caps on all legs',
      'Fits well in front of L-shape sofas'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-7',
    productName: 'Drum Mango Wood Round Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Round Center Table',
    price: 9499,
    originalPrice: 12999,
    rating: 4.6,
    reviewCount: 44,
    tags: ['New Arrival'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Charcoal', hex: '#2B2B2B' }
    ],
    material: 'Mango Wood Drum Base with Fluted Sides',
    dimensions: '2.5 ft Diameter × 1.4 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A drum-shaped center table with hand-fluted sides. Sits flat on the floor, so no dust collects underneath.',
    highlights: [
      'Hand-fluted drum sides',
      'Closed base means no dust underneath',
      'Solid mango wood with a natural finish'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-8',
    productName: 'Marble Top Round Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Round Center Table',
    price: 18999,
    originalPrice: 24999,
    rating: 4.8,
    reviewCount: 27,
    tags: ['Festive Deal'],
    colors: [
      { name: 'White Marble', hex: '#EDEBE6' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Marble Top on Teak Pedestal Base',
    dimensions: '2.7 ft Diameter × 1.4 ft Height',
    woodType: 'Solid Teak Wood Base',
    stockStatus: 'Made on Order · 8 Days',
    description: 'A round marble top on a turned teak pedestal. Elegant, cool to the touch and resistant to tea and coffee rings.',
    highlights: [
      'Sealed marble top resists tea and coffee rings',
      'Turned teak pedestal base',
      'Heavy and stable, will not tip'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-9',
    productName: 'Trio Nesting Tables (Set of 3)',
    categoryName: 'CenterTable',
    subcategoryName: 'Nesting Tables',
    price: 10999,
    originalPrice: 14499,
    rating: 4.7,
    reviewCount: 71,
    tags: ['Set of 3'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Sheesham Tops with Tapered Legs',
    dimensions: 'Large: 2 ft · Medium: 1.7 ft · Small: 1.4 ft',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock',
    description: 'Three tables that stack into one. Pull them apart when guests arrive and slide them back together when they leave.',
    highlights: [
      'Three tables stack into the space of one',
      'Use together or spread around the room',
      'Solid Sheesham tops'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-10',
    productName: 'Orbit Round Nesting Tables (Set of 2)',
    categoryName: 'CenterTable',
    subcategoryName: 'Nesting Tables',
    price: 7999,
    originalPrice: 10999,
    rating: 4.5,
    reviewCount: 39,
    tags: ['Space Saver'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Jet Black', hex: '#1F1F1F' }
    ],
    material: 'Oak Veneer Tops with Powder-Coated Steel Frame',
    dimensions: 'Large: 2 ft Round · Small: 1.6 ft Round',
    woodType: 'Oak Veneer on Engineered Wood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'Two round tables at different heights that overlap neatly. A modern look for apartments and small living rooms.',
    highlights: [
      'Two heights that overlap neatly',
      'Slim black steel frames',
      'Light enough to move with one hand'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-11',
    productName: 'Treasure Chest Storage Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Storage Center Table',
    price: 16999,
    originalPrice: 21999,
    rating: 4.7,
    reviewCount: 48,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham with 4 Drawers & Open Shelf',
    dimensions: '3.6 ft Length × 2 ft Width × 1.5 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Setup',
    description: 'A center table with four drawers on both sides for remotes, chargers, board games and more. Keeps the living room clutter-free.',
    highlights: [
      'Four drawers, two on each side',
      'Open middle shelf for magazines',
      'Brass knobs on every drawer'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-12',
    productName: 'Ottoman Trunk Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Storage Center Table',
    price: 14499,
    originalPrice: 18999,
    rating: 4.6,
    reviewCount: 33,
    tags: ['Traditional'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Rust Orange', hex: '#A4553A' }
    ],
    material: 'Mango Wood Trunk with Brass Fittings & Lift Lid',
    dimensions: '3 ft Length × 1.8 ft Width × 1.5 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock',
    description: 'A trunk-style center table with antique brass corners. The lid lifts up to store quilts, toys or extra cushions.',
    highlights: [
      'Lift-up lid with deep storage inside',
      'Antique brass corner fittings',
      'Soft-close lid hinges'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-13',
    productName: 'Twin Drawer Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Storage Center Table',
    price: 12499,
    originalPrice: 16499,
    rating: 4.5,
    reviewCount: 57,
    tags: ['Best Value'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Engineered Wood with 2 Soft-Close Drawers',
    dimensions: '3.4 ft Length × 1.9 ft Width × 1.4 ft Height',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A modern center table with two soft-close drawers and a scratch-resistant top. Easy to keep clean and great value.',
    highlights: [
      'Two soft-close drawers',
      'Scratch-resistant laminate top',
      'Termite-treated engineered wood'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-14',
    productName: 'Lift-Up Work Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Lift-Top Center Table',
    price: 15499,
    originalPrice: 19999,
    rating: 4.6,
    reviewCount: 62,
    tags: ['Work From Home'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Lift-Up Top with Hidden Storage Well',
    dimensions: '3.5 ft × 1.8 ft × 1.4 ft Height (lifts to 2.1 ft)',
    woodType: 'Solid Rubberwood',
    stockStatus: 'In Stock · 3 Days Delivery',
    description: 'The top lifts up and forward to laptop height, so you can work or eat from the sofa. Hidden storage sits underneath.',
    highlights: [
      'Top lifts to laptop height in one motion',
      'Hidden storage well under the top',
      'Gas-lift hinges hold any position'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'center-table-15',
    productName: 'Sheesham Lift-Top Center Table',
    categoryName: 'CenterTable',
    subcategoryName: 'Lift-Top Center Table',
    price: 19999,
    originalPrice: 25999,
    rating: 4.8,
    reviewCount: 21,
    tags: ['Premium'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Sheesham Lift-Top with Gas-Lift Hinges',
    dimensions: '3.8 ft × 2 ft × 1.5 ft Height (lifts to 2.2 ft)',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 7 Days',
    description: 'A solid Sheesham lift-top table. Looks like a classic center table but turns into a comfortable desk or dining surface.',
    highlights: [
      'Solid Sheesham top and body',
      'Turns into a desk or dining surface',
      'Two side drawers plus hidden storage'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- BED ---
  {
    id: 'bed-1',
    productName: 'Rajmahal Sheesham King Size Bed',
    categoryName: 'Bed',
    subcategoryName: 'King Size Bed',
    price: 45999,
    originalPrice: 59999,
    rating: 4.8,
    reviewCount: 134,
    tags: ['Bestseller'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Solid Sheesham with Carved Headboard',
    dimensions: 'Fits 78 × 72 in mattress · 6.8 ft × 6.3 ft × 3.6 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'Our bestselling king bed with a softly carved Sheesham headboard. Strong wooden slats give firm, even support to any mattress.',
    highlights: [
      'Gently carved Sheesham headboard',
      'Strong wooden slats, no squeaking',
      'Supports up to 500 kg'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-2',
    productName: 'Nordic Oak Platform King Bed',
    categoryName: 'Bed',
    subcategoryName: 'King Size Bed',
    price: 39999,
    originalPrice: 51999,
    rating: 4.6,
    reviewCount: 71,
    tags: ['Modern'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Low Platform Frame with Slatted Base',
    dimensions: 'Fits 78 × 72 in mattress · 6.7 ft × 6.2 ft × 2.8 ft Height',
    woodType: 'Solid Oak Veneer on Rubberwood',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'A low, minimal platform bed in light oak. Makes small bedrooms feel open and airy, with no box spring needed.',
    highlights: [
      'Low platform design, no box spring needed',
      'Light oak finish brightens the room',
      'Rounded corners so you do not bump your shins'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-3',
    productName: 'Velvet Wingback King Bed',
    categoryName: 'Bed',
    subcategoryName: 'King Size Bed',
    price: 54999,
    originalPrice: 71999,
    rating: 4.8,
    reviewCount: 42,
    tags: ['Premium'],
    colors: [
      { name: 'Navy Blue', hex: '#1F3160' },
      { name: 'Deep Green', hex: '#2C4A3E' }
    ],
    material: 'Upholstered Velvet Headboard on Solid Wood Frame',
    dimensions: 'Fits 78 × 72 in mattress · 7 ft × 6.5 ft × 4.4 ft Height',
    woodType: 'Solid Hardwood Frame',
    stockStatus: 'Made on Order · 10 Days',
    description: 'A hotel-style bed with a tall padded velvet headboard. Lean back comfortably to read or watch TV in bed.',
    highlights: [
      'Tall padded headboard for sitting up in bed',
      'Wingback sides for a luxury hotel look',
      'Solid hardwood frame under the velvet'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-4',
    productName: 'Teak Classic King Size Bed',
    categoryName: 'Bed',
    subcategoryName: 'King Size Bed',
    price: 62999,
    originalPrice: 81999,
    rating: 4.9,
    reviewCount: 58,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Solid Teak Panel Headboard & Footboard',
    dimensions: 'Fits 78 × 72 in mattress · 6.9 ft × 6.4 ft × 3.8 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A timeless solid teak bed with panelled headboard and footboard. Built heavy and solid to last for decades.',
    highlights: [
      'Solid teak headboard and footboard',
      'Termite-proof and moisture-resistant',
      'Built to last for generations'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-5',
    productName: 'Cane Weave King Bed',
    categoryName: 'Bed',
    subcategoryName: 'King Size Bed',
    price: 49999,
    originalPrice: 64999,
    rating: 4.7,
    reviewCount: 37,
    tags: ['Handcrafted'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Mango Wood Frame with Natural Cane Headboard',
    dimensions: 'Fits 78 × 72 in mattress · 6.8 ft × 6.3 ft × 3.9 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'Made on Order · 8 Days',
    description: 'A breezy king bed with a hand-woven cane headboard. Brings a light, natural, resort-like feel to the bedroom.',
    highlights: [
      'Hand-woven natural cane headboard',
      'Light, airy look for warm climates',
      'Solid mango wood frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-6',
    productName: 'Ananya Sheesham Queen Bed',
    categoryName: 'Bed',
    subcategoryName: 'Queen Size Bed',
    price: 34999,
    originalPrice: 45999,
    rating: 4.7,
    reviewCount: 119,
    tags: ['Customer Favorite'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Solid Sheesham with Panel Headboard',
    dimensions: 'Fits 78 × 60 in mattress · 6.8 ft × 5.3 ft × 3.4 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A sturdy queen bed in solid Sheesham that suits most bedrooms. Simple panel headboard with a rich, warm polish.',
    highlights: [
      'Fits standard queen mattresses',
      'Warm Sheesham polish that does not fade',
      'Strong slats with a centre support beam'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-7',
    productName: 'Cloud Upholstered Queen Bed',
    categoryName: 'Bed',
    subcategoryName: 'Queen Size Bed',
    price: 32999,
    originalPrice: 42999,
    rating: 4.6,
    reviewCount: 66,
    tags: ['New Arrival'],
    colors: [
      { name: 'Sand Beige', hex: '#D8C7A8' },
      { name: 'Dark Grey', hex: '#373A40' }
    ],
    material: 'Linen-Upholstered Headboard on Wooden Frame',
    dimensions: 'Fits 78 × 60 in mattress · 6.8 ft × 5.4 ft × 3.6 ft Height',
    woodType: 'Solid Pine Wood Frame',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'A soft, cushioned headboard wrapped in linen. A calm, modern look for master bedrooms and guest rooms.',
    highlights: [
      'Soft padded linen headboard',
      'Neutral colours that match any bedding',
      'Hidden legs for a floating look'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-8',
    productName: 'Mango Wood Rustic Queen Bed',
    categoryName: 'Bed',
    subcategoryName: 'Queen Size Bed',
    price: 29999,
    originalPrice: 38999,
    rating: 4.5,
    reviewCount: 53,
    tags: ['Best Value'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Mango Wood with Distressed Finish',
    dimensions: 'Fits 78 × 60 in mattress · 6.7 ft × 5.3 ft × 3.3 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock',
    description: 'A rustic queen bed with a hand-distressed finish. Small marks and scratches only add to its character over time.',
    highlights: [
      'Hand-distressed rustic finish',
      'Solid mango wood at a great price',
      'Slatted base for good mattress airflow'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-9',
    productName: 'Jharokha Carved Queen Bed',
    categoryName: 'Bed',
    subcategoryName: 'Queen Size Bed',
    price: 41999,
    originalPrice: 54999,
    rating: 4.8,
    reviewCount: 29,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham with Rajasthani Jharokha Carving',
    dimensions: 'Fits 78 × 60 in mattress · 6.9 ft × 5.5 ft × 4 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 12 Days',
    description: 'A queen bed with a headboard carved like a Rajasthani jharokha window. A true heritage piece for your bedroom.',
    highlights: [
      'Jharokha window carving on the headboard',
      'Hand-finished by Jodhpur craftsmen',
      'Solid Sheesham throughout'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-10',
    productName: 'Slim Line Queen Bed with Side Tables',
    categoryName: 'Bed',
    subcategoryName: 'Queen Size Bed',
    price: 37999,
    originalPrice: 48999,
    rating: 4.7,
    reviewCount: 44,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Engineered Wood Bed with Attached Bedside Tables',
    dimensions: 'Fits 78 × 60 in mattress · 8.6 ft wide incl. side tables',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A queen bed with two bedside tables built into the headboard. Saves you buying separate side tables.',
    highlights: [
      'Two bedside tables built in',
      'Each side table has a drawer',
      'Scratch-resistant laminate finish'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-11',
    productName: 'Spacio Hydraulic King Storage Bed',
    categoryName: 'Bed',
    subcategoryName: 'Hydraulic Storage Bed',
    price: 52999,
    originalPrice: 68999,
    rating: 4.8,
    reviewCount: 147,
    tags: ['Bestseller'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Full Hydraulic Lift Storage under Mattress',
    dimensions: 'Fits 78 × 72 in mattress · 6.8 ft × 6.3 ft × 3.4 ft Height',
    woodType: 'Sheesham Wood Frame with Engineered Wood Box',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'The whole mattress lifts up on hydraulic pistons to reveal a huge storage box. Perfect for quilts, suitcases and off-season clothes.',
    highlights: [
      'Full under-bed storage with hydraulic lift',
      'Lifts easily with one hand, even with the mattress on',
      'Holds quilts, suitcases and seasonal clothes'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-12',
    productName: 'Spacio Hydraulic Queen Storage Bed',
    categoryName: 'Bed',
    subcategoryName: 'Hydraulic Storage Bed',
    price: 42999,
    originalPrice: 55999,
    rating: 4.7,
    reviewCount: 128,
    tags: ['Space Saver'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Full Hydraulic Lift Storage under Mattress',
    dimensions: 'Fits 78 × 60 in mattress · 6.8 ft × 5.3 ft × 3.4 ft Height',
    woodType: 'Sheesham Wood Frame with Engineered Wood Box',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'The queen size version of our bestselling hydraulic bed. Smart storage for flats where every inch counts.',
    highlights: [
      'Hydraulic lift storage under the mattress',
      'Saves the space of a full cupboard',
      'Dust-proof storage box'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-13',
    productName: 'Upholstered Hydraulic Storage Bed',
    categoryName: 'Bed',
    subcategoryName: 'Hydraulic Storage Bed',
    price: 47999,
    originalPrice: 61999,
    rating: 4.6,
    reviewCount: 51,
    tags: ['Modern'],
    colors: [
      { name: 'Ash Grey', hex: '#8A8D91' },
      { name: 'Sand Beige', hex: '#D8C7A8' }
    ],
    material: 'Fabric Headboard with Gas-Lift Storage',
    dimensions: 'Fits 78 × 60 in mattress · 6.9 ft × 5.5 ft × 3.8 ft Height',
    woodType: 'Solid Pine Frame with Engineered Wood Box',
    stockStatus: 'In Stock · 6 Days Delivery',
    description: 'A soft upholstered bed with full hydraulic storage underneath. Combines a modern look with practical storage.',
    highlights: [
      'Padded fabric headboard',
      'Gas-lift storage under the mattress',
      'Fabric-wrapped sides with no sharp edges'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-14',
    productName: 'Drawer Storage King Bed',
    categoryName: 'Bed',
    subcategoryName: 'Hydraulic Storage Bed',
    price: 48999,
    originalPrice: 62999,
    rating: 4.7,
    reviewCount: 63,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham Bed with Hydraulic Lift & 2 Side Drawers',
    dimensions: 'Fits 78 × 72 in mattress · 6.8 ft × 6.3 ft × 3.5 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A king bed with both hydraulic storage under the mattress and two pull-out drawers at the foot for everyday items.',
    highlights: [
      'Hydraulic storage plus two front drawers',
      'Drawers on smooth metal runners',
      'Solid Sheesham frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-15',
    productName: 'Study Room Single Bed',
    categoryName: 'Bed',
    subcategoryName: 'Single Bed',
    price: 14999,
    originalPrice: 19999,
    rating: 4.5,
    reviewCount: 88,
    tags: ['Student Pick'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Natural Oak', hex: '#C9A27E' }
    ],
    material: 'Solid Wood Single Bed with Headboard Shelf',
    dimensions: 'Fits 72 × 36 in mattress · 6.3 ft × 3.3 ft',
    woodType: 'Seasoned Rubberwood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A simple single bed with a small shelf in the headboard for books, a phone and a night lamp. Ideal for students.',
    highlights: [
      'Headboard shelf for books and phone',
      'Compact size for small rooms',
      'Easy to assemble and move'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-16',
    productName: 'Guest Single Bed with Trundle',
    categoryName: 'Bed',
    subcategoryName: 'Single Bed',
    price: 21999,
    originalPrice: 28999,
    rating: 4.6,
    reviewCount: 34,
    tags: ['2-in-1'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Single Bed with Pull-Out Trundle Bed Underneath',
    dimensions: 'Fits two 72 × 36 in mattresses',
    woodType: 'Solid Pine Wood',
    stockStatus: 'In Stock',
    description: 'A single bed with a second bed hidden underneath on wheels. Pull it out for sleepovers and guests, slide it back in after.',
    highlights: [
      'Second bed rolls out from underneath',
      'Sleeps two in the space of one',
      'Smooth, quiet castor wheels'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-17',
    productName: 'Kids Sheesham Single Bed',
    categoryName: 'Bed',
    subcategoryName: 'Single Bed',
    price: 17999,
    originalPrice: 23499,
    rating: 4.7,
    reviewCount: 41,
    tags: ['Kids Pick'],
    colors: [
      { name: 'Teak Brown', hex: '#B87C4C' },
      { name: 'Mint Green', hex: '#A8C9B5' }
    ],
    material: 'Sheesham with Rounded Safety Corners & Low Height',
    dimensions: 'Fits 72 × 36 in mattress · 6.2 ft × 3.2 ft × 2.6 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A low single bed for children with rounded corners and a side guard rail. Safe for kids to climb in and out on their own.',
    highlights: [
      'Low height so kids can climb in easily',
      'Rounded corners and side guard rail',
      'Child-safe, non-toxic polish'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-18',
    productName: 'Maharani Four Poster King Bed',
    categoryName: 'Bed',
    subcategoryName: 'Four Poster Bed',
    price: 79999,
    originalPrice: 104999,
    rating: 4.9,
    reviewCount: 17,
    tags: ['Premium'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Mahogany', hex: '#6B2E1F' }
    ],
    material: 'Teak with Turned Posts & Canopy Frame',
    dimensions: 'Fits 78 × 72 in mattress · 6.8 ft × 6.3 ft × 7 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'Made on Order · 20 Days',
    description: 'A royal four poster bed with hand-turned teak posts and a canopy frame. Drape fabric or fairy lights over it for a palace feel.',
    highlights: [
      'Four hand-turned teak posts',
      'Canopy frame for drapes or lights',
      'Statement piece for large bedrooms'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-19',
    productName: 'Minimal Four Poster Queen Bed',
    categoryName: 'Bed',
    subcategoryName: 'Four Poster Bed',
    price: 44999,
    originalPrice: 57999,
    rating: 4.6,
    reviewCount: 23,
    tags: ['Modern'],
    colors: [
      { name: 'Jet Black', hex: '#1F1F1F' },
      { name: 'Natural Oak', hex: '#C9A27E' }
    ],
    material: 'Slim Wooden Posts with Matte Black Canopy Rails',
    dimensions: 'Fits 78 × 60 in mattress · 6.8 ft × 5.4 ft × 6.5 ft Height',
    woodType: 'Solid Acacia Wood',
    stockStatus: 'Made on Order · 10 Days',
    description: 'A modern take on the four poster with slim acacia posts and matte black rails. Clean, airy and striking.',
    highlights: [
      'Slim posts with a light, modern frame',
      'Matte black canopy rails',
      'Solid acacia wood'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'bed-20',
    productName: 'Adventure Kids Bunk Bed',
    categoryName: 'Bed',
    subcategoryName: 'Bunk Bed',
    price: 34999,
    originalPrice: 44999,
    rating: 4.7,
    reviewCount: 56,
    tags: ['Kids Pick'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Sky Blue', hex: '#8DB3C7' }
    ],
    material: 'Pine Wood Bunk with Ladder & Safety Rails',
    dimensions: 'Fits two 72 × 36 in mattresses · 5.4 ft Height',
    woodType: 'Solid Pine Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A sturdy bunk bed for siblings with full-length safety rails and a built-in ladder. Can be split into two single beds later.',
    highlights: [
      'Full-length safety rails on the top bunk',
      'Splits into two separate single beds',
      'Built-in ladder with wide, flat steps'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- WARDROBE ---
  {
    id: 'wardrobe-1',
    productName: 'Classic Sheesham 2-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '2-Door Wardrobe',
    price: 27999,
    originalPrice: 35999,
    rating: 4.7,
    reviewCount: 96,
    tags: ['Bestseller'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Solid Sheesham with Hanging Rod & 3 Shelves',
    dimensions: '3 ft Width × 1.8 ft Depth × 6 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A solid Sheesham wardrobe with a hanging section on one side and three shelves on the other. Fits neatly into most bedrooms.',
    highlights: [
      'Hanging rod plus three folded-clothes shelves',
      'Solid Sheesham, not particle board',
      'Lockable doors with brass handles'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-2',
    productName: 'Compact 2-Door Wardrobe with Locker',
    categoryName: 'Wardrobe',
    subcategoryName: '2-Door Wardrobe',
    price: 18999,
    originalPrice: 24999,
    rating: 4.5,
    reviewCount: 124,
    tags: ['Best Value'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Engineered Wood with Inner Locker & Drawer',
    dimensions: '2.7 ft Width × 1.7 ft Depth × 6 ft Height',
    woodType: 'Engineered Wood (Termite Treated)',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A budget-friendly 2-door wardrobe with an inner locker for valuables and a drawer for small items. Great for rented homes.',
    highlights: [
      'Inner locker for cash and jewellery',
      'Drawer for socks, belts and small items',
      'Termite-treated engineered wood'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-3',
    productName: 'Cane Door 2-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '2-Door Wardrobe',
    price: 31999,
    originalPrice: 41999,
    rating: 4.8,
    reviewCount: 39,
    tags: ['Handcrafted'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Mango Wood with Woven Cane Door Panels',
    dimensions: '3.2 ft Width × 1.9 ft Depth × 6.2 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'Made on Order · 10 Days',
    description: 'A wardrobe with hand-woven cane door panels that let your clothes breathe. Prevents musty smells in humid weather.',
    highlights: [
      'Woven cane doors let air flow through',
      'Prevents musty smells during monsoon',
      'Solid mango wood frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-4',
    productName: 'Mirror 2-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '2-Door Wardrobe',
    price: 24999,
    originalPrice: 32999,
    rating: 4.6,
    reviewCount: 61,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Engineered Wood with Full-Length Door Mirror',
    dimensions: '3 ft Width × 1.8 ft Depth × 6.3 ft Height',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'A 2-door wardrobe with a full-length mirror on one door, so you do not need a separate dressing mirror.',
    highlights: [
      'Full-length mirror on the door',
      'Saves space on a separate mirror',
      'Two drawers inside'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-5',
    productName: 'Royal Teak 3-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '3-Door Wardrobe',
    price: 54999,
    originalPrice: 71999,
    rating: 4.9,
    reviewCount: 47,
    tags: ['Premium'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Solid Teak with Mirror Door & 2 Drawers',
    dimensions: '4.5 ft Width × 2 ft Depth × 6.5 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'Made on Order · 15 Days',
    description: 'A heavy solid teak wardrobe with a mirror on the centre door. A lifetime piece that resists termites and moisture.',
    highlights: [
      'Solid teak that resists termites and moisture',
      'Mirror on the centre door',
      'Two drawers and a hidden locker'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-6',
    productName: 'Sheesham 3-Door Wardrobe with Drawers',
    categoryName: 'Wardrobe',
    subcategoryName: '3-Door Wardrobe',
    price: 42999,
    originalPrice: 55999,
    rating: 4.7,
    reviewCount: 82,
    tags: ['Customer Favorite'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Sheesham with 3 Drawers & Hanging Section',
    dimensions: '4.4 ft Width × 1.9 ft Depth × 6.3 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A family-size 3-door wardrobe with a long hanging section, shelves and three drawers. Room for two people\'s clothes.',
    highlights: [
      'Long hanging section for sarees and suits',
      'Three drawers along the bottom',
      'Room for two people\'s clothes'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-7',
    productName: 'Family 3-Door Wardrobe with Loft',
    categoryName: 'Wardrobe',
    subcategoryName: '3-Door Wardrobe',
    price: 29999,
    originalPrice: 38999,
    rating: 4.6,
    reviewCount: 103,
    tags: ['Best Value'],
    colors: [
      { name: 'Wenge Brown', hex: '#4A3426' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Engineered Wood with Loft & Locker',
    dimensions: '4.3 ft Width × 1.8 ft Depth × 6.5 ft Height (+ 1.5 ft loft)',
    woodType: 'Engineered Wood (Termite Treated)',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A 3-door wardrobe with an extra loft on top for suitcases and blankets. Lots of storage at a friendly price.',
    highlights: [
      'Top loft for suitcases and blankets',
      'Inner locker for valuables',
      'Soft-close hinges on every door'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-8',
    productName: 'Jaali Carved 3-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '3-Door Wardrobe',
    price: 58999,
    originalPrice: 76999,
    rating: 4.8,
    reviewCount: 21,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham with Hand-Carved Jaali Doors',
    dimensions: '4.6 ft Width × 2 ft Depth × 6.6 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 18 Days',
    description: 'A heritage wardrobe with hand-carved jaali on all three doors. Beautiful to look at and keeps clothes fresh with airflow.',
    highlights: [
      'Hand-carved jaali on all three doors',
      'Airflow keeps clothes fresh',
      'Fabric-lined back panel behind the jaali'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-9',
    productName: 'Grand 4-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '4-Door Wardrobe',
    price: 64999,
    originalPrice: 84999,
    rating: 4.8,
    reviewCount: 35,
    tags: ['Full Family Set'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Sheesham with 4 Drawers, Locker & Mirror',
    dimensions: '6 ft Width × 2 ft Depth × 6.6 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 15 Days',
    description: 'A large 4-door wardrobe that covers a full wall. Two hanging sections, four drawers, a locker and a mirror on the inside door.',
    highlights: [
      'Two full hanging sections',
      'Four drawers and an inner locker',
      'Mirror on the inside of one door'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-10',
    productName: 'Modular 4-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: '4-Door Wardrobe',
    price: 44999,
    originalPrice: 58999,
    rating: 4.6,
    reviewCount: 58,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Natural Oak', hex: '#C9A27E' }
    ],
    material: 'Engineered Wood with Soft-Close Hinges & Loft',
    dimensions: '5.8 ft Width × 1.9 ft Depth × 7 ft Height',
    woodType: 'Engineered Wood with Oak Laminate',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A modular 4-door wardrobe with adjustable shelves you can move as your needs change. Includes a top loft.',
    highlights: [
      'Adjustable shelves you can move anytime',
      'Soft-close hinges, no slamming',
      'Top loft for extra storage'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-11',
    productName: 'Glide 2-Door Sliding Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: 'Sliding Door Wardrobe',
    price: 39999,
    originalPrice: 51999,
    rating: 4.7,
    reviewCount: 77,
    tags: ['Space Saver'],
    colors: [
      { name: 'Wenge Brown', hex: '#4A3426' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Sliding Doors on Aluminium Tracks',
    dimensions: '5 ft Width × 2 ft Depth × 7 ft Height',
    woodType: 'Engineered Wood (Termite Treated)',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'Sliding doors need no swing space, so this wardrobe fits beside the bed even in small rooms. Glides smoothly on aluminium tracks.',
    highlights: [
      'Sliding doors need no opening space',
      'Smooth, quiet aluminium tracks',
      'Fits close to the bed in small rooms'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-12',
    productName: 'Mirror Glide Sliding Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: 'Sliding Door Wardrobe',
    price: 49999,
    originalPrice: 64999,
    rating: 4.8,
    reviewCount: 43,
    tags: ['Modern'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Charcoal', hex: '#2B2B2B' }
    ],
    material: 'Sliding Doors with Full Mirror Panel',
    dimensions: '6 ft Width × 2 ft Depth × 7 ft Height',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A sliding wardrobe with a full-height mirror panel that makes the bedroom look bigger and brighter.',
    highlights: [
      'Full-height mirror makes the room look bigger',
      'Soft-close sliding mechanism',
      'Inner drawers and tie rack'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-13',
    productName: 'Sheesham 3-Door Sliding Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: 'Sliding Door Wardrobe',
    price: 69999,
    originalPrice: 89999,
    rating: 4.9,
    reviewCount: 16,
    tags: ['Premium'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Solid Sheesham with 3 Sliding Doors',
    dimensions: '6.5 ft Width × 2.1 ft Depth × 7 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 20 Days',
    description: 'A rare solid wood sliding wardrobe with three Sheesham doors. The warmth of real wood with the convenience of sliding doors.',
    highlights: [
      'Three solid Sheesham sliding doors',
      'Heavy-duty tracks rated for solid wood',
      'Spacious interior for a full family'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-14',
    productName: 'Kids Pastel 2-Door Wardrobe',
    categoryName: 'Wardrobe',
    subcategoryName: 'Kids Wardrobe',
    price: 17999,
    originalPrice: 23499,
    rating: 4.6,
    reviewCount: 52,
    tags: ['Kids Pick'],
    colors: [
      { name: 'Sky Blue', hex: '#8DB3C7' },
      { name: 'Blush Pink', hex: '#D9A5A0' }
    ],
    material: 'Rounded Corners, Low Hanging Rod & Toy Drawer',
    dimensions: '2.8 ft Width × 1.6 ft Depth × 5 ft Height',
    woodType: 'Engineered Wood (Non-Toxic Paint)',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A child-height wardrobe in soft pastels. The low hanging rod lets kids pick and put away their own clothes.',
    highlights: [
      'Low hanging rod kids can reach',
      'Rounded corners for safety',
      'Big bottom drawer for toys'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'wardrobe-15',
    productName: 'Kids Wardrobe with Study Shelf',
    categoryName: 'Wardrobe',
    subcategoryName: 'Kids Wardrobe',
    price: 22999,
    originalPrice: 29999,
    rating: 4.7,
    reviewCount: 31,
    tags: ['Kids Pick'],
    colors: [
      { name: 'Mint Green', hex: '#A8C9B5' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Wardrobe + Open Book Shelf + Pull-Out Desk',
    dimensions: '3.5 ft Width × 1.7 ft Depth × 5.5 ft Height',
    woodType: 'Solid Pine Wood',
    stockStatus: 'In Stock',
    description: 'A 3-in-1 unit for kids\' rooms: a wardrobe, an open bookshelf and a pull-out study desk, all in one compact piece.',
    highlights: [
      'Wardrobe, bookshelf and desk in one',
      'Pull-out desk folds away after homework',
      'Solid pine with child-safe finish'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },

  // --- DRESSER ---
  {
    id: 'dresser-1',
    productName: 'Rani Sheesham Dressing Table',
    categoryName: 'Dresser',
    subcategoryName: 'Dressing Table with Mirror',
    price: 19999,
    originalPrice: 25999,
    rating: 4.8,
    reviewCount: 87,
    tags: ['Bestseller'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Honey Polish', hex: '#C68B59' }
    ],
    material: 'Sheesham with Oval Mirror & 3 Drawers',
    dimensions: '3 ft Width × 1.4 ft Depth × 5.2 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A classic Sheesham dressing table with a large oval mirror and three drawers for makeup, jewellery and hair accessories.',
    highlights: [
      'Large oval mirror with a tilt adjustment',
      'Three drawers with velvet-lined top drawer',
      'Solid Sheesham frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-2',
    productName: 'Modern LED Mirror Dressing Table',
    categoryName: 'Dresser',
    subcategoryName: 'Dressing Table with Mirror',
    price: 16999,
    originalPrice: 22499,
    rating: 4.6,
    reviewCount: 64,
    tags: ['New Arrival'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Engineered Wood with LED-Lit Mirror & 2 Drawers',
    dimensions: '2.8 ft Width × 1.3 ft Depth × 5 ft Height',
    woodType: 'Engineered Wood (Termite Treated)',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A modern dressing table with a touch-controlled LED mirror. Even, shadow-free light for makeup at any time of day.',
    highlights: [
      'Touch-controlled LED mirror lights',
      'Three light tones: warm, neutral and cool',
      'Two smooth drawers'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-3',
    productName: 'Carved Teak Dressing Table',
    categoryName: 'Dresser',
    subcategoryName: 'Dressing Table with Mirror',
    price: 32999,
    originalPrice: 42999,
    rating: 4.9,
    reviewCount: 23,
    tags: ['Hand-Carved'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Teak with Carved Mirror Frame & 4 Drawers',
    dimensions: '3.4 ft Width × 1.5 ft Depth × 5.6 ft Height',
    woodType: 'Pure CP Teak Wood',
    stockStatus: 'Made on Order · 12 Days',
    description: 'A heritage dressing table with a hand-carved teak mirror frame. A bridal favourite that becomes a family heirloom.',
    highlights: [
      'Hand-carved teak mirror frame',
      'Four drawers with brass handles',
      'A popular bridal furniture gift'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-4',
    productName: 'Compact Corner Dressing Table',
    categoryName: 'Dresser',
    subcategoryName: 'Dressing Table with Mirror',
    price: 11999,
    originalPrice: 15999,
    rating: 4.5,
    reviewCount: 72,
    tags: ['Small Space Pick'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Corner-Fit Unit with Mirror & Shelves',
    dimensions: '2 ft Width × 2 ft Depth × 5 ft Height',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock',
    description: 'A dressing table shaped to fit into a room corner. Uses space that usually goes to waste in small bedrooms.',
    highlights: [
      'Fits into an empty room corner',
      'Mirror plus open and closed shelves',
      'Ideal for small bedrooms'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-5',
    productName: 'Arch Mirror Dressing Table',
    categoryName: 'Dresser',
    subcategoryName: 'Dressing Table with Mirror',
    price: 18499,
    originalPrice: 23999,
    rating: 4.7,
    reviewCount: 38,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Mango Wood with Arched Mirror & Jewellery Drawer',
    dimensions: '3 ft Width × 1.4 ft Depth × 5.3 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'A dressing table with a tall arched mirror and a felt-lined jewellery drawer with small compartments.',
    highlights: [
      'Tall arched mirror',
      'Felt-lined jewellery drawer with compartments',
      'Solid mango wood with natural grain'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-6',
    productName: 'Sheesham 5-Drawer Chest',
    categoryName: 'Dresser',
    subcategoryName: 'Chest of Drawers',
    price: 21999,
    originalPrice: 28499,
    rating: 4.7,
    reviewCount: 59,
    tags: ['Customer Favorite'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Sheesham with 5 Deep Drawers & Brass Knobs',
    dimensions: '2.6 ft Width × 1.5 ft Depth × 4 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock · Free Home Assembly',
    description: 'A tall chest with five deep drawers for clothes, linen and baby things. The top doubles as a display surface.',
    highlights: [
      'Five deep drawers on smooth runners',
      'Antique brass knobs',
      'Top surface for photo frames and decor'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-7',
    productName: 'Jaipur Painted Chest of Drawers',
    categoryName: 'Dresser',
    subcategoryName: 'Chest of Drawers',
    price: 24999,
    originalPrice: 32499,
    rating: 4.8,
    reviewCount: 27,
    tags: ['Handcrafted'],
    colors: [
      { name: 'Teal Blue', hex: '#2F6F73' },
      { name: 'Rust Orange', hex: '#A4553A' }
    ],
    material: 'Hand-Painted Mango Wood with 4 Drawers',
    dimensions: '2.8 ft Width × 1.5 ft Depth × 3.3 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'Made on Order · 10 Days',
    description: 'A colourful chest of drawers hand-painted by Jaipur artisans with traditional floral motifs. Each piece is one of a kind.',
    highlights: [
      'Hand-painted Jaipur floral motifs',
      'Every piece is unique',
      'Four spacious drawers'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-8',
    productName: 'Wide 6-Drawer Dresser Chest',
    categoryName: 'Dresser',
    subcategoryName: 'Chest of Drawers',
    price: 27999,
    originalPrice: 36499,
    rating: 4.6,
    reviewCount: 33,
    tags: ['Diwali Special'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Wenge Brown', hex: '#4A3426' }
    ],
    material: 'Acacia Wood with 6 Drawers in 2 Columns',
    dimensions: '4 ft Width × 1.5 ft Depth × 2.8 ft Height',
    woodType: 'Solid Acacia Wood',
    stockStatus: 'In Stock · 5 Days Delivery',
    description: 'A wide, low chest with six drawers in two columns. Place a mirror above it and it becomes a full dressing station.',
    highlights: [
      'Six drawers in two columns',
      'Wide top works as a dresser surface',
      'Anti-tip wall bracket included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-9',
    productName: 'Slim Tower Chest of Drawers',
    categoryName: 'Dresser',
    subcategoryName: 'Chest of Drawers',
    price: 12999,
    originalPrice: 16999,
    rating: 4.5,
    reviewCount: 81,
    tags: ['Space Saver'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Engineered Wood with 5 Slim Drawers',
    dimensions: '1.6 ft Width × 1.3 ft Depth × 4 ft Height',
    woodType: 'Engineered Wood (Termite Treated)',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A narrow tower of drawers that slips into gaps beside the wardrobe or bed. Lots of storage in very little floor space.',
    highlights: [
      'Only 1.6 ft wide',
      'Five drawers for everyday items',
      'Fits beside wardrobes and beds'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-10',
    productName: 'Maharani Vanity Table with Stool',
    categoryName: 'Dresser',
    subcategoryName: 'Vanity Table with Stool',
    price: 26999,
    originalPrice: 34999,
    rating: 4.8,
    reviewCount: 46,
    tags: ['Premium'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Blush Pink Cushion', hex: '#D9A5A0' }
    ],
    material: 'Sheesham Vanity + Cushioned Stool with Tri-Fold Mirror',
    dimensions: 'Table: 3.2 ft Width × 1.5 ft Depth × 5.2 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'Made on Order · 8 Days',
    description: 'A royal vanity set with a tri-fold mirror and a matching cushioned stool. See every angle while getting ready.',
    highlights: [
      'Tri-fold mirror shows every angle',
      'Matching cushioned stool included',
      'Five drawers for makeup and jewellery'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-11',
    productName: 'Bloom Vanity Table with Stool',
    categoryName: 'Dresser',
    subcategoryName: 'Vanity Table with Stool',
    price: 15999,
    originalPrice: 20999,
    rating: 4.6,
    reviewCount: 69,
    tags: ['Best Value'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Blush Pink', hex: '#D9A5A0' }
    ],
    material: 'Engineered Wood with Flip-Up Mirror & Velvet Stool',
    dimensions: 'Table: 2.6 ft Width × 1.3 ft Depth × 2.5 ft Height',
    woodType: 'Engineered Wood',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'The mirror flips up from inside the tabletop, so it works as a writing desk when closed. Comes with a velvet stool.',
    highlights: [
      'Flip-up mirror hides inside the top',
      'Doubles as a writing desk',
      'Velvet stool included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-12',
    productName: 'Cane Vanity Set with Stool',
    categoryName: 'Dresser',
    subcategoryName: 'Vanity Table with Stool',
    price: 21499,
    originalPrice: 27999,
    rating: 4.7,
    reviewCount: 25,
    tags: ['Handcrafted'],
    colors: [
      { name: 'Natural Oak', hex: '#C9A27E' },
      { name: 'Teak Brown', hex: '#B87C4C' }
    ],
    material: 'Mango Wood Vanity with Cane Drawer Fronts & Stool',
    dimensions: 'Table: 3 ft Width × 1.4 ft Depth × 5 ft Height',
    woodType: 'Solid Mango Wood',
    stockStatus: 'In Stock',
    description: 'A light vanity set with woven cane on the drawer fronts and a matching cane-top stool. Calm and natural.',
    highlights: [
      'Woven cane drawer fronts',
      'Matching cane-top stool',
      'Round mirror with a wooden frame'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-13',
    productName: 'Floating Wall Dresser with Mirror',
    categoryName: 'Dresser',
    subcategoryName: 'Wall-Mounted Dresser',
    price: 9999,
    originalPrice: 13499,
    rating: 4.5,
    reviewCount: 94,
    tags: ['Space Saver'],
    colors: [
      { name: 'Walnut Finish', hex: '#9E6B47' },
      { name: 'Frosty White', hex: '#EDEBE6' }
    ],
    material: 'Wall-Mounted Mirror Cabinet with Floating Drawer',
    dimensions: '2.4 ft Width × 0.8 ft Depth × 3.5 ft Height',
    woodType: 'Engineered Wood with Walnut Laminate',
    stockStatus: 'In Stock · Fast Dispatch',
    description: 'A dresser that hangs on the wall and takes up zero floor space. Mirror on top, a floating drawer and shelf below.',
    highlights: [
      'Takes up zero floor space',
      'Easy to clean the floor underneath',
      'Wall fixing and installation included'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-14',
    productName: 'Sheesham Wall Mirror with Shelf Dresser',
    categoryName: 'Dresser',
    subcategoryName: 'Wall-Mounted Dresser',
    price: 12499,
    originalPrice: 16499,
    rating: 4.6,
    reviewCount: 41,
    tags: ['Festive Deal'],
    colors: [
      { name: 'Honey Polish', hex: '#C68B59' },
      { name: 'Walnut Finish', hex: '#9E6B47' }
    ],
    material: 'Sheesham Mirror Frame + Floating Shelf & 2 Drawers',
    dimensions: '2.6 ft Width × 0.9 ft Depth × 3.8 ft Height',
    woodType: 'Pure Sheesham Wood',
    stockStatus: 'In Stock',
    description: 'A solid Sheesham wall mirror with a floating shelf and two small drawers. A neat dressing corner for compact homes.',
    highlights: [
      'Solid Sheesham mirror frame',
      'Floating shelf with two small drawers',
      'Strong concealed wall brackets'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  },
  {
    id: 'dresser-15',
    productName: 'Hideaway Wall Dresser Cabinet',
    categoryName: 'Dresser',
    subcategoryName: 'Wall-Mounted Dresser',
    price: 14999,
    originalPrice: 19499,
    rating: 4.7,
    reviewCount: 30,
    tags: ['Modern'],
    colors: [
      { name: 'Frosty White', hex: '#EDEBE6' },
      { name: 'Natural Oak', hex: '#C9A27E' }
    ],
    material: 'Mirror Door Opens to Jewellery & Cosmetic Storage',
    dimensions: '2 ft Width × 0.6 ft Depth × 4 ft Height',
    woodType: 'Engineered Wood with Oak Laminate',
    stockStatus: 'In Stock · 4 Days Delivery',
    description: 'Looks like a simple full-length mirror, but opens to reveal shelves and hooks for jewellery, makeup and accessories.',
    highlights: [
      'Full-length mirror on the outside',
      'Hidden jewellery hooks and cosmetic shelves',
      'Lockable door'
    ],
    isActive: true,
    mainImageUrl: '',
    plainImageUrl: '',
    images: []
  }
];

// Category cards for the home view. The catalog adds the design count and
// "From" price from the live products, so they stay correct as products change.
export const CATEGORY_CARDS: { key: MainCategory; title: string; tagline: string }[] = [
  {
    key: 'Sofa',
    title: 'Sofas & Couches',
    tagline: 'L-shape sofas, recliners, sofa cum beds and solid wood diwans.'
  },
  {
    key: 'Wardrobe',
    title: 'Wardrobes',
    tagline: '2, 3 and 4-door wardrobes, sliding wardrobes and kids wardrobes.'
  },
  {
    key: 'Dresser',
    title: 'Dressers & Dressing Tables',
    tagline: 'Dressing tables with mirrors, vanities and chests of drawers.'
  },
  {
    key: 'Bed',
    title: 'Beds',
    tagline: 'King, queen and single beds, hydraulic storage beds and bunk beds.'
  },
  {
    key: 'Dining',
    title: 'Dining Tables & Sets',
    tagline: '2 to 8-seater dining sets, benches and bar stools.'
  },
  {
    key: 'CenterTable',
    title: 'Center Tables',
    tagline: 'Rectangular, round, nesting, storage and lift-top center tables.'
  },
  {
    key: 'Chair',
    title: 'Chairs & Armchairs',
    tagline: 'Armchairs, rocking chairs, study chairs and dining chairs.'
  }
];

// Curated Diwali Festive Banners
export interface DiwaliBanner {
  id: string;
  badge: string;
  title: string;
  headline: string;
  description: string;
  highlight: string;
  ctaText: string;
  gradient: string;
  categoryLink: MainCategory;
  categoryName: string;
}

export const DIWALI_BANNERS: DiwaliBanner[] = [
  {
    id: 'diwali-maha-utsav',
    badge: 'DIWALI MAHA UTSAV 2026',
    title: 'Solid Wood Festive Celebration',
    headline: 'Up to 45% Off + Extra ₹2,500 Off',
    description: '100% Real Teak & Sheesham Wood Furniture for Indian Homes.',
    highlight: 'Free Doorstep Assembly in Local Region',
    ctaText: 'Claim Festive Offer',
    gradient: 'from-[#7C2D12] via-[#9A3412] to-[#B45309]',
    categoryLink: 'Sofa',
    categoryName: 'Living Room'
  },
  {
    id: 'diwali-shubh-combo',
    badge: 'SHUBH LABH LIVING COMBO',
    title: 'Living Room Festive Bundle',
    headline: 'Save ₹14,000 + Assured Silver Diya',
    description: 'Nilgiri L-Shape Sofa + Udaipur Real Brass Wire Center Table.',
    highlight: 'Guaranteed Festive Delivery in Local Region',
    ctaText: 'View Combo Offer',
    gradient: 'from-[#854D0E] via-[#A16207] to-[#713F12]',
    categoryLink: 'CenterTable',
    categoryName: 'Combos'
  },
  {
    id: 'diwali-puja-dining',
    badge: 'PUJA & FESTIVE FEAST SPECIAL',
    title: 'Family Gathering Dining Sets',
    headline: 'Flat 25% Off Solid Teak Dining',
    description: 'Royal Teak 6-Seater Table + 4 Chairs + Solid Wood Bench.',
    highlight: 'Includes Free Pure Brass Diya Gift Set',
    ctaText: 'Explore Dining Deals',
    gradient: 'from-[#78350F] via-[#92400E] to-[#B45309]',
    categoryLink: 'Dining',
    categoryName: 'Dining Sets'
  }
];

// Diwali Festive Offers Strip Data (Direct automatic savings, no coupon codes required)
export interface DiwaliOffer {
  id: string;
  title: string;
  benefit: string;
  desc: string;
  minOrder: string;
  tag: string;
}

export const DIWALI_OFFERS: DiwaliOffer[] = [
  {
    id: 'diwali-instant-markdown',
    title: 'Festive Cash Savings',
    benefit: 'Instant ₹2,500 Off',
    desc: 'Direct markdown on furniture orders above ₹25,000',
    minOrder: 'Applied automatically on booking',
    tag: 'Festive Special'
  },
  {
    id: 'diwali-combo-savings',
    title: 'Living Room Combo Deal',
    benefit: 'Extra 10% Off Bundles',
    desc: 'Extra savings on Sofa + Coffee Table pairings',
    minOrder: 'Automatic bundle discount',
    tag: 'Combo Offer'
  },
  {
    id: 'diwali-dining-puja',
    title: 'Puja Dining Special',
    benefit: 'Flat ₹4,000 Off Sets',
    desc: 'Discounted on 6-Seater Royal Teak Dining Tables',
    minOrder: 'Family dining collection',
    tag: 'Festive Feast'
  }
];

// Diwali announcement ribbon in the header.
export const FESTIVE_RIBBON = {
  label: 'Diwali Mahotsav:',
  text: 'Flat ₹2,500 Festive Savings on orders above ₹25,000',
  badge: 'Diwali Special',
};

// Complimentary gift card shown after the offers strip.
export const FESTIVE_GIFT = {
  tag: 'Festive Gift',
  title: 'Pure Brass Diya Set',
  description:
    'Complimentary traditional brass diya set + timber care oil with every festive pre-order!',
};

// Festive note shown inside the product details sheet.
export const FESTIVE_PRIVILEGE = {
  title: 'Diwali Festive Privilege',
  badge: 'Festive Discount Active',
  intro: 'Order for local region delivery before Diwali. Includes',
  perks: ['Free Solid Wood Assembly', 'Free Brass Diya Gift Set'],
};

// Starting value of the "Diwali Dhamaka Deals" countdown (loops when it hits zero).
export const DEALS_COUNTDOWN_START = { days: 2, hours: 14, mins: 38, secs: 45 };

// Products shown in "Diwali Dhamaka Deals", in order.
export const DIWALI_PICK_IDS = ['sofa-2', 'dining-1', 'center-table-1', 'chair-1'];

// Products already saved when the demo first loads.
export const INITIAL_WISHLIST_IDS = ['sofa-1', 'dining-1'];

// ---------------------------------------------------------------------------
// Home screen
// ---------------------------------------------------------------------------

// Round "story" shortcuts at the top of the home screen.
export type StoryHighlight =
  | { title: string; icon: string; action: 'offers' }
  | { title: string; icon: string; action: 'whatsapp' }
  | { title: string; icon: string; action: 'category'; category: MainCategory };

export const STORY_HIGHLIGHTS: StoryHighlight[] = [
  { title: 'Diwali Deals', icon: '🪔', action: 'offers' },
  { title: 'Sofas', icon: '🛋️', action: 'category', category: 'Sofa' },
  { title: 'Wardrobes', icon: '🚪', action: 'category', category: 'Wardrobe' },
  { title: 'Dressers', icon: '🪞', action: 'category', category: 'Dresser' },
  { title: 'Beds', icon: '🛏️', action: 'category', category: 'Bed' },
  { title: 'Dining', icon: '🍽️', action: 'category', category: 'Dining' },
  { title: 'Tables', icon: '☕', action: 'category', category: 'CenterTable' },
  { title: 'Chairs', icon: '🪑', action: 'category', category: 'Chair' },
  { title: 'Custom', icon: '✨', action: 'whatsapp' },
];

// "Popular:" quick-search chips.
export const POPULAR_SEARCHES = ['L-Shape', 'King Size', 'Hydraulic', 'Sliding', 'Dressing Table', 'Recliner', 'Sheesham'];

export const CUSTOM_ORDER_CARD = {
  title: 'Need Custom Dimensions?',
  description: 'We customize Sheesham and Teak wood to fit your room dimensions.',
};

export const TRUST_POINTS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: Truck, title: 'Free Delivery', subtitle: 'Local Region' },
  { icon: ShieldCheck, title: '10-Yr Warranty', subtitle: 'Termite Proof' },
  { icon: RotateCcw, title: '0% No-Cost EMI', subtitle: 'Major Cards' },
];

// ---------------------------------------------------------------------------
// Help screen
// ---------------------------------------------------------------------------

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'Can I customize the sofa size or wood finish?',
    a: 'Yes! Send your room photos or dimensions via WhatsApp and our carpenter will prepare custom plans.',
  },
  {
    q: 'How is the delivery and assembly handled?',
    a: 'We provide free doorstep delivery with our trained carpenters doing complete assembly.',
  },
  {
    q: 'What payment modes are accepted?',
    a: 'UPI, credit/debit cards with 0% EMI options, and cash on delivery for selected cities.',
  },
];

// ---------------------------------------------------------------------------
// WhatsApp message templates (pre-filled text when a customer taps a button)
// ---------------------------------------------------------------------------

const hello = `Hello ${STORE.name}!`;
const festiveHello = `${hello} 🪔 Happy Diwali!`;

export const WHATSAPP_MESSAGES = {
  general: () =>
    `${hello} I am looking for furniture for my home. Please share your latest festive catalog and prices.`,

  product: (p: CatalogProduct) =>
    `${hello} I am interested in this item:\n` +
    `• Item: ${p.productName}\n` +
    `• Offer Price: ${formatINR(p.price)}\n` +
    `• Type: ${p.categoryName} - ${p.subcategoryName}\n` +
    `• Wood: ${p.woodType}\n` +
    `• Size: ${p.dimensions}\n\n` +
    `Please share real photos, color options, and delivery time to my address.`,

  productFestivePrice: (p: CatalogProduct) =>
    `${festiveHello} I want to claim the Diwali Festive Price for:\n` +
    `• ${p.productName} (${formatINR(p.price)})\n` +
    `• Category: ${p.categoryName} - ${p.subcategoryName}\n` +
    `• Wood: ${p.woodType}\n\n` +
    `Please confirm the festive discount and local delivery timeline.`,

  festiveRibbon: () =>
    `${festiveHello} I want to avail the Diwali Mahotsav festive discounts for solid wood furniture. Please share offers and pricing.`,

  banner: (b: DiwaliBanner) =>
    `${festiveHello} I want to claim the festive offer: "${b.title} - ${b.headline}". Please share available designs and festive pricing.`,

  offer: (o: DiwaliOffer) =>
    `${festiveHello} I want to avail the festive offer: "${o.title} - ${o.benefit}". Please share details and delivery timeline to my local address.`,

  festiveGift: () =>
    `${festiveHello} I am booking solid wood furniture and would like to claim the complimentary Pure Brass Diya Gift Set.`,

  customDimensions: () =>
    'Hello! I need custom dimensions for my room furniture. Can I share photos and measurements?',

  searchNotFound: (query: string) =>
    `${hello} I was searching for "${query}". Can you make this custom in teak or sheesham?`,

  wishlistPackage: (items: CatalogProduct[]) =>
    `${hello} I have saved ${items.length} items in my wishlist:\n` +
    items.map((p) => `• ${p.productName} (${formatINR(p.price)})`).join('\n') +
    `\n\nCan you give a package offer and delivery time for all of these?`,
};

// Categories and their known subcategories, used by the admin product form.
export const CATALOG_CATEGORIES: { name: MainCategory; subcategories: string[] }[] = MAIN_CATEGORIES.map((name) => ({
  name,
  subcategories: Array.from(
    new Set(PRODUCTS.filter((p) => p.categoryName === name).map((p) => p.subcategoryName))
  ),
}));

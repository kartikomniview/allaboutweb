"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronDown,
  CircleCheck,
  FileText,
  GripVertical,
  ImagePlus,
  Images,
  IndianRupee,
  Info,
  Layers,
  ListChecks,
  MessageSquareQuote,
  Palette,
  Plus,
  RotateCcw,
  Ruler,
  SlidersHorizontal,
  Sparkles,
  Star,
  Trash2,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { AuthError } from "@/lib/adminAuth";
import {
  IMAGE_TYPES,
  checkImageFile,
  checkImageSize,
  discardUploads,
  discountPercent,
  MAX_SPECS,
  productToInput,
  requestImageUploads,
  updateProduct,
  uploadToS3,
  type ImageUpload,
  type Product,
  type ProductColor,
  type ProductInput,
  type ProductSpec,
} from "@/lib/adminProducts";
import { categoryLabel, storeCategories } from "@/lib/taxonomy";
import { toWebP } from "@/lib/imageToWebp";
import { detectFromFile, detectFromUrl, type DetectContext, type DetectedProduct } from "@/lib/productDetect";
import { useAdminUser, useLiveCatalogUrl } from "../AdminShell";
import { AuthProgress, authButtonClass, authSecondaryButtonClass, useTyping } from "../AuthLayout";
import { ripple } from "../ripple";
import { Button, Spinner } from "../ui";
import ConfirmDialog from "./ConfirmDialog";
import CategoryCombobox, { type ComboOption } from "./CategoryCombobox";
import { useOverlay } from "./useOverlay";

// Compact control sizing: 16px text on phones (avoids iOS zoom), 13px from sm up.
const inputClass =
  "h-9 w-full rounded-[7px] border border-line bg-white px-2.5 text-base text-ink transition placeholder:text-slate/55 hover:border-[#d3d7e2] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15 sm:text-[13px]";

// Numbers are kept as strings while editing so fields can be empty mid-typing.
type FormState = Omit<ProductInput, "price" | "originalPrice" | "rating" | "reviewCount" | "keywords" | "specs"> & {
  keywords: string[];
  specs: ProductSpec[];
  price: string;
  originalPrice: string;
  rating: string;
  reviewCount: string;
};

// Images with the cover (mainImageUrl) moved to the front.
const coverFirst = (images: string[], cover: string) =>
  cover && images.includes(cover) ? [cover, ...images.filter((u) => u !== cover)] : images;

function toFormState(product: Product | null): FormState {
  if (!product) {
    return {
      productName: "",
      // Empty: the first photo's detection fills it (or the owner picks one).
      categoryName: "",
      subcategoryName: "",
      price: "",
      originalPrice: "",
      tags: [],
      keywords: [],
      rating: "0",
      reviewCount: "0",
      colors: [],
      material: "",
      dimensions: "",
      woodType: "",
      specs: [],
      stockStatus: "In Stock",
      description: "",
      highlights: [],
      isActive: true,
      mainImageUrl: "",
      plainImageUrl: "",
      images: [],
    };
  }
  return {
    productName: product.productName,
    categoryName: product.categoryName,
    subcategoryName: product.subcategoryName,
    // 0 means "no price" (price on request): show an empty field.
    price: product.price > 0 ? String(product.price) : "",
    originalPrice: product.originalPrice > 0 ? String(product.originalPrice) : "",
    tags: product.tags,
    keywords: product.keywords ?? [],
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    colors: product.colors,
    material: product.material,
    dimensions: product.dimensions,
    woodType: "", // shown as a "Wood" spec (normalizeProduct)
    specs: product.specs,
    stockStatus: product.stockStatus,
    description: product.description,
    highlights: product.highlights,
    isActive: product.isActive,
    // The first image is the cover; older products may have it elsewhere in the list.
    mainImageUrl: product.mainImageUrl || product.images[0] || "",
    plainImageUrl: product.plainImageUrl,
    images: coverFirst(product.images, product.mainImageUrl),
  };
}

// Returns the API payload, or an error message for the first invalid field.
function toInput(form: FormState): ProductInput | string {
  // Pricing is optional. With neither price the product shows "Price on
  // request" (stored as 0); with only an MRP, the MRP is the price.
  const offerText = form.price.trim();
  const mrpText = form.originalPrice.trim();
  const offer = Number(offerText || 0);
  const mrp = Number(mrpText || 0);
  const price = offerText ? offer : mrp;
  const originalPrice = mrpText ? mrp : price;
  const rating = Number(form.rating || 0);
  const reviewCount = Number(form.reviewCount || 0);

  if (!form.productName.trim()) return "Enter a product name.";
  if (form.images.length === 0) return "Add at least one product image.";
  if (!form.categoryName) return "Choose a category.";
  if (!form.subcategoryName.trim()) return "Choose a subcategory.";
  if (!Number.isFinite(offer) || offer < 0) return "Enter a valid offer price, or leave it empty.";
  if (!Number.isFinite(mrp) || mrp < 0) return "Enter a valid MRP, or leave it empty.";
  if (originalPrice < price) return "MRP cannot be lower than the price.";
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return "Rating must be between 0 and 5.";
  if (!Number.isInteger(reviewCount) || reviewCount < 0) return "Review count must be a whole number.";
  if (form.colors.some((c) => !c.name.trim())) return "Every colour needs a name.";
  if (form.specs.some((sp) => sp.value.trim() && !sp.label.trim())) return "Every spec needs a name, e.g. Material or Size.";

  return {
    productName: form.productName,
    categoryName: form.categoryName,
    subcategoryName: form.subcategoryName,
    price,
    originalPrice,
    tags: form.tags,
    keywords: form.keywords,
    rating,
    reviewCount,
    colors: form.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
    material: form.material,
    dimensions: form.dimensions,
    woodType: "",
    specs: form.specs
      .map((sp) => ({ label: sp.label.trim(), value: sp.value.trim() }))
      .filter((sp) => sp.label && sp.value),
    stockStatus: form.stockStatus,
    description: form.description,
    highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
    isActive: form.isActive,
    mainImageUrl: form.mainImageUrl,
    plainImageUrl: form.plainImageUrl,
    images: form.images,
  };
}

/* ---------- Layout pieces ---------- */

function Section({
  title,
  required = false,
  icon: Icon,
  description,
  summary,
  action,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title: string;
  required?: boolean;
  icon: LucideIcon;
  description?: string;
  summary?: ReactNode;
  /** Button shown on the right of the header (non-collapsible sections only). */
  action?: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const heading = (
    <>
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate" aria-hidden />
      <span className="text-[13px] font-semibold text-ink">
        {title}
        {required && <span className="text-primary" aria-hidden>*</span>}
      </span>
      {description && open && (
        <span className="hidden truncate text-xs font-normal text-slate sm:inline">· {description}</span>
      )}
      <span className="ml-auto flex min-w-0 items-center gap-2">
        {!collapsible && action}
        {!open && summary && <span className="truncate text-xs text-slate">{summary}</span>}
        {collapsible && (
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-slate transition-transform ${open ? "" : "-rotate-90"}`}
            aria-hidden
          />
        )}
      </span>
    </>
  );

  return (
    <section className="shrink-0 overflow-hidden rounded-[10px] border border-line bg-white">
      {collapsible ? (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className={`flex h-10 w-full items-center gap-2 px-3.5 text-left transition-colors hover:bg-paper/60 ${
            open ? "border-b border-line" : ""
          }`}
        >
          {heading}
        </button>
      ) : (
        <div className="flex h-10 items-center gap-2 border-b border-line px-3.5">{heading}</div>
      )}
      {open && <div className="flex flex-col gap-3 p-3.5">{children}</div>}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="mb-1 flex items-center gap-0.5 text-xs font-medium text-ink/80">
        {label}
        {required && <span className="text-primary" aria-hidden>*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-slate">{hint}</span>}
    </label>
  );
}

function MoneyInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-xs text-slate">₹</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} pl-6 tabular-nums`}
        placeholder={placeholder}
      />
    </div>
  );
}

function TagInput({
  tags,
  onChange,
  badge = true,
  maxItems,
  labelledBy,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** The first tag is the card badge (marked with a star). */
  badge?: boolean;
  maxItems?: number;
  labelledBy?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim().replace(/,$/, "").trim();
    const full = maxItems !== undefined && tags.length >= maxItems;
    if (tag && !full && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...tags, tag]);
    setDraft("");
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  }

  return (
    <div className="flex min-h-9 flex-wrap items-center gap-1 rounded-[7px] border border-line bg-white px-1.5 py-1 transition hover:border-[#d3d7e2] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-primary/15">
      {tags.map((tag, i) => (
        <span
          key={tag}
          className={`inline-flex h-6 items-center gap-1 rounded-[5px] pl-1.5 pr-0.5 text-[11px] font-semibold ring-1 ring-inset ${
            badge && i === 0 ? "bg-tint text-[#c4501a] ring-primary/20" : "bg-ink/[0.04] text-ink ring-ink/10"
          }`}
        >
          {badge && i === 0 && <Star className="h-2.5 w-2.5 fill-current" aria-label="Badge" />}
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="grid h-4 w-4 place-items-center rounded hover:bg-ink/10"
            aria-label={`Remove ${tag}`}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        aria-labelledby={labelledBy}
        placeholder={tags.length ? (badge ? "Add tag…" : "Add keyword…") : "Type and press Enter"}
        className="h-6 min-w-[7rem] flex-1 bg-transparent px-1 text-base text-ink placeholder:text-slate/55 focus:outline-none sm:text-[13px]"
      />
    </div>
  );
}

const iconBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-[7px] text-slate transition-colors hover:bg-red-50 hover:text-red-600";

function AddRowButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 self-start rounded-[7px] border border-dashed border-line px-2.5 text-xs font-semibold text-slate transition-colors hover:border-primary/50 hover:text-primary"
    >
      <Plus className="h-3.5 w-3.5" aria-hidden />
      {children}
    </button>
  );
}

/* ---------- Images (uploaded to S3 through signed forms from the Lambda) ---------- */

const MAX_PRODUCT_IMAGES = 20;

type ImageFields = Pick<ProductInput, "images" | "mainImageUrl" | "plainImageUrl">;
type ImageSaveState = "idle" | "saving" | "saved" | "error";

const pickImages = (f: ImageFields): ImageFields => ({
  images: f.images,
  mainImageUrl: f.mainImageUrl,
  plainImageUrl: f.plainImageUrl,
});

// Removes matching items in place (the array is shared with an effect
// cleanup, so it must not be replaced). Returns whether anything matched.
function removeWhere<T>(list: T[], match: (item: T) => boolean): boolean {
  let removed = false;
  for (let i = list.length - 1; i >= 0; i--) {
    if (match(list[i])) {
      list.splice(i, 1);
      removed = true;
    }
  }
  return removed;
}

/** `label` names what the latest save was for; `seq` replays the pop-in on every save. */
type ImageSaveStatus = { state: ImageSaveState; label: string; seq: number };

function AutoSaveStatus({ status: { state, label, seq } }: { status: ImageSaveStatus }) {
  if (state === "saving") {
    return (
      <span role="status" className="inline-flex items-center gap-1 text-slate">
        <Spinner className="h-3 w-3" /> Saving…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span key={seq} role="status" className="admin-pop-in inline-flex items-center gap-1 font-medium text-emerald-700">
        <CircleCheck className="h-3 w-3" aria-hidden /> {label}
      </span>
    );
  }
  if (state === "error") {
    return (
      <span className="font-medium text-red-700">
        Couldn&apos;t save images. Click &ldquo;Save changes&rdquo; to retry.
      </span>
    );
  }
  return <span className="text-slate">Image changes are saved automatically.</span>;
}

// `detecting`: waiting for the product details to be detected from the photo.
// `converting`: true until the file has been resized and converted to WebP.
type PendingUpload = {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  detecting?: boolean;
  converting?: boolean;
};

const NEEDS_DETAILS = "Couldn't detect the product. Fill in the name, category and subcategory, then Retry.";

type ImageFolder = Pick<ProductInput, "productName" | "categoryName" | "subcategoryName">;

// Images are stored in S3 folders named after these, so all three are needed to upload.
const isCompleteFolder = (f: ImageFolder) =>
  Boolean(f.productName.trim() && f.categoryName.trim() && f.subcategoryName.trim());

function ImageManager({
  images,
  folder,
  onUploaded,
  onRemove,
  onReorder,
  onBusyChange,
  onDetect,
  autoSave,
  hero = false,
}: {
  /** Step-by-step flow: a large empty state with "Take photo" (camera) and "Gallery". */
  hero?: boolean;
  images: string[];
  folder: ImageFolder;
  onUploaded: (url: string) => void;
  onRemove: (url: string) => void;
  /** The images in their new order. The first one is the cover. */
  onReorder: (images: string[]) => void;
  onBusyChange: (busy: boolean) => void;
  /** Detects the details from a photo and fills the empty fields. Resolves with the
   *  folder fields after filling (still incomplete if detection failed). */
  onDetect: (file: File) => Promise<ImageFolder>;
  /** Auto-save state for an existing product; null for a new one. */
  autoSave: ImageSaveStatus | null;
}) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  // Brief confirmation shown on the tile whose Main/Plain button was just clicked.
  const [flash, setFlash] = useState<{ url: string; text: string; id: number } | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(flashTimer.current), []);
  const flashTile = (url: string, text: string) => {
    clearTimeout(flashTimer.current);
    setFlash((f) => ({ url, text, id: (f?.id ?? 0) + 1 }));
    flashTimer.current = setTimeout(() => setFlash(null), 1800);
  };
  const [rejected, setRejected] = useState<string[]>([]);
  // Reordering photos by dragging the handle (pointer events: touch, mouse and pen).
  // The dragged photo follows the pointer exactly (a transform set straight on the
  // element, no re-render per move); the others glide to their new places (FLIP);
  // the scroll area scrolls when the pointer nears its top or bottom edge.
  const [dragging, setDraggingUrl] = useState<string | null>(null);
  const [liveOrder, setLiveOrder] = useState<string[] | null>(null);
  const shownImages = liveOrder ?? images;
  const gridRef = useRef<HTMLDivElement>(null);
  const tileEls = useRef(new Map<string, HTMLDivElement>());
  const slotPos = useRef(new Map<string, { x: number; y: number }>());
  const drag = useRef<{ url: string; grabX: number; grabY: number; x: number; y: number } | null>(null);
  const scrollFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(scrollFrame.current), []);

  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Keep the dragged photo under the pointer, wherever its slot is now.
  const placeDragged = () => {
    const d = drag.current;
    const grid = gridRef.current;
    const el = d && tileEls.current.get(d.url);
    if (!d || !grid || !el) return;
    const g = grid.getBoundingClientRect();
    const x = d.x - d.grabX - (g.left + el.offsetLeft);
    const y = d.y - d.grabY - (g.top + el.offsetTop);
    el.style.transform = `translate3d(${x}px, ${y}px, 0) scale(1.04)`;
  };

  // After the order changes: slide the other photos from their old slot to the new one.
  useLayoutEffect(() => {
    const animate = !reduceMotion();
    for (const [url, el] of tileEls.current) {
      const now = { x: el.offsetLeft, y: el.offsetTop };
      const before = slotPos.current.get(url);
      slotPos.current.set(url, now);
      if (!animate || !before || url === drag.current?.url) continue;
      const dx = before.x - now.x;
      const dy = before.y - now.y;
      if (dx || dy) {
        el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }], {
          duration: 220,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        });
      }
    }
    placeDragged();
  }, [shownImages]);

  const commitOrder = (next: string[]) => {
    if (next.join("\n") === images.join("\n")) return;
    onReorder(next);
    if (next[0] !== images[0]) flashTile(next[0], "Now the cover");
  };

  // Scrolls the drawer while the pointer is near its top or bottom edge.
  const scrollLoop = () => {
    const d = drag.current;
    if (!d) return;
    const scroller = gridRef.current?.closest(".overflow-y-auto") as HTMLElement | null;
    if (scroller) {
      const r = scroller.getBoundingClientRect();
      const edge = 72;
      const dy =
        d.y < r.top + edge ? -Math.ceil((r.top + edge - d.y) / 6) : d.y > r.bottom - edge ? Math.ceil((d.y - (r.bottom - edge)) / 6) : 0;
      if (dy) {
        scroller.scrollTop += dy;
        placeDragged();
      }
    }
    scrollFrame.current = requestAnimationFrame(scrollLoop);
  };

  function startDrag(e: ReactPointerEvent<HTMLButtonElement>, url: string) {
    if (e.button !== 0) return;
    const el = tileEls.current.get(url);
    if (!el) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = el.getBoundingClientRect();
    drag.current = { url, grabX: e.clientX - r.left, grabY: e.clientY - r.top, x: e.clientX, y: e.clientY };
    setDraggingUrl(url);
    setLiveOrder(images);
    placeDragged();
    cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(scrollLoop);
  }

  function moveDrag(e: ReactPointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    const grid = gridRef.current;
    if (!d || !grid || !liveOrder) return;
    d.x = e.clientX;
    d.y = e.clientY;
    placeDragged();
    // Over another photo's slot (slot positions, not the moving elements)?
    const g = grid.getBoundingClientRect();
    for (const [url, el] of tileEls.current) {
      if (url === d.url) continue;
      const left = g.left + el.offsetLeft;
      const top = g.top + el.offsetTop;
      if (d.x >= left && d.x <= left + el.offsetWidth && d.y >= top && d.y <= top + el.offsetHeight) {
        const next = liveOrder.filter((u) => u !== d.url);
        next.splice(liveOrder.indexOf(url), 0, d.url);
        setLiveOrder(next);
        break;
      }
    }
  }

  function endDrag() {
    const d = drag.current;
    if (!d) return;
    cancelAnimationFrame(scrollFrame.current);
    drag.current = null;
    // Settle the dropped photo into its slot.
    const el = tileEls.current.get(d.url);
    if (el) {
      const from = el.style.transform;
      el.style.transform = "";
      if (from && !reduceMotion()) {
        el.animate([{ transform: from }, { transform: "translate3d(0, 0, 0) scale(1)" }], {
          duration: 180,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        });
      }
    }
    if (liveOrder) commitOrder(liveOrder);
    setDraggingUrl(null);
    setLiveOrder(null);
  }

  // Keyboard: arrow keys on the handle move the photo one place.
  function keyMove(e: KeyboardEvent<HTMLButtonElement>, url: string) {
    const step = e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : 0;
    if (!step) return;
    e.preventDefault();
    const from = images.indexOf(url);
    const to = Math.min(Math.max(from + step, 0), images.length - 1);
    if (to === from) return;
    const next = images.filter((u) => u !== url);
    next.splice(to, 0, url);
    commitOrder(next);
  }
  const [fileOver, setDragging] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef(new Set<string>());

  const canUpload = isCompleteFolder(folder);
  // While a detection runs, photos added meanwhile wait for the same result.
  const detection = useRef<Promise<ImageFolder> | null>(null);
  const busy = pending.some((p) => !p.error);
  const slotsLeft = MAX_PRODUCT_IMAGES - images.length - pending.length;

  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);
  // Free the local previews when the drawer closes.
  useEffect(() => {
    const previews = previewsRef.current;
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const patch = (id: string, change: Partial<PendingUpload>) =>
    setPending((list) => list.map((p) => (p.id === id ? { ...p, ...change } : p)));

  const dropPending = (id: string) => {
    URL.revokeObjectURL(id);
    previewsRef.current.delete(id);
    setPending((list) => list.filter((p) => p.id !== id));
  };

  async function upload(batch: PendingUpload[], target: ImageFolder) {
    // Resize and convert to WebP first (once: a retry reuses the converted file).
    const optimized = await Promise.all(
      batch.map(async (item) => {
        if (!item.converting) return item;
        const file = await toWebP(item.file);
        patch(item.id, { file, converting: false });
        return { ...item, file, converting: false };
      }),
    );
    const items = optimized.filter((item) => {
      const error = checkImageSize(item.file);
      if (error) patch(item.id, { error });
      return !error;
    });
    if (!items.length) return;

    let targets: ImageUpload[];
    try {
      targets = await requestImageUploads(target, items.map((i) => i.file));
    } catch (err) {
      const error = err instanceof Error ? err.message : "Could not start the upload.";
      items.forEach((i) => patch(i.id, { error }));
      return;
    }
    await Promise.all(
      items.map(async (item, n) => {
        try {
          const url = await uploadToS3(targets[n], item.file, (progress) => patch(item.id, { progress }));
          onUploaded(url);
          dropPending(item.id);
        } catch (err) {
          patch(item.id, { error: err instanceof Error ? err.message : "Upload failed." });
        }
      }),
    );
  }

  function addFiles(list: FileList | File[] | null) {
    if (!list?.length) return;
    const errors: string[] = [];
    const accepted = Array.from(list).filter((file) => {
      const problem = checkImageFile(file);
      if (problem) errors.push(problem);
      return !problem;
    });
    if (accepted.length > slotsLeft) errors.push(`Only ${MAX_PRODUCT_IMAGES} images per product.`);
    setRejected(errors);

    const items = accepted.slice(0, Math.max(slotsLeft, 0)).map((file) => {
      const preview = URL.createObjectURL(file);
      previewsRef.current.add(preview);
      return { id: preview, file, preview, progress: 0, detecting: !canUpload, converting: true };
    });
    if (!items.length) return;
    setPending((current) => [...current, ...items]);
    if (canUpload) return uploadAll(items, folder);

    // No name/category/subcategory yet: detect them from the first photo, then
    // upload into the folder they name.
    detection.current ??= onDetect(items[0].file).finally(() => (detection.current = null));
    detection.current.then((detected) => {
      if (!isCompleteFolder(detected)) {
        items.forEach((i) => patch(i.id, { detecting: false, error: NEEDS_DETAILS }));
        return;
      }
      items.forEach((i) => patch(i.id, { detecting: false }));
      uploadAll(
        items.map((i) => ({ ...i, detecting: false })),
        detected,
      );
    });
  }

  // The Lambda signs at most 10 uploads per request.
  function uploadAll(items: PendingUpload[], target: ImageFolder) {
    for (let i = 0; i < items.length; i += 10) upload(items.slice(i, i + 10), target);
  }

  const retry = (item: PendingUpload) => {
    if (!canUpload) return patch(item.id, { error: NEEDS_DETAILS });
    patch(item.id, { error: undefined, progress: 0 });
    upload([{ ...item, error: undefined, progress: 0 }], folder);
  };

  // Paste (Ctrl/Cmd+V) anywhere in the drawer adds copied images, e.g. a
  // screenshot or an image copied from a website. Ordinary text pastes into
  // inputs are left alone.
  const addFilesRef = useRef(addFiles);
  useEffect(() => {
    addFilesRef.current = addFiles;
  });
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (!files.length) return;
      const inTextField = (e.target as HTMLElement | null)?.closest("input, textarea, [contenteditable='true']");
      if (inTextField && e.clipboardData?.getData("text/plain")) return;
      e.preventDefault();
      addFilesRef.current(files);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const dropProps = {
    onDragOver: (e: DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);
      addFiles(e.dataTransfer.files);
    },
  };

  const picker = (
    <input
      ref={inputRef}
      type="file"
      accept={IMAGE_TYPES.join(",")}
      multiple
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  // Opens the camera on phones (falls back to the file picker elsewhere).
  const camera = (
    <input
      ref={cameraRef}
      type="file"
      accept="image/*"
      capture="environment"
      className="sr-only"
      tabIndex={-1}
      onChange={(e) => {
        addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const empty = images.length === 0 && pending.length === 0;
  const tile = "flex flex-col overflow-hidden rounded-md border bg-white transition-shadow";
  const tileFooter = "grid grid-cols-2 gap-1.5 border-t border-line bg-paper/70 p-1.5";
  const footerBtn =
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-[7px] text-[12px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/25";
  const footerBtnIdle = "bg-white text-slate ring-1 ring-inset ring-line hover:text-ink hover:ring-[#cfd4df]";

  return (
    <>
      {empty && hero ? (
        <div
          {...dropProps}
          className={`flex flex-col items-center gap-4 rounded-md border border-dashed px-5 py-9 text-center transition-colors ${
            fileOver ? "border-primary bg-tint/60" : "border-[#cfd4df] bg-paper/40"
          }`}
        >
          <span className="grid h-14 w-14 place-items-center rounded-full bg-tint text-primary">
            <ImagePlus className="h-6 w-6" aria-hidden />
          </span>
          <div>
            <p className="text-[15px] font-semibold text-ink">Add product photos</p>
            <p className="mt-1 text-[13px] leading-relaxed text-slate">The first photo is used to fill in the details.</p>
          </div>
          <div className="grid w-full max-w-xs grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              onPointerDown={ripple}
              className={`${authButtonClass} whitespace-nowrap px-3!`}
            >
              <Camera className="h-[18px] w-[18px] shrink-0" aria-hidden />
              Take photo
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onPointerDown={ripple}
              className={`${authSecondaryButtonClass} w-full whitespace-nowrap px-3!`}
            >
              <Images className="h-[18px] w-[18px] shrink-0" aria-hidden />
              Gallery
            </button>
          </div>
          <p className="hidden text-[11px] text-slate sm:block">or drag and drop, or paste with Ctrl+V</p>
          {picker}
          {camera}
        </div>
      ) : empty ? (
        <div
          {...dropProps}
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed px-4 py-7 text-center transition-colors ${
            fileOver
              ? "cursor-pointer border-primary bg-tint/60"
              : "cursor-pointer border-[#cfd4df] bg-paper/50 hover:border-primary/50 hover:bg-tint/30"
          }`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary shadow-[0_1px_2px_rgba(1,18,60,0.08)] ring-1 ring-line">
            <ImagePlus className="h-4 w-4" aria-hidden />
          </span>
          <p className="text-[13px] text-ink">
            <span className="font-semibold text-primary">Upload images</span>, drag and drop, or paste with{" "}
            <kbd className="rounded border border-line bg-white px-1 py-px font-sans text-[11px] font-semibold">Ctrl</kbd>
            +
            <kbd className="rounded border border-line bg-white px-1 py-px font-sans text-[11px] font-semibold">V</kbd>
          </p>
          <p className="max-w-xs text-[11px] leading-snug text-slate">
            {canUpload
              ? "JPG, PNG, WebP or AVIF · converted to WebP and resized automatically"
              : "The name, category and details are filled in automatically from the first photo."}
          </p>
          {picker}
        </div>
      ) : (
        <div ref={gridRef} className={`relative grid grid-cols-3 gap-2.5 ${dragging ? "select-none" : ""}`} {...dropProps}>
          {shownImages.map((url, n) => {
            const isCover = n === 0;
            const isDragged = url === dragging;
            return (
              <div
                key={url}
                ref={(el) => {
                  if (el) tileEls.current.set(url, el);
                  else tileEls.current.delete(url);
                }}
                className={`group ${tile} ${isCover ? "col-span-2 row-span-2" : ""} ${
                  isDragged
                    ? "relative z-20 border-primary shadow-[0_16px_32px_-12px_rgba(1,18,60,0.4)] ring-[3px] ring-primary/20"
                    : isCover
                      ? "border-primary ring-[3px] ring-primary/15"
                      : "border-line hover:shadow-[0_2px_8px_rgba(1,18,60,0.08)]"
                } transition-shadow will-change-transform`}
              >
                <div className="relative aspect-square bg-paper">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                  <img
                    src={url}
                    alt={`Product image ${n + 1}`}
                    className={`h-full w-full object-cover ${isDragged ? "opacity-90" : ""}`}
                    loading="lazy"
                    draggable={false}
                  />
                  {isCover && (
                    <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-sm">
                      <Star className="h-3 w-3 fill-primary text-primary" aria-hidden />
                      Cover
                    </span>
                  )}
                  {flash?.url === url && (
                    <div className="pointer-events-none absolute inset-x-2 top-12 flex justify-center">
                      <span
                        key={flash.id}
                        className="admin-pop-in inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md"
                      >
                        <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                        {flash.text}
                      </span>
                    </div>
                  )}
                  {/* Drag handle: top-left, always visible */}
                  {shownImages.length > 1 && (
                    <button
                      type="button"
                      onPointerDown={(e) => startDrag(e, url)}
                      onPointerMove={moveDrag}
                      onPointerUp={endDrag}
                      onPointerCancel={endDrag}
                      onKeyDown={(e) => keyMove(e, url)}
                      aria-label={`Move image ${n + 1}. Use the arrow keys; the first image is the cover.`}
                      title="Drag to reorder"
                      className={`absolute left-2 top-2 grid h-9 w-9 touch-none place-items-center rounded-md bg-white/95 text-ink shadow-[0_1px_4px_rgba(1,18,60,0.25)] ring-1 ring-ink/5 transition-colors hover:bg-white ${
                        isDragged ? "cursor-grabbing text-primary" : "cursor-grab"
                      }`}
                    >
                      <GripVertical className="h-[18px] w-[18px]" aria-hidden />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      // A saved product needs an image, and image changes save right away.
                      autoSave && images.length === 1 ? flashTile(url, "Add another image first") : setConfirmRemove(url)
                    }
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink shadow-sm ring-1 ring-ink/5 transition hover:bg-red-50 hover:text-red-600 focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
                    aria-label={`Remove image ${n + 1}`}
                    title="Remove"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}

          {pending.map((item) => (
            <div key={item.id} className={`${tile} ${item.error ? "border-red-200" : "border-line"}`}>
              <div className="relative aspect-square bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview while uploading */}
                <img src={item.preview} alt="" className={`h-full w-full object-cover ${item.error ? "opacity-30" : "opacity-60"}`} />
                {item.error ? (
                  <div className="absolute inset-0 grid place-items-center bg-white/70 p-3 text-center">
                    <p className="line-clamp-3 text-[11px] font-medium leading-snug text-red-700" title={item.error}>
                      {item.error}
                    </p>
                  </div>
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Spinner className="h-5 w-5 text-primary" />
                  </div>
                )}
              </div>
              {item.error ? (
                <div className={tileFooter}>
                  <button type="button" onClick={() => retry(item)} className={`${footerBtn} ${footerBtnIdle}`}>
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                    Retry
                  </button>
                  <button
                    type="button"
                    onClick={() => dropPending(item.id)}
                    className={`${footerBtn} ${footerBtnIdle} hover:text-red-600`}
                    aria-label="Dismiss failed upload"
                  >
                    <X className="h-3.5 w-3.5" aria-hidden />
                    Dismiss
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 border-t border-line bg-paper/70 p-1.5">
                  {item.detecting || item.converting ? (
                    <p className="flex h-8 flex-1 items-center px-1.5 text-[11px] font-semibold text-slate">
                      {item.detecting ? "Detecting product…" : "Optimizing…"}
                    </p>
                  ) : (
                    <div className="flex h-8 flex-1 items-center gap-2 px-1.5">
                      <div
                        className="h-1.5 flex-1 overflow-hidden rounded-full bg-line"
                        role="progressbar"
                        aria-label="Upload progress"
                        aria-valuenow={Math.round(item.progress * 100)}
                      >
                        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(item.progress, 0.04) * 100}%` }} />
                      </div>
                      <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-slate">
                        {Math.round(item.progress * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {slotsLeft > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              title="Add more photos (or drop / paste them here)"
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-md border border-dashed text-center transition-colors ${
                fileOver ? "border-primary bg-tint/60 text-primary" : "border-line bg-white text-slate/80 hover:border-slate/40 hover:text-ink"
              }`}
            >
              <Plus className="h-5 w-5" aria-hidden />
              <span className="text-[11px] font-medium">Add more</span>
            </button>
          )}
          {picker}
          {camera}
        </div>
      )}

      {rejected.length > 0 && (
        <div className="flex items-start gap-1.5 rounded-[7px] bg-red-50 px-2.5 py-2 text-[11px] leading-snug text-red-700 ring-1 ring-inset ring-red-600/15">
          <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
          <div className="flex-1">
            {rejected.map((r) => (
              <p key={r}>{r}</p>
            ))}
          </div>
          <button type="button" onClick={() => setRejected([])} aria-label="Dismiss" className="shrink-0 hover:text-red-900">
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] leading-snug">
        {!empty && (
          <p className="text-slate">
            Drag <GripVertical className="inline h-3.5 w-3.5 align-[-2px] text-ink" aria-hidden /> to reorder. The{" "}
            <span className="font-semibold text-ink">first photo</span> is the cover on product cards.
          </p>
        )}
        {autoSave ? (
          <AutoSaveStatus status={autoSave} />
        ) : (
          !empty && <span className="text-slate">Images are saved when you create the product.</span>
        )}
      </div>

      {/* Portaled: the drawer's slide-in transform would otherwise contain the fixed overlay. */}
      {confirmRemove &&
        createPortal(
          <ConfirmDialog
            title="Remove image?"
            confirmLabel="Remove image"
            busy={false}
            onConfirm={() => {
              onRemove(confirmRemove);
              setConfirmRemove(null);
            }}
            onCancel={() => setConfirmRemove(null)}
          >
            <span className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              <img src={confirmRemove} alt="" className="h-16 w-16 shrink-0 rounded-[8px] bg-paper object-contain ring-1 ring-line" />
              <span>
                The image is deleted permanently and can&apos;t be restored.
                {confirmRemove === images[0] && images.length > 1 && " It's the cover, so the next image becomes the cover."}
              </span>
            </span>
          </ConfirmDialog>,
          document.body,
        )}
    </>
  );
}

/* ---------- Details detected from a photo ---------- */

const DETECTED_FIELDS = ["productName", "description", "dimensions"] as const;
const DETECTED_LISTS = ["keywords", "specs", "tags", "highlights"] as const;

// "fill-empty" (automatic, on the first photo) only fills what the admin left
// empty; "replace" (the Auto-fill button) overwrites with everything detected.
function mergeDetected(f: FormState, d: DetectedProduct, mode: "fill-empty" | "replace"): FormState {
  const next = { ...f };
  for (const key of DETECTED_FIELDS) {
    if (d[key] && (mode === "replace" || !f[key].trim())) next[key] = d[key];
  }
  for (const key of DETECTED_LISTS) {
    const value = d[key];
    if (value.length && (mode === "replace" || f[key].filter(Boolean).length === 0)) {
      (next[key] as typeof value) = value;
    }
  }
  // Only a full pair is applied, so a re-detect never clears a chosen subcategory.
  if (
    d.categoryName &&
    d.subcategoryName &&
    (mode === "replace" || !f.categoryName.trim() || !f.subcategoryName.trim())
  ) {
    next.categoryName = d.categoryName;
    next.subcategoryName = d.subcategoryName;
  }
  return next;
}

const hasDetectedFieldsFilled = (f: FormState) =>
  DETECTED_FIELDS.some((key) => f[key].trim()) ||
  DETECTED_LISTS.some((key) => f[key].filter(Boolean).length > 0) ||
  Boolean(f.subcategoryName.trim());

type DetectNote = { kind: "ok" | "error"; text: string };

const detectError = (err: unknown) =>
  err instanceof Error && err.message ? err.message : "Couldn't detect the product from the photo.";

/* ---------- Steps of "Add product" ---------- */

// Only the essentials. Everything else AI detects from the photo (description,
// specs, tags, search keywords, highlights) is saved too, and can be
// edited later in the full form.
const WIZARD_STEPS = [
  { title: "Add photos", subtitle: "Take or upload photos. AI fills in the details for you.", label: "Photos" },
  { title: "Name & category", subtitle: "Check what AI filled in, or type it yourself.", label: "Details" },
  { title: "Price", subtitle: "Optional. Leave both empty to show “Price on request”.", label: "Price" },
] as const;

// The step of the "Add product" flow in the URL (?step=2), or null without one.
function stepInUrl(): number | null {
  const raw = new URLSearchParams(window.location.search).get("step");
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isInteger(n) ? Math.min(Math.max(n, 0), WIZARD_STEPS.length - 1) : 0;
}

// A new history entry for a step. No custom state: Next.js copies its own into it
// and keeps its router in sync with the URL.
function pushStep(n: number) {
  const url = new URL(window.location.href);
  url.searchParams.set("step", String(n));
  window.history.pushState(null, "", url.pathname + url.search);
}

// "✓ Auto-detected" next to a field label: the value came from the photo and
// hasn't been changed. It goes away as soon as the field is edited.
function AutoDetectedBadge({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="admin-pop-check ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
      <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
      Auto-detected
    </span>
  );
}

/* ---------- Drawer ---------- */

export default function ProductFormDrawer({
  product,
  onClose,
  onSave,
  onDelete,
  onImagesSaved,
  onAddAnother,
  products = [],
  layout = "drawer",
}: {
  /** "drawer": slides over the product list. "page": its own route (/admin/ecatalog/new). */
  layout?: "drawer" | "page";
  product: Product | null;
  /** The store's products: their categories are offered in the pickers too. */
  products?: Product[];
  onClose: () => void;
  /** Resolves with the saved product (the step-by-step flow shows it on its success screen). */
  onSave: (input: ProductInput) => Promise<Product | void>;
  /** "Add another product" on the success screen of the step-by-step flow. */
  onAddAnother?: () => void;
  onDelete?: (product: Product) => void;
  onImagesSaved?: (product: Product) => void;
}) {
  // `initial` is the last saved state; image auto-saves move it forward so they
  // don't count as unsaved changes.
  const [initial, setInitial] = useState<FormState>(() => toFormState(product));
  const [form, setForm] = useState<FormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageSave, setImageSave] = useState<ImageSaveStatus>({ state: "idle", label: "", seq: 0 });
  const [detecting, setDetecting] = useState(false);
  const [detectNote, setDetectNote] = useState<DetectNote | null>(null);
  const [confirmAutofill, setConfirmAutofill] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // New products are added step by step (photos, details, price, extras, review);
  // existing products open the full form.
  const wizard = !product;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"right" | "left">("right");
  // The first photo's detection has finished (with or without a result).
  const [detectTried, setDetectTried] = useState(false);
  const [created, setCreated] = useState<Product | null>(null);
  // AI recognised the product (name, category and subcategory): skip the steps and
  // show everything on one review screen under the photos.
  const [quick, setQuick] = useState(false);
  // The values AI put in the name, category and subcategory (only those it actually filled).
  const [autoFilled, setAutoFilled] = useState<Partial<Record<"productName" | "categoryName" | "subcategoryName", string>>>({});
  // A field shows "Auto-detected" while its value is still the one AI put in.
  const isAutoFilled = (key: "productName" | "categoryName" | "subcategoryName") =>
    !!autoFilled[key] && form[key] === autoFilled[key];
  const liveUrl = useLiveCatalogUrl();
  // Phones: while a field is being filled the keyboard takes half the screen, so the
  // button footer steps aside (the keyboard's Next / Go key moves on). It stays when
  // there's an error to read or a save in progress.
  const typing = useTyping();
  const footerAside = typing && !error && !saving ? "hidden sm:block" : "";

  // The latest form, for async detection callbacks that must not use a stale render.
  const formRef = useRef(form);
  useEffect(() => {
    formRef.current = form;
  });

  // The store's categories: its business types' predefined ones, the ones its
  // products use, and whatever this form holds (e.g. a new one just added).
  const { store } = useAdminUser();
  const pickerCategories = useMemo(
    () =>
      storeCategories(store.businessTypes, [
        ...products,
        { categoryName: form.categoryName, subcategoryName: form.subcategoryName },
      ]),
    [store.businessTypes, products, form.categoryName, form.subcategoryName],
  );
  // The AI only suggests the predefined categories of the store's business types
  // (never a custom or new one); the owner can still pick any category by hand.
  const aiCategories = useMemo(() => storeCategories(store.businessTypes, []), [store.businessTypes]);
  const detectContext: DetectContext = { businessTypes: store.businessTypes, categories: aiCategories };

  function applyDetected(d: DetectedProduct, mode: "fill-empty" | "replace"): FormState {
    const next = mergeDetected(formRef.current, d, mode);
    formRef.current = next;
    setForm((f) => mergeDetected(f, d, mode));
    const filled = (key: "productName" | "categoryName" | "subcategoryName") =>
      d[key] && next[key] === d[key] ? d[key] : undefined;
    setAutoFilled({
      productName: filled("productName"),
      categoryName: filled("categoryName"),
      subcategoryName: filled("subcategoryName"),
    });
    setDetectNote({ kind: "ok", text: "Details filled in from the photo. Review them before saving." });
    return next;
  }

  // First photo of a product without name/category/subcategory (from ImageManager).
  async function detectForUpload(file: File): Promise<ImageFolder> {
    setDetecting(true);
    setDetectNote(null);
    try {
      const next = applyDetected(await detectFromFile(file, detectContext), "fill-empty");
      if (wizard && isCompleteFolder(next)) setQuick(true);
      return next;
    } catch (err) {
      setDetectNote({ kind: "error", text: detectError(err) });
      return formRef.current;
    } finally {
      setDetecting(false);
      setDetectTried(true);
    }
  }

  // "Auto-fill from photo": re-detect from the cover image, replacing the details.
  async function autofillFromCover() {
    setConfirmAutofill(false);
    const cover = form.mainImageUrl || form.images[0];
    if (!cover) return;
    setDetecting(true);
    setDetectNote(null);
    try {
      applyDetected(await detectFromUrl(cover, detectContext), "replace");
    } catch (err) {
      setDetectNote({ kind: "error", text: detectError(err) });
    } finally {
      setDetecting(false);
    }
  }

  // Images uploaded while this drawer is open that no saved product refers to
  // yet. Whatever is left here when the drawer closes is deleted from S3.
  const sessionUploads = useRef<string[]>([]);
  const saved = useRef(false);
  const imageSaves = useRef<Promise<void>>(Promise.resolve());
  useEffect(() => {
    const uploads = sessionUploads.current;
    const pendingSaves = imageSaves;
    return () => {
      // Wait for in-flight image saves: they remove what they saved from `uploads`.
      pendingSaves.current.then(() => {
        if (!saved.current) discardUploads(uploads).catch(() => {});
      });
    };
  }, []);

  // Warn before a refresh or tab close would lose unsaved work.
  const unsafeToLeave = dirty || uploading || imageSave.state === "saving";
  useEffect(() => {
    if (!unsafeToLeave) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsafeToLeave]);

  // Existing products: image changes are written to Firestore right away, on
  // top of the product as last saved (other unsaved edits stay in the form).
  // Saves run one at a time, each with the newest image list.
  const lastSaved = useRef(product);
  const onImagesSavedRef = useRef(onImagesSaved);
  useEffect(() => {
    onImagesSavedRef.current = onImagesSaved;
  });

  // Saves still queued or running. "Saved" is only shown once the last one lands,
  // so an earlier save finishing can't report success while a newer one is pending.
  const queuedSaves = useRef(0);

  function persistImages(next: ImageFields, label: string) {
    if (!lastSaved.current) return; // new product: saved on "Create product"
    queuedSaves.current += 1;
    setImageSave((s) => ({ ...s, state: "saving" }));
    imageSaves.current = imageSaves.current.then(async () => {
      const base = lastSaved.current!;
      let ok = false;
      try {
        const updated = await updateProduct(base.id, { ...productToInput(base), ...next });
        lastSaved.current = updated;
        removeWhere(sessionUploads.current, (url) => updated.images.includes(url));
        setInitial((i) => ({ ...i, ...pickImages(updated) }));
        onImagesSavedRef.current?.(updated);
        ok = true;
      } catch {
        // Reported below.
      }
      queuedSaves.current -= 1;
      if (!ok) setImageSave((s) => ({ ...s, state: "error" }));
      else if (queuedSaves.current === 0) setImageSave((s) => ({ state: "saved", label, seq: s.seq + 1 }));
    });
  }

  // The latest image fields, kept in a ref so async upload callbacks never
  // work from a stale copy of the form.
  const imagesRef = useRef<ImageFields>(pickImages(initial));
  function changeImages(change: (current: ImageFields) => ImageFields, label: string) {
    const next = change(imagesRef.current);
    imagesRef.current = next;
    setForm((f) => ({ ...f, ...next }));
    persistImages(next, label);
  }

  const addImage = (url: string) => {
    sessionUploads.current.push(url);
    changeImages((c) => ({ ...c, images: [...c.images, url], mainImageUrl: c.mainImageUrl || url }), "Image added");
  };

  const removeImage = (url: string) => {
    changeImages((c) => {
      const images = c.images.filter((u) => u !== url);
      return {
        images,
        mainImageUrl: images[0] ?? "", // the first image is always the cover
        plainImageUrl: c.plainImageUrl === url ? "" : c.plainImageUrl,
      };
    }, "Image removed");
    // Not on any saved product, so it can go right away. Saved images are
    // deleted by the API once the product is saved without them.
    if (removeWhere(sessionUploads.current, (u) => u === url)) discardUploads([url]).catch(() => {});
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty && !created && !window.confirm("Discard your unsaved changes?")) return;
    if (wizard) exit();
    else onClose();
  };
  const panelRef = useOverlay<HTMLDivElement>(requestClose, saving);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Picker options: the store's categories (see pickerCategories), grouped by
  // business type; the store's own ones are listed under "Your categories".
  const currentCategory = pickerCategories.find((c) => c.name === form.categoryName);
  const categoryOptions: ComboOption[] = pickerCategories.map((c) => ({
    value: c.name,
    label: c.label,
    image: c.image,
    icon: c.icon,
    group: c.group,
  }));
  const subcategoryOptions: ComboOption[] = (currentCategory?.subcategories ?? []).map((sub) => ({
    value: sub.name,
    label: sub.name,
    image: sub.image,
    icon: currentCategory?.icon,
  }));

  // A new category clears a subcategory that doesn't belong to it.
  const changeCategory = (name: string) =>
    setForm((f) => {
      const subs = pickerCategories.find((c) => c.name === name)?.subcategories ?? [];
      return {
        ...f,
        categoryName: name,
        subcategoryName: subs.some((sub) => sub.name === f.subcategoryName) ? f.subcategoryName : "",
      };
    });

  const updateSpec = (i: number, patch: Partial<ProductSpec>) =>
    set("specs", form.specs.map((sp, j) => (j === i ? { ...sp, ...patch } : sp)));
  const off = discountPercent(Number(form.price) || 0, Number(form.originalPrice) || 0);

  const updateColor = (i: number, patch: Partial<ProductColor>) =>
    set("colors", form.colors.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = toInput(form);
    if (typeof input === "string") {
      setError(input);
      return;
    }
    setSaving(true);
    setError(null);
    // Set before awaiting: a successful save closes the drawer, and the unmount
    // cleanup must not discard the images that were just saved.
    saved.current = true;
    try {
      const result = await onSave(input);
      if (wizard && result) {
        setCreated(result);
        setSaving(false);
      }
    } catch (err) {
      saved.current = false;
      setError(err instanceof AuthError ? err.message : "Could not save the product. Please try again.");
      setSaving(false);
    }
  }

  const filledHighlights = form.highlights.filter((h) => h.trim()).length;

  // The first problem in a step, or null when it's done.
  function wizardStepError(i: number): string | null {
    if (i === 0) {
      if (uploading) return "Wait for the photos to finish uploading.";
      if (!form.images.length) return needsIdentityFor(form) ? "Fill in what the product is, then tap Retry on the photo." : "Add at least one photo.";
    }
    if (i === 1) {
      if (!form.productName.trim()) return "Enter a product name.";
      if (!form.categoryName.trim()) return "Choose a category.";
      if (!form.subcategoryName.trim()) return "Choose a subcategory.";
    }
    if (i === 2) {
      const offerText = form.price.trim();
      const mrpText = form.originalPrice.trim();
      const offer = Number(offerText || 0);
      const mrp = Number(mrpText || 0);
      if (!Number.isFinite(offer) || offer < 0) return "Enter a valid offer price, or leave it empty.";
      if (!Number.isFinite(mrp) || mrp < 0) return "Enter a valid MRP, or leave it empty.";
      const price = offerText ? offer : mrp;
      if ((mrpText ? mrp : price) < price) return "The MRP can't be lower than the offer price.";
    }
    if (i === 3) {
      if (form.colors.some((c) => !c.name.trim())) return "Every colour needs a name.";
      if (form.specs.some((sp) => sp.value.trim() && !sp.label.trim())) return "Every spec needs a name, e.g. Material or Size.";
    }
    return null;
  }
  const needsIdentityFor = (f: FormState) => detectTried && !isCompleteFolder(f);

  // Steps live in the URL (?step=2) and the browser history, so the phone's back
  // button or gesture goes back a step. The URL, not history.state: Next.js rewrites
  // the state of the current entry, and would drop a custom field.
  //  - layout "page": the route itself is step 0; each later step is one entry.
  //  - layout "drawer": an extra ?step=0 entry, so back from the first step closes it.
  const stepRef = useRef(step);
  const historyDepth = useRef(0); // entries we've pushed and not yet unwound
  const exiting = useRef(false);
  const restarting = useRef(false);
  const closeRef = useRef<() => void>(() => {});
  const onCloseRef = useRef(onClose);
  const onAddAnotherRef = useRef(onAddAnother);
  useEffect(() => {
    onCloseRef.current = onClose;
    onAddAnotherRef.current = onAddAnother;
    stepRef.current = step;
    closeRef.current = () => {
      if (created || !dirty || window.confirm("Discard this product?")) return onClose();
      // Stay: put the step back on the history.
      pushStep(stepRef.current);
      historyDepth.current = 1;
    };
  });
  useEffect(() => {
    if (!wizard) return;
    if (layout === "drawer") {
      pushStep(0);
      historyDepth.current = 1;
    } else if (stepInUrl() !== null) {
      // Reloaded in the middle of the flow: the form starts over at step 0.
      window.history.replaceState(null, "", window.location.pathname);
    }
    const onPopState = () => {
      const target = stepInUrl();
      // Back on the entry the flow was opened from: finishing an exit / restart, or
      // (drawer only) back past the first step.
      const atBase = target === null;
      if (atBase && (restarting.current || exiting.current || layout === "drawer")) {
        historyDepth.current = 0;
        if (restarting.current) onAddAnotherRef.current?.();
        else if (exiting.current) onCloseRef.current();
        else closeRef.current();
        return;
      }
      const next = target ?? 0;
      historyDepth.current = layout === "page" ? next : next + 1;
      setDirection(next < stepRef.current ? "left" : "right");
      setError(null);
      setStep(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
      // The drawer closed another way (X, Escape, Done): drop its steps from the history.
      if (layout === "drawer" && historyDepth.current > 0) window.history.go(-historyDepth.current);
    };
  }, [wizard, layout]);

  // Leaves the flow: back through our step entries to where it was opened, then close.
  // (A route closes with router.replace, so the steps never stay in the history.)
  function exit() {
    if (wizard && historyDepth.current > 0) {
      exiting.current = true;
      window.history.go(-historyDepth.current);
    } else onClose();
  }

  // "Add another product": unwind the steps the same way, then start a fresh flow.
  function startAnother() {
    if (historyDepth.current > 0) {
      restarting.current = true;
      window.history.go(-historyDepth.current);
    } else onAddAnother?.();
  }

  function goForward() {
    const next = Math.min(step + 1, WIZARD_STEPS.length - 1);
    pushStep(next);
    historyDepth.current += 1;
    setDirection("right");
    setError(null);
    setStep(next);
  }

  function handleWizardSubmit(e: FormEvent<HTMLFormElement>) {
    if (quick) {
      e.preventDefault();
      const problem = wizardStepError(0) ?? wizardStepError(1) ?? wizardStepError(2);
      if (problem) return setError(problem);
      return handleSubmit(e);
    }
    if (step < WIZARD_STEPS.length - 1) {
      e.preventDefault();
      const problem = wizardStepError(step);
      if (problem) return setError(problem);
      return goForward();
    }
    handleSubmit(e);
  }


  /* ---------- Form pieces (shared by the full form and the steps) ---------- */

  const imageManager = (
              <ImageManager
                images={form.images}
                folder={form}
                onUploaded={addImage}
                onRemove={removeImage}
                onReorder={(next) => changeImages((c) => ({ ...c, images: next, mainImageUrl: next[0] ?? "" }), "Order updated")}
                onBusyChange={setUploading}
                onDetect={detectForUpload}
                autoSave={product ? imageSave : null}
                hero={wizard}
              />
  );

  const detectNoteBlock = (
    <>
              {detectNote && (
                <p
                  role="status"
                  className={`flex items-start gap-1.5 rounded-[7px] px-2.5 py-2 text-[11px] leading-snug ring-1 ring-inset ${
                    detectNote.kind === "ok"
                      ? "bg-emerald-50 text-emerald-800 ring-emerald-600/15"
                      : "bg-red-50 text-red-700 ring-red-600/15"
                  }`}
                >
                  {detectNote.kind === "ok" ? (
                    <WandSparkles className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  ) : (
                    <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                  )}
                  <span className="flex-1">{detectNote.text}</span>
                  <button type="button" onClick={() => setDetectNote(null)} aria-label="Dismiss" className="shrink-0 opacity-70 hover:opacity-100">
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </p>
              )}
    </>
  );

  const categoryPickers = (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Not <Field>: its <label> would re-open the dropdown when an option is clicked. */}
                <div className="min-w-0">
                  <span id="category-label" className="mb-1 flex items-center gap-0.5 text-xs font-medium text-ink/80">
                    Category<span className="text-primary" aria-hidden>*</span>
                    <AutoDetectedBadge show={wizard && isAutoFilled("categoryName")} />
                  </span>
                  <CategoryCombobox
                    labelledBy="category-label"
                    value={form.categoryName}
                    options={categoryOptions}
                    onChange={changeCategory}
                    placeholder="Choose or add a category"
                    searchPlaceholder="Search or type a new category"
                  />
                </div>
                <div className="min-w-0">
                  <span id="subcategory-label" className="mb-1 flex items-center gap-0.5 text-xs font-medium text-ink/80">
                    Subcategory<span className="text-primary" aria-hidden>*</span>
                    <AutoDetectedBadge show={wizard && isAutoFilled("subcategoryName")} />
                  </span>
                  <CategoryCombobox
                    labelledBy="subcategory-label"
                    value={form.subcategoryName}
                    options={subcategoryOptions}
                    onChange={(v) => set("subcategoryName", v)}
                    placeholder={form.categoryName ? "Choose or add a subcategory" : "Choose a category first"}
                    searchPlaceholder="Search or type a new subcategory"
                    disabled={!form.categoryName}
                  />
                </div>
              </div>
  );

  const tagsBlock = (
              <div>
                <span className="mb-1 block text-xs font-medium text-ink/80">Tags</span>
                <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
                <p className="mt-1 text-[11px] leading-snug text-slate">
                  The first tag (<Star className="inline h-2.5 w-2.5 fill-current align-[-1px] text-primary" aria-hidden />) is
                  shown as the badge on the product card.
                </p>
              </div>
  );

  const keywordsBlock = (
              <div>
                <span id="keywords-label" className="mb-1 block text-xs font-medium text-ink/80">
                  Search keywords
                </span>
                <TagInput
                  tags={form.keywords}
                  onChange={(keywords) => set("keywords", keywords)}
                  badge={false}
                  maxItems={20}
                  labelledBy="keywords-label"
                />
                <p className="mt-1 text-[11px] leading-snug text-slate">
                  Words customers might search for, e.g. almirah, jhoomar, blackout, 3 seater. Filled in from the photo;
                  not shown on the catalog.
                </p>
              </div>
  );

  const mediaSection = (
            <Section
              title="Media"
              required
              icon={Images}
              description="Product photos"
              action={
                <>
                  <button
                    type="button"
                    onClick={() => (hasDetectedFieldsFilled(form) ? setConfirmAutofill(true) : autofillFromCover())}
                    disabled={detecting || form.images.length === 0}
                    title={
                      form.images.length
                        ? "Fill in the name, category and details from the cover photo"
                        : "Upload a photo first"
                    }
                    className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] bg-white px-2.5 text-xs font-semibold whitespace-nowrap text-ink ring-1 ring-inset ring-line transition-colors hover:bg-paper focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {detecting ? <Spinner className="h-3.5 w-3.5" /> : <WandSparkles className="h-3.5 w-3.5" aria-hidden />}
                    {detecting ? (
                      "Detecting…"
                    ) : (
                      <>
                        Auto-fill<span className="hidden sm:inline"> from photo</span>
                      </>
                    )}
                  </button>
                </>
              }
            >
              {imageManager}
              {detectNoteBlock}
            </Section>
  );

  const basicSection = (
            <Section title="Basic information" icon={FileText}>
              <Field label="Product name" required>
                <input
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Jaipur Brass Pendant Light"
                  maxLength={120}
                />
              </Field>
              <Field
                label="Description"
                hint={<span className="flex justify-end tabular-nums">{form.description.length}/2000</span>}
              >
                <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  maxLength={2000}
                  placeholder="What makes this product special?"
                  className={`${inputClass} h-auto resize-y py-2 leading-relaxed`}
                />
              </Field>
            </Section>
  );

  const orgSection = (
            <Section title="Organization" icon={Layers} description="Where it appears in the catalog">
              {categoryPickers}
              {tagsBlock}
              {keywordsBlock}
            </Section>
  );

  const pricingSection = (
            <Section title="Pricing" icon={IndianRupee}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Offer price" hint="Leave empty to show “Price on request”">
                  <MoneyInput value={form.price} onChange={(v) => set("price", v)} placeholder="0" />
                </Field>
                <Field label="MRP" hint="Leave empty if not discounted">
                  <MoneyInput value={form.originalPrice} onChange={(v) => set("originalPrice", v)} placeholder="0" />
                </Field>
                <div className="col-span-2 sm:col-span-1">
                  <span className="mb-1 block text-xs font-medium text-ink/80">Discount</span>
                  <div
                    className={`flex h-9 items-center rounded-[7px] px-2.5 text-[13px] font-semibold tabular-nums ${
                      off > 0 ? "bg-emerald-50 text-emerald-700" : "bg-paper text-slate"
                    }`}
                  >
                    {off > 0 ? `${off}% off` : "No discount"}
                  </div>
                </div>
              </div>
            </Section>
  );

  const specsSection = (
            <Section title="Specifications" icon={Ruler}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Material">
                  <input
                    value={form.material}
                    onChange={(e) => set("material", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Brass with glass shade"
                  />
                </Field>
                <Field label="Size">
                  <input
                    value={form.dimensions}
                    onChange={(e) => set("dimensions", e.target.value)}
                    className={inputClass}
                    placeholder="e.g. 6 ft × 3 ft, or 54 in wide"
                  />
                </Field>
                <Field label="Stock status">
                  <input
                    value={form.stockStatus}
                    onChange={(e) => set("stockStatus", e.target.value)}
                    className={inputClass}
                    placeholder="In Stock · Free Delivery"
                  />
                </Field>
              </div>
              <div>
                <span className="mb-1 flex items-center gap-1 text-xs font-medium text-ink/80">
                  <SlidersHorizontal className="h-3 w-3 text-slate" aria-hidden />
                  More specs
                </span>
                <div className="flex flex-col gap-2">
                  {form.specs.map((sp, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={sp.label}
                        onChange={(e) => updateSpec(i, { label: e.target.value })}
                        className={`${inputClass} w-[38%] shrink-0`}
                        placeholder="e.g. Wood"
                        maxLength={40}
                        aria-label={`Spec ${i + 1} name`}
                      />
                      <input
                        value={sp.value}
                        onChange={(e) => updateSpec(i, { value: e.target.value })}
                        className={inputClass}
                        placeholder="e.g. Sheesham"
                        maxLength={120}
                        aria-label={`Spec ${i + 1} value`}
                      />
                      <button
                        type="button"
                        onClick={() => set("specs", form.specs.filter((_, j) => j !== i))}
                        className={iconBtn}
                        aria-label={`Remove spec ${i + 1}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  ))}
                  {form.specs.length < MAX_SPECS && (
                    <AddRowButton onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}>
                      Add spec
                    </AddRowButton>
                  )}
                </div>
                <p className="mt-1 text-[11px] leading-snug text-slate">
                  Anything shoppers compare, e.g. Wood: Sheesham, Bulb: LED, Width: 54 in. Shown on the product page and
                  used for the catalog&apos;s filters.
                </p>
              </div>
            </Section>
  );

  const coloursSection = (
            <Section
              title="Colours"
              icon={Palette}
              collapsible
              summary={
                form.colors.length ? (
                  <span className="flex items-center gap-1">
                    {form.colors.slice(0, 6).map((c, i) => (
                      <span
                        key={i}
                        className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-ink/15"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                    <span className="ml-1">{form.colors.length}</span>
                  </span>
                ) : (
                  "None"
                )
              }
            >
              {form.colors.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label
                    className="relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-[7px] ring-1 ring-inset ring-ink/15"
                    style={{ backgroundColor: c.hex }}
                    title="Pick colour"
                  >
                    <input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(i, { hex: e.target.value.toUpperCase() })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label={`Colour ${i + 1} swatch`}
                    />
                  </label>
                  <input
                    value={c.name}
                    onChange={(e) => updateColor(i, { name: e.target.value })}
                    className={inputClass}
                    placeholder="Colour name, e.g. Teak Brown"
                    aria-label={`Colour ${i + 1} name`}
                  />
                  <span className="hidden w-16 shrink-0 font-mono text-[11px] uppercase text-slate sm:inline">{c.hex}</span>
                  <button
                    type="button"
                    onClick={() => set("colors", form.colors.filter((_, j) => j !== i))}
                    className={iconBtn}
                    aria-label={`Remove colour ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
              <AddRowButton onClick={() => set("colors", [...form.colors, { name: "", hex: "#B87C4C" }])}>
                Add colour
              </AddRowButton>
            </Section>
  );

  const highlightsSection = (
            <Section
              title="Highlights"
              icon={ListChecks}
              collapsible
              description="Short selling points"
              summary={filledHighlights ? `${filledHighlights} point${filledHighlights === 1 ? "" : "s"}` : "None"}
            >
              {form.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-right text-[11px] font-semibold tabular-nums text-slate">{i + 1}</span>
                  <input
                    value={h}
                    onChange={(e) => set("highlights", form.highlights.map((x, j) => (j === i ? e.target.value : x)))}
                    className={inputClass}
                    placeholder="e.g. Easy to clean"
                    aria-label={`Highlight ${i + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))}
                    className={iconBtn}
                    aria-label={`Remove highlight ${i + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              ))}
              {form.highlights.length < 10 && (
                <AddRowButton onClick={() => set("highlights", [...form.highlights, ""])}>Add highlight</AddRowButton>
              )}
            </Section>
  );

  const reviewsSection = (
            <Section
              title="Reviews"
              icon={MessageSquareQuote}
              collapsible
              summary={
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
                  {Number(form.rating || 0).toFixed(1)} · {form.reviewCount || 0} reviews
                </span>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Rating" hint="0 – 5">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={5}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => set("rating", e.target.value)}
                    className={`${inputClass} tabular-nums`}
                  />
                </Field>
                <Field label="Review count">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1}
                    value={form.reviewCount}
                    onChange={(e) => set("reviewCount", e.target.value)}
                    className={`${inputClass} tabular-nums`}
                  />
                </Field>
              </div>
            </Section>
  );

  const editHeader = (
        <>
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-white px-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium leading-none text-slate">
              {product ? "Edit product" : "New product"}
              {product && <span className="ml-1.5 font-mono text-slate/70">#{product.id}</span>}
            </p>
            <h2 id="product-form-title" className="mt-1 truncate text-[15px] font-semibold leading-tight text-ink">
              {form.productName.trim() || (product ? "Untitled product" : "Untitled")}
            </h2>
          </div>

          {/* Visibility */}
          <label
            className="flex shrink-0 cursor-pointer items-center gap-2 rounded-[7px] border border-line px-2.5 py-1.5"
            title={form.isActive ? "Visible in the catalog" : "Saved, but customers won't see it"}
          >
            <span className={`text-xs font-semibold ${form.isActive ? "text-emerald-700" : "text-slate"}`}>
              {form.isActive ? "Published" : "Hidden"}
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={form.isActive}
              onChange={(e) => set("isActive", e.target.checked)}
              className="peer sr-only"
            />
            <span
              aria-hidden
              className="relative h-4 w-7 rounded-full bg-[#cfd4df] transition-colors peer-checked:bg-emerald-500 peer-focus-visible:ring-[3px] peer-focus-visible:ring-primary/25 after:absolute after:left-0.5 after:top-0.5 after:h-3 after:w-3 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-3"
            />
          </label>

          <button
            type="button"
            onClick={requestClose}
            disabled={saving}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-50"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        </>
  );

  const editFooter = (
        <>
          {/* Footer */}
          <footer className={`shrink-0 border-t border-line bg-white px-4 py-2.5 ${footerAside}`}>
            {error && (
              <p
                role="alert"
                className="mb-2 flex items-center gap-1.5 rounded-[7px] bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700"
              >
                <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {error}
              </p>
            )}
            <div className="flex items-center gap-2">
              {product && onDelete && (
                <Button variant="danger-ghost" size="sm" onClick={() => onDelete(product)} disabled={saving}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}
              <div className="ml-auto flex items-center gap-2">
                {dirty && !saving && (
                  <span className="hidden items-center gap-1.5 text-[11px] font-medium text-slate sm:inline-flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
                    Unsaved changes
                  </span>
                )}
                <Button size="sm" onClick={requestClose} disabled={saving}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={saving}
                  disabled={uploading || imageSave.state === "saving" || (!!product && !dirty)}
                >
                  {saving ? "Saving…" : uploading ? "Uploading…" : product ? "Save changes" : "Create product"}
                </Button>
              </div>
            </div>
          </footer>
        </>
  );

  /* ---------- Step-by-step "Add product" (new products) ---------- */

  const stepAnim = direction === "right" ? "admin-step-in-right" : "admin-step-in-left";
  const lastStep = WIZARD_STEPS.length - 1;
  const needsIdentity = detectTried && !detecting && !isCompleteFolder(form);
  const bigInput =
    "h-12 w-full rounded-md border border-line bg-white px-3.5 text-base text-ink transition-[border-color,box-shadow] placeholder:text-slate/55 hover:border-slate/35 focus:border-primary focus:outline-none focus-visible:outline-none! focus:ring-[3px] focus:ring-primary/15";
  const bigLabel = "mb-1.5 block text-[13px] font-semibold text-ink";

  // The AI's progress on the first photo.
  const aiStatus = detectNote?.kind === "ok" && form.productName.trim() ? (
    <div className="admin-fade-in flex items-start gap-3 rounded-md border border-emerald-600/20 bg-emerald-50/70 p-3.5" role="status">
      <span className="admin-pop-check grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-emerald-600">
        <WandSparkles className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">Filled in by AI</p>
        <p className="mt-0.5 truncate text-sm font-medium text-ink">{form.productName}</p>
        {form.categoryName && (
          <p className="mt-0.5 truncate text-xs text-slate">
            {categoryLabel(form.categoryName)}
            {form.subcategoryName && ` › ${form.subcategoryName}`}
          </p>
        )}
        <p className="mt-1.5 text-xs text-slate">You can check and change everything in the next steps.</p>
      </div>
    </div>
  ) : detectNote?.kind === "error" ? (
    <div className="admin-fade-in flex items-start gap-3 rounded-md border border-amber-500/25 bg-amber-50 p-3.5" role="status">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-white text-amber-600">
        <Info className="h-4 w-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">Couldn&apos;t read this photo</p>
        <p className="mt-0.5 text-xs text-slate">{detectNote.text} Tell us what it is below, then tap Retry on the photo.</p>
      </div>
    </div>
  ) : form.images.length === 0 ? (
    <p className="flex items-start gap-2 rounded-md bg-paper px-3.5 py-3 text-xs leading-relaxed text-slate">
      <Sparkles className="mt-px h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
      Tip: a clear photo of the whole product on a plain background gives the best results.
    </p>
  ) : null;

  // Name, category and subcategory: step 2, or part of the one-screen review.
  const detailsFields = (
    <>
          <label className="block">
            <span className={`${bigLabel} flex items-center`}>
              Product name<span className="text-primary">*</span>
              <AutoDetectedBadge show={isAutoFilled("productName")} />
            </span>
            <input
              value={form.productName}
              onChange={(e) => set("productName", e.target.value)}
              className={bigInput}
              placeholder="e.g. Jaipur Brass Pendant Light"
              maxLength={120}
              autoCapitalize="words"
              enterKeyHint="next"
            />
          </label>
          {categoryPickers}
    </>
  );

  // Offer price and MRP: step 3, or part of the one-screen review.
  const priceFields = (
    <>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className={bigLabel}>Offer price</span>
              <span className="relative block">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-slate">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  className={`${bigInput} pl-8 text-lg font-semibold tabular-nums`}
                  placeholder="0"
                  enterKeyHint="next"
                />
              </span>
            </label>
            <label className="block">
              <span className={bigLabel}>MRP</span>
              <span className="relative block">
                <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base text-slate">₹</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={form.originalPrice}
                  onChange={(e) => set("originalPrice", e.target.value)}
                  className={`${bigInput} pl-8 text-lg tabular-nums`}
                  placeholder="0"
                  enterKeyHint="done"
                />
              </span>
            </label>
          </div>
          <div
            aria-live="polite"
            className={`flex items-center gap-2.5 rounded-md px-3.5 py-3 text-sm ${
              off > 0 ? "bg-emerald-50 text-emerald-800" : "bg-paper text-slate"
            }`}
          >
            <IndianRupee className="h-4 w-4 shrink-0" aria-hidden />
            {off > 0 ? (
              <span>
                Customers see <span className="font-bold">{off}% off</span>
              </span>
            ) : !form.price.trim() && !form.originalPrice.trim() ? (
              <span>
                No price: shows <span className="font-semibold text-ink">“Price on request”</span>
              </span>
            ) : (
              <span>Add an MRP above the offer price to show a discount.</span>
            )}
          </div>
    </>
  );

  const wizardSteps = (
    <>
      {/* Photos: kept mounted (just hidden) on later steps so uploads carry on. */}
      <div className={step === 0 ? `${stepAnim} flex flex-col gap-4` : "hidden"}>
        {imageManager}
        {!quick && aiStatus}
        {step === 0 && needsIdentity && !quick && (
          <div className="admin-fade-in flex flex-col gap-4 rounded-md border border-line p-4">
            <p className="text-[13px] font-semibold text-ink">What is this product?</p>
            <label className="block">
              <span className={bigLabel}>Product name</span>
              <input
                value={form.productName}
                onChange={(e) => set("productName", e.target.value)}
                className={bigInput}
                placeholder="e.g. Jaipur Brass Pendant Light"
                maxLength={120}
                autoCapitalize="words"
                enterKeyHint="next"
              />
            </label>
            {categoryPickers}
          </div>
        )}

        {/* AI recognised it: everything on one screen, ready to add. */}
        {quick && (
          <div className="admin-step-in-right mt-1 flex flex-col gap-5 border-t border-line pt-5">
            <p className="flex items-center gap-2 rounded-md bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-800">
              <WandSparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Filled in from your photo. Check it and change anything that&apos;s wrong.
            </p>
            {detailsFields}
            <div className="flex flex-col gap-4">
              <p className="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
                Price <span className="text-xs font-normal text-slate">Optional</span>
              </p>
              {priceFields}
            </div>
          </div>
        )}
      </div>

      {step === 1 && (
        <div key="step-details" className={`${stepAnim} flex flex-col gap-5`}>
          {detectNote?.kind === "ok" && (
            <p className="flex items-center gap-2 rounded-md bg-emerald-50/70 px-3 py-2 text-xs font-medium text-emerald-800">
              <WandSparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Filled in from your photo. Check it and change anything that&apos;s wrong.
            </p>
          )}
          {detailsFields}
        </div>
      )}

      {step === 2 && (
        <div key="step-price" className={`${stepAnim} flex flex-col gap-5`}>
          {priceFields}
        </div>
      )}
    </>
  );

  const wizardHeader = (
        <header className={`shrink-0 border-b border-line bg-white ${layout === "page" ? "pt-[env(safe-area-inset-top)] sm:pt-0" : ""}`}>
          <div className="flex h-14 items-center gap-1 px-1.5">
            <button
              type="button"
              onClick={step > 0 && !created ? () => window.history.back() : requestClose}
              onPointerDown={ripple}
              disabled={saving}
              aria-label={step > 0 && !created ? "Back" : "Close"}
              className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-ink transition-colors hover:bg-ink/[0.05] disabled:opacity-50"
            >
              {step > 0 && !created ? <ArrowLeft className="h-5 w-5" aria-hidden /> : <X className="h-5 w-5" aria-hidden />}
            </button>
            <h2 id="product-form-title" className="min-w-0 flex-1 truncate text-center text-[15px] font-semibold text-ink">
              {created ? "Product added" : "Add product"}
            </h2>
            {step > 0 && !created ? (
              <button
                type="button"
                onClick={requestClose}
                onPointerDown={ripple}
                disabled={saving}
                aria-label="Close"
                className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink disabled:opacity-50"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            ) : (
              <span className="w-11" aria-hidden />
            )}
          </div>
          {!created && !quick && (
            <div className="px-4 pb-3 sm:px-6">
              <AuthProgress current={step} total={WIZARD_STEPS.length} label={WIZARD_STEPS[step].label} />
            </div>
          )}
        </header>
  );

  const wizardBody = created ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 overflow-y-auto bg-white px-6 py-10 text-center">
            {created.mainImageUrl || created.images[0] ? (
              // The product's cover photo, with a tick on its corner.
              <span className="admin-pop-in relative">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview */}
                <img
                  src={created.mainImageUrl || created.images[0]}
                  alt={created.productName}
                  className="h-44 w-44 rounded-lg border border-line bg-paper object-cover shadow-[0_12px_32px_-16px_rgba(1,18,60,0.35)]"
                />
                <span className="admin-pop-check absolute -bottom-3 -right-3 grid h-11 w-11 place-items-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
                  <Check className="h-6 w-6" strokeWidth={3} aria-hidden />
                </span>
              </span>
            ) : (
              <span className="admin-pop-check grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60">
                <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden />
              </span>
            )}
            <div className="admin-fade-in">
              <p className="text-lg font-bold text-ink">{created.productName}</p>
              <p className="mt-1 text-sm text-slate">
                {created.isActive ? "is now in your catalog." : "is saved as hidden."}
              </p>
            </div>
            <div className="admin-fade-in flex w-full max-w-xs flex-col gap-2.5">
              <button type="button" onClick={onAddAnother ? startAnother : exit} onPointerDown={ripple} className={authButtonClass}>
                <Plus className="h-[18px] w-[18px]" aria-hidden />
                Add another product
              </button>
              {created.isActive && (
                <a
                  href={`${liveUrl}/product/${encodeURIComponent(created.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerDown={ripple}
                  className={`${authSecondaryButtonClass} w-full`}
                >
                  View in catalog
                </a>
              )}
              <button type="button" onClick={exit} className="h-11 text-sm font-semibold text-slate hover:text-ink">
                Done
              </button>
            </div>
          </div>
  ) : (
          <div className="flex-1 overflow-y-auto bg-white px-4 pb-6 pt-5 sm:px-6">
            <div key={`title-${step}`} className={`${stepAnim} mb-5`}>
              <h3 className="text-[1.25rem] font-bold leading-tight tracking-[-0.02em] text-ink">
                {quick ? "Review & add" : WIZARD_STEPS[step].title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                {quick ? "AI filled in the details from your photo. Check them, add a price if you like, and you're done." : WIZARD_STEPS[step].subtitle}
              </p>
            </div>
            {wizardSteps}
          </div>
  );

  const continueLabel =
    step === 0 && detecting
      ? "Reading photo…"
      : step === 0 && uploading
        ? "Uploading photos…"
        : step === lastStep || quick
          ? saving
            ? "Adding product…"
            : "Add product"
          : "Continue";

  const wizardFooter = created ? null : (
          <footer className={`shrink-0 border-t border-line bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 ${footerAside}`}>
            {error && (
              <p
                role="alert"
                className="admin-fade-in mb-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700"
              >
                <Info className="mt-px h-4 w-4 shrink-0" aria-hidden />
                {error}
              </p>
            )}
            <div className="flex gap-2.5">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  onPointerDown={ripple}
                  disabled={saving}
                  aria-label="Back"
                  className={`${authSecondaryButtonClass} hidden w-12 shrink-0 px-0 sm:inline-flex`}
                >
                  <ArrowLeft className="h-[18px] w-[18px]" aria-hidden />
                </button>
              )}
              <button
                type="submit"
                onPointerDown={ripple}
                disabled={saving || (step === 0 && (uploading || detecting))}
                className={authButtonClass}
              >
                {(saving || (step === 0 && (uploading || detecting))) && <Spinner className="h-4 w-4" />}
                {continueLabel}
              </button>
            </div>
          </footer>
  );

  return (
    <div
      className={
        layout === "page"
          ? // Its own route: full screen on phones, a centred card on larger screens. Fixed to
            // the screen so the steps scroll inside it (page scrolling is locked while it's open).
            "fixed inset-0 z-40 flex flex-col bg-white sm:items-center sm:justify-center sm:bg-paper sm:p-6"
          : "admin-fade-in fixed inset-0 z-[100] flex justify-end bg-ink/40 backdrop-blur-[2px]"
      }
      onClick={(e) => {
        if (layout === "drawer" && e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role={layout === "page" ? "region" : "dialog"}
        aria-modal={layout === "page" ? undefined : true}
        aria-labelledby="product-form-title"
        tabIndex={-1}
        className={
          layout === "page"
            ? "admin-pop-in flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white focus:outline-none sm:h-[min(880px,100%)] sm:max-w-[560px] sm:flex-none sm:rounded-lg sm:border sm:border-line sm:shadow-[0_1px_2px_rgba(1,18,60,0.04),0_16px_40px_-20px_rgba(1,18,60,0.18)]"
            : `admin-slide-in flex h-full w-full flex-col shadow-2xl focus:outline-none sm:max-w-[640px] ${
                wizard ? "bg-white sm:max-w-[560px]" : "bg-[#f7f8fb]"
              }`
        }
      >
        {wizard ? wizardHeader : editHeader}

        <form onSubmit={wizard ? handleWizardSubmit : handleSubmit} noValidate className="relative flex min-h-0 flex-1 flex-col">
          {wizard ? (
            wizardBody
          ) : (
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
              {mediaSection}
              {basicSection}
              {orgSection}
              {pricingSection}
              {specsSection}
              {coloursSection}
              {highlightsSection}
              {reviewsSection}
            </div>
          )}
          {wizard ? wizardFooter : editFooter}
          {wizard && detecting && (
            <div
              role="status"
              aria-live="polite"
              className="admin-fade-in absolute inset-0 z-20 flex flex-col items-center justify-center gap-5 bg-white/90 px-8 text-center backdrop-blur-sm"
            >
              <span className="relative grid h-20 w-20 place-items-center">
                <Spinner className="absolute inset-0 h-20 w-20 text-primary" />
                <span className="grid h-14 w-14 place-items-center rounded-full bg-tint text-primary">
                  <WandSparkles className="h-6 w-6" aria-hidden />
                </span>
              </span>
              <div className="max-w-xs">
                <p className="text-base font-semibold text-ink">Reading your photo…</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  AI is finding the name, category and details. This takes a few seconds.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>


      {confirmAutofill && (
        <ConfirmDialog
          title="Replace the details?"
          confirmLabel="Replace details"
          busy={false}
          onConfirm={autofillFromCover}
          onCancel={() => setConfirmAutofill(false)}
        >
          The name, category, subcategory, description, size, specs, tags, highlights and search keywords
          are replaced with what&apos;s detected from the cover photo. You can still edit them before saving.
        </ConfirmDialog>
      )}
    </div>
  );
}

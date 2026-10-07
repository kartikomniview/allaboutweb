"use client";

import {
  useEffect,
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  CircleCheck,
  FileText,
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
  Sparkles,
  Star,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react";
import { CATALOG_CATEGORIES } from "@/components/furniture-catalog/data";
import { AuthError } from "@/lib/adminAuth";
import {
  IMAGE_TYPES,
  checkImageFile,
  discardUploads,
  discountPercent,
  productToInput,
  requestImageUploads,
  updateProduct,
  uploadToS3,
  type ImageUpload,
  type Product,
  type ProductColor,
  type ProductInput,
} from "@/lib/adminProducts";
import { Button, Spinner } from "../ui";
import ImagePromptDialog from "./ImagePromptDialog";
import { useOverlay } from "./useOverlay";

// Compact control sizing: 16px text on phones (avoids iOS zoom), 13px from sm up.
const inputClass =
  "h-9 w-full rounded-[7px] border border-line bg-white px-2.5 text-base text-ink transition placeholder:text-slate/55 hover:border-[#d3d7e2] focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15 sm:text-[13px]";

// Numbers are kept as strings while editing so fields can be empty mid-typing.
type FormState = Omit<ProductInput, "price" | "originalPrice" | "rating" | "reviewCount"> & {
  price: string;
  originalPrice: string;
  rating: string;
  reviewCount: string;
};

function toFormState(product: Product | null): FormState {
  if (!product) {
    return {
      productName: "",
      categoryName: CATALOG_CATEGORIES[0]?.name ?? "",
      subcategoryName: "",
      price: "",
      originalPrice: "",
      tags: [],
      rating: "0",
      reviewCount: "0",
      colors: [],
      material: "",
      dimensions: "",
      woodType: "",
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
    price: String(product.price),
    originalPrice: String(product.originalPrice),
    tags: product.tags,
    rating: String(product.rating),
    reviewCount: String(product.reviewCount),
    colors: product.colors,
    material: product.material,
    dimensions: product.dimensions,
    woodType: product.woodType,
    stockStatus: product.stockStatus,
    description: product.description,
    highlights: product.highlights,
    isActive: product.isActive,
    mainImageUrl: product.mainImageUrl,
    plainImageUrl: product.plainImageUrl,
    images: product.images,
  };
}

// Returns the API payload, or an error message for the first invalid field.
function toInput(form: FormState): ProductInput | string {
  const price = Number(form.price);
  const originalPrice = form.originalPrice.trim() === "" ? price : Number(form.originalPrice);
  const rating = Number(form.rating || 0);
  const reviewCount = Number(form.reviewCount || 0);

  if (!form.productName.trim()) return "Enter a product name.";
  if (!form.categoryName) return "Choose a category.";
  if (!form.subcategoryName.trim()) return "Enter a subcategory.";
  if (form.price.trim() === "" || !Number.isFinite(price) || price < 0) return "Enter a valid price.";
  if (!Number.isFinite(originalPrice) || originalPrice < price) return "MRP cannot be lower than the price.";
  if (!Number.isFinite(rating) || rating < 0 || rating > 5) return "Rating must be between 0 and 5.";
  if (!Number.isInteger(reviewCount) || reviewCount < 0) return "Review count must be a whole number.";
  if (form.colors.some((c) => !c.name.trim())) return "Every colour needs a name.";

  return {
    productName: form.productName,
    categoryName: form.categoryName,
    subcategoryName: form.subcategoryName,
    price,
    originalPrice,
    tags: form.tags,
    rating,
    reviewCount,
    colors: form.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })),
    material: form.material,
    dimensions: form.dimensions,
    woodType: form.woodType,
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
  icon: Icon,
  description,
  summary,
  action,
  collapsible = false,
  defaultOpen = true,
  children,
}: {
  title: string;
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
      <span className="text-[13px] font-semibold text-ink">{title}</span>
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

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim().replace(/,$/, "").trim();
    if (tag && !tags.some((t) => t.toLowerCase() === tag.toLowerCase())) onChange([...tags, tag]);
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
            i === 0 ? "bg-tint text-[#c4501a] ring-primary/20" : "bg-ink/[0.04] text-ink ring-ink/10"
          }`}
        >
          {i === 0 && <Star className="h-2.5 w-2.5 fill-current" aria-label="Badge" />}
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="grid h-4 w-4 place-items-center rounded hover:bg-ink/10"
            aria-label={`Remove tag ${tag}`}
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
        placeholder={tags.length ? "Add tag…" : "Type and press Enter"}
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

function AutoSaveStatus({ state }: { state: ImageSaveState }) {
  if (state === "saving") {
    return (
      <span className="inline-flex items-center gap-1 text-slate">
        <Spinner className="h-3 w-3" /> Saving images…
      </span>
    );
  }
  if (state === "saved") {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-700">
        <CircleCheck className="h-3 w-3" aria-hidden /> Images saved
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

type PendingUpload = { id: string; file: File; preview: string; progress: number; error?: string };

type ImageFolder = Pick<ProductInput, "productName" | "categoryName" | "subcategoryName">;

function ImageManager({
  images,
  mainImageUrl,
  plainImageUrl,
  folder,
  onUploaded,
  onRemove,
  onSetMain,
  onSetPlain,
  onBusyChange,
  autoSave,
}: {
  images: string[];
  mainImageUrl: string;
  plainImageUrl: string;
  folder: ImageFolder;
  onUploaded: (url: string) => void;
  onRemove: (url: string) => void;
  onSetMain: (url: string) => void;
  onSetPlain: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  /** Auto-save state for an existing product; null for a new one. */
  autoSave: ImageSaveState | null;
}) {
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewsRef = useRef(new Set<string>());

  const canUpload = Boolean(folder.productName.trim() && folder.categoryName.trim() && folder.subcategoryName.trim());
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

  async function upload(items: PendingUpload[]) {
    let targets: ImageUpload[];
    try {
      targets = await requestImageUploads(folder, items.map((i) => i.file));
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
    if (!canUpload) {
      setRejected(["Add the product name, category and subcategory before adding images."]);
      return;
    }
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
      return { id: preview, file, preview, progress: 0 };
    });
    if (!items.length) return;
    setPending((current) => [...current, ...items]);
    // The Lambda signs at most 10 uploads per request.
    for (let i = 0; i < items.length; i += 10) upload(items.slice(i, i + 10));
  }

  const retry = (item: PendingUpload) => {
    patch(item.id, { error: undefined, progress: 0 });
    upload([{ ...item, error: undefined, progress: 0 }]);
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
      if (canUpload) setDragging(true);
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

  const empty = images.length === 0 && pending.length === 0;
  const tileBtn =
    "inline-flex h-6 items-center gap-1 rounded-[5px] bg-white/95 px-1.5 text-[10px] font-semibold text-ink shadow-sm transition-colors";

  return (
    <>
      {empty ? (
        <div
          {...dropProps}
          role="button"
          tabIndex={canUpload ? 0 : -1}
          aria-disabled={!canUpload}
          onClick={() => canUpload && inputRef.current?.click()}
          onKeyDown={(e) => {
            if (canUpload && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed px-4 py-7 text-center transition-colors ${
            !canUpload
              ? "cursor-not-allowed border-line bg-paper/50 opacity-70"
              : dragging
                ? "cursor-pointer border-primary bg-tint/60"
                : "cursor-pointer border-[#cfd4df] bg-paper/50 hover:border-primary/50 hover:bg-tint/30"
          }`}
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary shadow-[0_1px_2px_rgba(1,18,60,0.08)] ring-1 ring-line">
            <ImagePlus className="h-4 w-4" aria-hidden />
          </span>
          {canUpload ? (
            <>
              <p className="text-[13px] text-ink">
                <span className="font-semibold text-primary">Upload images</span>, drag and drop, or paste with{" "}
                <kbd className="rounded border border-line bg-white px-1 py-px font-sans text-[11px] font-semibold">Ctrl</kbd>
                +
                <kbd className="rounded border border-line bg-white px-1 py-px font-sans text-[11px] font-semibold">V</kbd>
              </p>
              <p className="text-[11px] text-slate">JPG, PNG, WebP or AVIF · up to 5 MB each</p>
            </>
          ) : (
            <p className="max-w-xs text-[12px] leading-snug text-slate">
              Add the product name, category and subcategory first. Images are stored in folders named after them.
            </p>
          )}
          {picker}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" {...dropProps}>
          {images.map((url) => {
            const isMain = url === mainImageUrl;
            const isPlain = url === plainImageUrl;
            return (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-[8px] border border-line bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute left-1 top-1 flex flex-col items-start gap-0.5">
                  {isMain && (
                    <span className="rounded-[4px] bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-white">Main</span>
                  )}
                  {isPlain && (
                    <span className="rounded-[4px] bg-ink/80 px-1.5 py-0.5 text-[10px] font-semibold text-white">Plain</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(url)}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-[5px] bg-white/95 text-ink opacity-0 shadow-sm transition hover:text-red-600 focus:opacity-100 group-hover:opacity-100"
                  aria-label="Remove image"
                  title="Remove"
                >
                  <X className="h-3 w-3" aria-hidden />
                </button>
                <div className="absolute inset-x-1 bottom-1 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
                  {!isMain && (
                    <button type="button" onClick={() => onSetMain(url)} className={`${tileBtn} hover:text-primary`}>
                      <Star className="h-2.5 w-2.5" aria-hidden />
                      Main
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSetPlain(isPlain ? "" : url)}
                    className={`${tileBtn} hover:text-primary`}
                    aria-pressed={isPlain}
                  >
                    {isPlain ? "Unset plain" : "Plain"}
                  </button>
                </div>
              </div>
            );
          })}

          {pending.map((item) => (
            <div key={item.id} className="relative aspect-square overflow-hidden rounded-[8px] border border-line bg-paper">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview while uploading */}
              <img src={item.preview} alt="" className={`h-full w-full object-cover ${item.error ? "opacity-30" : "opacity-60"}`} />
              {item.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/70 p-1.5 text-center">
                  <p className="line-clamp-2 text-[10px] font-medium leading-tight text-red-700" title={item.error}>
                    {item.error}
                  </p>
                  <div className="flex gap-1">
                    <button type="button" onClick={() => retry(item)} className={`${tileBtn} ring-1 ring-line`}>
                      <RotateCcw className="h-2.5 w-2.5" aria-hidden />
                      Retry
                    </button>
                    <button
                      type="button"
                      onClick={() => dropPending(item.id)}
                      className={`${tileBtn} ring-1 ring-line`}
                      aria-label="Dismiss failed upload"
                    >
                      <X className="h-2.5 w-2.5" aria-hidden />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-x-1.5 bottom-1.5">
                  <div className="h-1 overflow-hidden rounded-full bg-white/80" role="progressbar" aria-valuenow={Math.round(item.progress * 100)}>
                    <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${Math.max(item.progress, 0.04) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {slotsLeft > 0 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={!canUpload}
              className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-[8px] border border-dashed text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                dragging ? "border-primary bg-tint/60 text-primary" : "border-[#cfd4df] text-slate hover:border-primary/50 hover:text-primary"
              }`}
            >
              <Plus className="h-4 w-4" aria-hidden />
              Add
            </button>
          )}
          {picker}
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
            <span className="font-semibold text-ink">Main</span> is the cover on product cards.{" "}
            <span className="font-semibold text-ink">Plain</span> is the plain-background shot. Paste images with Ctrl+V.
          </p>
        )}
        {autoSave ? (
          <AutoSaveStatus state={autoSave} />
        ) : (
          !empty && <span className="text-slate">Images are saved when you create the product.</span>
        )}
      </div>
    </>
  );
}

/* ---------- Drawer ---------- */

export default function ProductFormDrawer({
  product,
  onClose,
  onSave,
  onDelete,
  onImagesSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (input: ProductInput) => Promise<void>;
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
  const [imageSave, setImageSave] = useState<ImageSaveState>("idle");
  const [promptOpen, setPromptOpen] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

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
  const unsafeToLeave = dirty || uploading || imageSave === "saving";
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

  function persistImages(next: ImageFields) {
    if (!lastSaved.current) return; // new product: saved on "Create product"
    setImageSave("saving");
    imageSaves.current = imageSaves.current.then(async () => {
      const base = lastSaved.current!;
      try {
        const updated = await updateProduct(base.id, { ...productToInput(base), ...next });
        lastSaved.current = updated;
        removeWhere(sessionUploads.current, (url) => updated.images.includes(url));
        setInitial((i) => ({ ...i, ...pickImages(updated) }));
        onImagesSavedRef.current?.(updated);
        setImageSave("saved");
      } catch {
        setImageSave("error");
      }
    });
  }

  // The latest image fields, kept in a ref so async upload callbacks never
  // work from a stale copy of the form.
  const imagesRef = useRef<ImageFields>(pickImages(initial));
  function changeImages(change: (current: ImageFields) => ImageFields) {
    const next = change(imagesRef.current);
    imagesRef.current = next;
    setForm((f) => ({ ...f, ...next }));
    persistImages(next);
  }

  const addImage = (url: string) => {
    sessionUploads.current.push(url);
    changeImages((c) => ({ ...c, images: [...c.images, url], mainImageUrl: c.mainImageUrl || url }));
  };

  const removeImage = (url: string) => {
    changeImages((c) => {
      const images = c.images.filter((u) => u !== url);
      return {
        images,
        mainImageUrl: c.mainImageUrl === url ? (images[0] ?? "") : c.mainImageUrl,
        plainImageUrl: c.plainImageUrl === url ? "" : c.plainImageUrl,
      };
    });
    // Not on any saved product, so it can go right away. Saved images are
    // deleted by the API once the product is saved without them.
    if (removeWhere(sessionUploads.current, (u) => u === url)) discardUploads([url]).catch(() => {});
  };

  const requestClose = () => {
    if (saving) return;
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    onClose();
  };
  const panelRef = useOverlay<HTMLDivElement>(requestClose, saving);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const categories = CATALOG_CATEGORIES.some((c) => c.name === form.categoryName)
    ? CATALOG_CATEGORIES
    : [...CATALOG_CATEGORIES, { name: form.categoryName, subcategories: [] }];
  const subcategories = categories.find((c) => c.name === form.categoryName)?.subcategories ?? [];
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
      await onSave(input);
    } catch (err) {
      saved.current = false;
      setError(err instanceof AuthError ? err.message : "Could not save the product. Please try again.");
      setSaving(false);
    }
  }

  const filledHighlights = form.highlights.filter((h) => h.trim()).length;

  return (
    <div
      className="admin-fade-in fixed inset-0 z-[100] flex justify-end bg-ink/40 backdrop-blur-[2px]"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-form-title"
        tabIndex={-1}
        className="admin-slide-in flex h-full w-full flex-col bg-[#f7f8fb] shadow-2xl focus:outline-none sm:max-w-[640px]"
      >
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

        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-4">
            <Section
              title="Media"
              icon={Images}
              description="Product photos"
              action={
                <button
                  type="button"
                  onClick={() => setPromptOpen(true)}
                  disabled={!form.productName.trim()}
                  title={form.productName.trim() ? "Prompt for an AI-generated room photo" : "Add a product name first"}
                  className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-[7px] bg-tint px-2.5 text-xs font-semibold whitespace-nowrap text-[#c4501a] ring-1 ring-inset ring-primary/25 transition-colors hover:bg-[#ffe1cf] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  Get prompt for image
                </button>
              }
            >
              <ImageManager
                images={form.images}
                mainImageUrl={form.mainImageUrl}
                plainImageUrl={form.plainImageUrl}
                folder={form}
                onUploaded={addImage}
                onRemove={removeImage}
                onSetMain={(url) => changeImages((c) => ({ ...c, mainImageUrl: url }))}
                onSetPlain={(url) => changeImages((c) => ({ ...c, plainImageUrl: url }))}
                onBusyChange={setUploading}
                autoSave={product ? imageSave : null}
              />
            </Section>

            <Section title="Basic information" icon={FileText}>
              <Field label="Product name" required>
                <input
                  value={form.productName}
                  onChange={(e) => set("productName", e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Nilgiri L-Shape Corner Sofa"
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
                  placeholder="What makes this piece special?"
                  className={`${inputClass} h-auto resize-y py-2 leading-relaxed`}
                />
              </Field>
            </Section>

            <Section title="Organization" icon={Layers} description="Where it appears in the catalog">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Category" required>
                  <select
                    value={form.categoryName}
                    onChange={(e) => set("categoryName", e.target.value)}
                    className={`${inputClass} pr-7`}
                  >
                    {categories.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subcategory" required>
                  <input
                    value={form.subcategoryName}
                    onChange={(e) => set("subcategoryName", e.target.value)}
                    className={inputClass}
                    list="subcategory-options"
                    placeholder="Pick or type new"
                    maxLength={60}
                  />
                  <datalist id="subcategory-options">
                    {subcategories.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </Field>
              </div>
              <div>
                <span className="mb-1 block text-xs font-medium text-ink/80">Tags</span>
                <TagInput tags={form.tags} onChange={(tags) => set("tags", tags)} />
                <p className="mt-1 text-[11px] leading-snug text-slate">
                  The first tag (<Star className="inline h-2.5 w-2.5 fill-current align-[-1px] text-primary" aria-hidden />) is
                  shown as the badge on the product card.
                </p>
              </div>
            </Section>

            <Section title="Pricing" icon={IndianRupee}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <Field label="Offer price" required>
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

            <Section title="Specifications" icon={Ruler}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Material">
                  <input
                    value={form.material}
                    onChange={(e) => set("material", e.target.value)}
                    className={inputClass}
                    placeholder="Solid wood & linen"
                  />
                </Field>
                <Field label="Wood type">
                  <input
                    value={form.woodType}
                    onChange={(e) => set("woodType", e.target.value)}
                    className={inputClass}
                    placeholder="Sheesham"
                  />
                </Field>
                <Field label="Dimensions">
                  <input
                    value={form.dimensions}
                    onChange={(e) => set("dimensions", e.target.value)}
                    className={inputClass}
                    placeholder="6 ft × 3 ft × 2.5 ft"
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
            </Section>

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
                    placeholder="e.g. Termite-proof finish"
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
          </div>

          {/* Footer */}
          <footer className="shrink-0 border-t border-line bg-white px-4 py-2.5">
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
                  disabled={uploading || imageSave === "saving" || (!!product && !dirty)}
                >
                  {saving ? "Saving…" : uploading ? "Uploading…" : product ? "Save changes" : "Create product"}
                </Button>
              </div>
            </div>
          </footer>
        </form>
      </div>

      {promptOpen && <ImagePromptDialog product={form} onClose={() => setPromptOpen(false)} />}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { Check, Copy, ExternalLink, Sparkles, X } from "lucide-react";
import type { ProductInput } from "@/lib/adminProducts";
import { buttonClass } from "../ui";
import { useOverlay } from "./useOverlay";

type PromptProduct = Pick<
  ProductInput,
  | "productName"
  | "categoryName"
  | "subcategoryName"
  | "description"
  | "material"
  | "woodType"
  | "dimensions"
  | "colors"
  | "highlights"
  | "images"
  | "plainImageUrl"
  | "mainImageUrl"
>;

// Where each kind of product is photographed. Subcategory matches win over the category.
function sceneFor(category: string, subcategory: string): string {
  const sub = subcategory.toLowerCase();
  if (/study|office/.test(sub)) return "a bright home study with a desk, bookshelf and a laptop";
  if (/bar stool/.test(sub)) return "a modern kitchen, lined up at a breakfast counter";
  if (/dining chair/.test(sub)) return "a warm dining room, set around a laid dining table";
  if (/kids|bunk/.test(sub)) return "a cheerful, tidy children's bedroom";

  switch (category) {
    case "Sofa":
      return "a spacious, modern Indian living room";
    case "Bed":
      return "a calm, elegant master bedroom with crisp bedding";
    case "Wardrobe":
      return "a neat, well-lit bedroom, with one door slightly open to show the organised interior";
    case "Dresser":
      return "a cosy bedroom dressing corner with a few perfume bottles and a jewellery tray";
    case "Dining":
      return "an open dining area next to the kitchen, table set for a family meal";
    case "CenterTable":
      return "a living room, placed in front of a sofa with a rug underneath";
    case "Chair":
      return "a peaceful reading corner beside a window";
    default:
      return "a stylish, modern Indian home";
  }
}

// Builds a prompt for AI image tools (ChatGPT, Gemini, Midjourney, ...) that
// produces a lifestyle photo of the product, true to its details.
function buildLifestylePrompt(p: PromptProduct, colorIndex: number, hasReference: boolean): string {
  const name = p.productName.trim() || "this furniture piece";
  const kind = [p.subcategoryName.trim(), p.categoryName.trim()].filter(Boolean).join(", ");
  const color = p.colors[colorIndex];
  const highlights = p.highlights.map((h) => h.trim()).filter(Boolean);

  const details = [
    p.description.trim() && `- ${p.description.trim()}`,
    p.material.trim() && `- Material: ${p.material.trim()}`,
    p.woodType.trim() && `- Wood: ${p.woodType.trim()}`,
    color && `- Colour / finish: ${color.name} (${color.hex})`,
    p.dimensions.trim() && `- Size: ${p.dimensions.trim()}`,
    highlights.length > 0 && `- Key features: ${highlights.join("; ")}`,
  ].filter(Boolean);

  return [
    `Create a photorealistic lifestyle photograph of the "${name}"${kind ? ` (${kind})` : ""}.`,
    hasReference &&
      "Use the attached product photo as the exact reference: keep its design, shape, proportions, colour and finish unchanged.",
    details.length > 0 && `\nProduct details (keep these accurate):\n${details.join("\n")}`,
    `\nScene: Make the product the hero of ${sceneFor(p.categoryName, p.subcategoryName)}, styled as a modern Indian home. Add a few tasteful props that suit the room, soft textiles and an indoor plant, without cluttering the frame.`,
    "\nLighting & camera: Warm natural daylight from a nearby window with soft shadows. Eye-level three-quarter angle, 35mm lens, shallow depth of field. The whole product is in frame and in sharp focus.",
    "\nStyle: High-end furniture catalogue photography, realistic textures and wood grain, true-to-life colours. Landscape 4:3.",
    "\nAvoid: text, logos, watermarks, people's faces, distorted proportions, extra or missing legs, or any change to the product's design or colour.",
  ]
    .filter(Boolean)
    .join("\n");
}

async function copyText(text: string, fallback: HTMLTextAreaElement | null) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API blocked (e.g. non-HTTPS): copy via a text selection instead.
    fallback?.select();
    document.execCommand("copy");
  }
}

export default function ImagePromptDialog({ product, onClose }: { product: PromptProduct; onClose: () => void }) {
  const panelRef = useOverlay<HTMLDivElement>(onClose);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [colorIndex, setColorIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // The plain-background shot is the best reference; otherwise the cover or first image.
  const reference = product.plainImageUrl || product.mainImageUrl || product.images[0] || "";
  const [prompt, setPrompt] = useState(() => buildLifestylePrompt(product, 0, Boolean(reference)));

  function pickColor(i: number) {
    setColorIndex(i);
    setPrompt(buildLifestylePrompt(product, i, Boolean(reference)));
    setCopied(false);
  }

  async function handleCopy() {
    await copyText(prompt, textareaRef.current);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="admin-fade-in fixed inset-0 z-[110] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-prompt-title"
        tabIndex={-1}
        className="admin-pop-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-panel bg-white shadow-2xl focus:outline-none sm:max-w-xl sm:rounded-card"
      >
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-tint text-primary">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="image-prompt-title" className="text-[15px] font-semibold text-ink">
              Lifestyle image prompt
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate">
              Paste this into ChatGPT, Gemini or any AI image tool to get a room-setting photo of this product.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-[7px] text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
          {product.colors.length > 1 && (
            <div>
              <span className="mb-1.5 block text-xs font-medium text-ink/80">Colour to show</span>
              <div className="flex flex-wrap gap-1.5">
                {product.colors.map((c, i) => (
                  <button
                    key={`${c.name}-${i}`}
                    type="button"
                    onClick={() => pickColor(i)}
                    aria-pressed={colorIndex === i}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium ring-1 ring-inset transition-colors ${
                      colorIndex === i ? "bg-tint text-[#c4501a] ring-primary/30" : "bg-white text-ink ring-line hover:bg-paper"
                    }`}
                  >
                    <span className="h-3 w-3 rounded-full ring-1 ring-inset ring-ink/15" style={{ backgroundColor: c.hex }} />
                    {c.name || `Colour ${i + 1}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {reference && (
            <div className="flex items-center gap-3 rounded-[8px] bg-paper px-3 py-2.5 ring-1 ring-inset ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
              <img src={reference} alt="" className="h-12 w-12 shrink-0 rounded-[6px] object-cover ring-1 ring-line" />
              <p className="min-w-0 flex-1 text-xs leading-snug text-slate">
                <span className="font-semibold text-ink">Attach this photo</span> along with the prompt so the AI keeps the
                exact design.
              </p>
              <a
                href={reference}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("secondary", "sm")}
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                Open
              </a>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-xs font-medium text-ink/80">
              Prompt
              <span className="font-normal text-slate">You can edit it before copying</span>
            </span>
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setCopied(false);
              }}
              rows={14}
              className="w-full resize-y rounded-[8px] border border-line bg-white px-3 py-2.5 font-mono text-[12.5px] leading-relaxed text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary/15"
            />
          </label>
        </div>

        <footer className="shrink-0 border-t border-line bg-paper/60 px-5 py-4">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-btn text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(1,18,60,0.12)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 ${
              copied ? "bg-emerald-600" : "bg-primary hover:bg-[#e85f1c]"
            }`}
          >
            {copied ? <Check className="h-5 w-5" aria-hidden /> : <Copy className="h-5 w-5" aria-hidden />}
            {copied ? "Copied to clipboard" : "Copy prompt"}
          </button>
        </footer>
      </div>
    </div>
  );
}

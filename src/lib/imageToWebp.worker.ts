// Web Worker behind src/lib/imageToWebp.ts. Decodes, resizes (Lanczos3) and
// encodes to WebP with libwebp compiled to WebAssembly (jSquash), off the main
// thread so the admin page stays responsive while a photo is optimized.
// The bundler emits the codecs' .wasm files as hashed static assets; they only
// download the first time an admin adds an image.

import encode, { init as initWebp } from "@jsquash/webp/encode";
import resize, { initResize } from "@jsquash/resize";

export type WorkerRequest = { id: number; file: File; maxSide: number };
export type WorkerResponse =
  | { id: number; ok: true; webp: ArrayBuffer; resized: boolean }
  | { id: number; ok: false; error: string };

// High-quality preset: visually the same as the original, much smaller file.
const WEBP_OPTIONS = {
  quality: 90,
  method: 6, // slowest, best compression for the quality
  use_sharp_yuv: 1, // keeps colour edges and texture crisp
  alpha_quality: 100,
};

let ready: Promise<unknown> | null = null;
const loadCodecs = () =>
  (ready ??= Promise.all([initWebp(), initResize()]).catch((err) => {
    ready = null; // let the next image try again
    throw err;
  }));

// Full-size pixels, with EXIF rotation applied so portrait photos stay upright.
async function readPixels(file: File): Promise<ImageData> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas is not available");
    ctx.drawImage(bitmap, 0, 0);
    return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
}

async function optimize({ file, maxSide }: WorkerRequest) {
  const [, pixels] = await Promise.all([loadCodecs(), readPixels(file)]);
  const longest = Math.max(pixels.width, pixels.height);
  const scale = longest > maxSide ? maxSide / longest : 1;
  const image =
    scale < 1
      ? await resize(pixels, {
          width: Math.round(pixels.width * scale),
          height: Math.round(pixels.height * scale),
          method: "lanczos3",
          premultiply: true,
          linearRGB: true, // gamma-correct, so dark textures don't muddy
        })
      : pixels;
  return { webp: await encode(image, WEBP_OPTIONS), resized: scale < 1 };
}

// One image at a time keeps memory low (a 12 MP photo is ~48 MB of pixels).
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  queue = queue.then(async () => {
    let response: WorkerResponse;
    try {
      const { webp, resized } = await optimize(request);
      response = { id: request.id, ok: true, webp, resized };
      self.postMessage(response, { transfer: [webp] });
    } catch (err) {
      response = { id: request.id, ok: false, error: err instanceof Error ? err.message : String(err) };
      self.postMessage(response);
    }
  });
};

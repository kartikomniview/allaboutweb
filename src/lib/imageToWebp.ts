// Browser-side image optimisation for admin uploads: resizes the longest side to
// `maxSide` and re-encodes as high-quality WebP.
//
// The canvas's built-in WebP export (canvas.toBlob) only takes a quality number
// and smudges fine texture, so the work is done with the real libwebp encoder
// and a Lanczos3 resizer compiled to WebAssembly, in a Web Worker
// (imageToWebp.worker.ts) so the page doesn't freeze.
//
// Falls back to the original file if anything fails, or when re-encoding
// wouldn't make it smaller.

import type { WorkerRequest, WorkerResponse } from "./imageToWebp.worker";

const CONVERTIBLE = ["image/jpeg", "image/png", "image/webp", "image/avif"];

let worker: Worker | null = null;
let nextId = 0;
const waiting = new Map<number, (response: WorkerResponse) => void>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./imageToWebp.worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      waiting.get(event.data.id)?.(event.data);
      waiting.delete(event.data.id);
    };
    worker.onerror = (event) => {
      // The worker itself broke (e.g. failed to load): fail everything waiting
      // and start a fresh worker for the next image.
      for (const [id, done] of waiting) done({ id, ok: false, error: event.message || "Worker failed" });
      waiting.clear();
      worker?.terminate();
      worker = null;
    };
  }
  return worker;
}

function optimizeInWorker(file: File, maxSide: number): Promise<WorkerResponse> {
  return new Promise((resolve) => {
    const id = ++nextId;
    waiting.set(id, resolve);
    const request: WorkerRequest = { id, file, maxSide };
    getWorker().postMessage(request);
  });
}

export async function toWebP(file: File, maxSide = 2560): Promise<File> {
  if (!CONVERTIBLE.includes(file.type)) return file;

  try {
    const result = await optimizeInWorker(file, maxSide);
    if (!result.ok) throw new Error(result.error);

    // Not resized and re-encoding didn't make it smaller (e.g. an already
    // compact WebP or AVIF): keep the original.
    if (!result.resized && result.webp.byteLength >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "") || "image"}.webp`;
    return new File([result.webp], name, { type: "image/webp", lastModified: Date.now() });
  } catch (err) {
    console.error("Image optimization failed; uploading the original", err);
    return file;
  }
}

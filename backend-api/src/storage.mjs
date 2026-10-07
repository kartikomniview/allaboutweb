import { randomBytes } from "node:crypto";
import { DeleteObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { HttpError } from "./http.mjs";

const BUCKET = process.env.S3_BUCKET || "aawsite";
const REGION = process.env.S3_REGION || "ap-south-1";
const PREFIX = (process.env.S3_PREFIX || "ecatalog").replace(/^\/+|\/+$/g, "");

const PUBLIC_BASE = `https://${BUCKET}.s3.${REGION}.amazonaws.com/`;
const IMAGE_BASE = `${PUBLIC_BASE}${PREFIX}/`;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_FILES_PER_REQUEST = 10;
const UPLOAD_EXPIRES_SECONDS = 300;

const IMAGE_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

let s3;

// Created lazily so a warm Lambda reuses the client. Credentials come from the
// Lambda execution role.
function client() {
  if (!s3) s3 = new S3Client({ region: REGION });
  return s3;
}

const bad = (message) => new HttpError(400, "BAD_REQUEST", message);

export function slugify(text) {
  const slug = String(text ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // drop accents: "décor" → "decor"
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
  return slug || "untitled";
}

// ecatalog/{category}/{subcategory}/{product}/{time}-{random}.{ext}
// The random suffix keeps every key unique, so files can be cached forever.
export function imageKey(categoryName, subcategoryName, productName, ext) {
  const name = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}.${ext}`;
  return [PREFIX, slugify(categoryName), slugify(subcategoryName), slugify(productName), name].join("/");
}

export const isOwnImageUrl = (url) =>
  typeof url === "string" && url.startsWith(IMAGE_BASE) && url.length > IMAGE_BASE.length;

const keyFromUrl = (url) => (isOwnImageUrl(url) ? decodeURIComponent(url.slice(PUBLIC_BASE.length)) : null);

// Signed upload forms the browser posts straight to S3. The policy pins the
// key, the content type and the 5 MB size limit.
export async function presignImageUploads(body) {
  const { categoryName, subcategoryName, productName, files } = body ?? {};
  for (const [field, value] of Object.entries({ categoryName, subcategoryName, productName })) {
    if (typeof value !== "string" || !value.trim()) throw bad(`${field} is required to upload images`);
  }
  if (!Array.isArray(files) || files.length === 0) throw bad("files must be a non-empty list");
  if (files.length > MAX_FILES_PER_REQUEST) throw bad(`At most ${MAX_FILES_PER_REQUEST} images per upload`);

  const items = files.map((file, i) => {
    const ext = IMAGE_TYPES[file?.contentType];
    if (!ext) throw bad(`Image #${i + 1} must be JPG, PNG, WebP or AVIF`);
    if (typeof file.size !== "number" || file.size <= 0 || file.size > MAX_IMAGE_BYTES) {
      throw bad(`Image #${i + 1} must be smaller than 5 MB`);
    }
    return { contentType: file.contentType, key: imageKey(categoryName, subcategoryName, productName, ext) };
  });

  return Promise.all(
    items.map(async ({ contentType, key }) => {
      const { url, fields } = await createPresignedPost(client(), {
        Bucket: BUCKET,
        Key: key,
        Conditions: [
          ["content-length-range", 1, MAX_IMAGE_BYTES],
          ["eq", "$Content-Type", contentType],
        ],
        Fields: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        Expires: UPLOAD_EXPIRES_SECONDS,
      });
      return { uploadUrl: url, fields, publicUrl: `${PUBLIC_BASE}${key}` };
    }),
  );
}

// Best-effort cleanup: only touches keys under the e-catalog prefix and never
// throws, so a failed delete can't fail the save that triggered it.
export async function deleteImages(urls) {
  const keys = [...new Set((urls ?? []).map(keyFromUrl).filter(Boolean))];
  if (!keys.length) return;
  try {
    const res = await client().send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
      }),
    );
    if (res.Errors?.length) console.error("Some images could not be deleted", res.Errors);
  } catch (err) {
    console.error("Image cleanup failed", err);
  }
}

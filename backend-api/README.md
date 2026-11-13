# backend-api — Admin API (Firebase Auth + Firestore on AWS Lambda)

This is the backend for Catalog24: store registration, the store owners' admin panel (`catalog24.in/admin`), each store's products and product images, and the public catalog of every store. It runs as one Node.js Lambda function behind an API Gateway HTTP API.

**Stores.** Every account owns one store. A store has a name, e.g. "Demo Store", and a *slug*, which is the name lowercased with everything except letters and digits removed, e.g. `demostore`. The slug is the store's subdomain, `demostore.catalog24.in`. Slugs are unique and never change. The products that existed before stores were introduced belong to the store "Demo" (`demo.catalog24.in`).

| Route | Purpose |
| --- | --- |
| `POST /auth/register` | **Public.** Body `{ storeName, businessTypes, email, password, deviceId, whatsapp? }`. `whatsapp` is optional (added later in Store settings). `businessTypes` is what the store sells: one or more of `furniture`, `decor`, `lighting`, `flooring`, `curtains`, `fabrics`, `bath`, `clothing`, `footwear`, `jewellery`, `optical`, `electronics`, `mobiles`. Creates the store and the owner's Firebase account, binds this device (the one-device rule) and logs them in: returns `{ token, expiresAt, user }`. 409 `STORE_TAKEN` if the store name (its slug) exists, 409 `EMAIL_TAKEN` if the email has an account |
| `GET /stores/check?name=…` | **Public.** Whether a store name is free: `{ slug, available, message }`. The registration form's live check |
| `POST /auth/login` | Body `{ email, password, deviceId }`. Checks the credentials with Firebase Auth, applies the one-device rule, and returns `{ token, expiresAt, user }`. `user.store` is `{ slug, name }` |
| `GET /auth/session` | Headers `Authorization: Bearer <token>` and `X-Device-Id`. Returns `{ user, expiresAt }`, or 401 |
| `POST /auth/logout` | Header `Authorization: Bearer <token>`. Deletes the session |
| `GET /catalog/{store}/products` | **Public, no login.** A store's public details and its published products (`isActive: true`): `{ store, products }`, or 404 `STORE_NOT_FOUND`. Each store's catalog page reads this |
| `GET /catalog/products` | **Public.** The demo store's products, as `{ products }`. Kept for older website builds |
| `POST /store/whatsapp-request` | Body `{ whatsapp }`. The owner asks for this WhatsApp number; it goes live only when a super admin approves it. Returns `{ store }` with `whatsappRequest: { number, status: "pending", requestedAt, reason, decidedAt }`. `{ whatsapp: "" }` withdraws the request. 400 if the number is already the live one |
| `GET /store` / `PUT /store` | The logged-in owner's store details (name, WhatsApp, business types, phone, email, address, hours, tagline, category, year started, logo), plus `whatsappRequest` (see below). The slug can't be changed, and `PUT` never changes the WhatsApp number (a `whatsapp` field is ignored). `PUT` keeps the business types when `businessTypes` isn't sent, and the logo when `logo` isn't sent (an empty `logo` removes it). The logo is uploaded with `POST /products/uploads` like a product photo, and a replaced logo file is deleted. Stores from before business types (the Demo store) count as `["furniture"]` |
| `GET /products` | Lists the store's products as `{ products }` |
| `POST /products` | Body is one product. Creates it with an auto id and returns `{ product }` |
| `POST /products/import` | Body `{ products: [{ id, ...product }] }`. Creates products with fixed ids and skips ids that already exist. Returns `{ created, skipped }` |
| `PUT /products/{id}` | Body is the full product. Replaces its fields and returns `{ product }` |
| `DELETE /products/{id}` | Deletes the product and its images in S3 |
| `GET /admin/stores` | **Super admins only.** Every store: `{ stores: [{ slug, name, email, active, productLimit, productCount, userCount, createdAt }] }` |
| `GET /admin/stores/{slug}/users` | **Super admins only.** The store's logins, owner first: `{ users: [{ uid, email, isOwner, deviceBound, deviceBoundAt, lastLoginAt, addedAt }] }` |
| `POST /admin/stores/{slug}/users` | **Super admins only.** Body `{ email, password }`. Creates another login for the store, with the same access as the owner. Returns `{ user }` (201), or 409 `EMAIL_TAKEN` |
| `POST /admin/stores/{slug}/users/{uid}/reset-device` | **Super admins only.** Clears the user's device lock and ends their sessions; their next login binds the new device. Returns `{ user }` |
| `DELETE /admin/stores/{slug}/users/{uid}` | **Super admins only.** Deletes an extra login: its sessions, `users/{uid}` and the Firebase account. The store owner and your own account can't be removed |
| `PUT /admin/stores/{slug}` | **Super admins only.** Body `{ active?, productLimit?, whatsapp?, whatsappDecision?, rejectReason? }`. `productLimit` is a whole number from 0 to 10000, or `null` for unlimited. `whatsapp` sets the live number directly (`""` removes it) and clears any request. `whatsappDecision` is `"approve"` (the requested number goes live) or `"reject"` (with an optional `rejectReason`, at most 200 characters, shown to the owner); 400 when nothing is waiting. Returns `{ store }`, which also has `whatsapp` and `whatsappRequest` |
| `DELETE /admin/stores/{slug}` | **Super admins only.** Body `{ confirm: "<slug>" }`. Permanently deletes the store: its products and their images (plus anything else in its S3 folder), every login (sessions, `users/{uid}` and the Firebase account, the owner's too) and `stores/{slug}`. The slug can then be registered again. Returns `{ deleted: { slug, products, users } }`. 400 for the Demo store or your own store. The store is switched off first and deleted last, so if it fails partway, calling it again finishes the job |
| `POST /products/uploads` | Body `{ categoryName, subcategoryName, productName, files: [{ contentType, size }] }`. Returns `{ uploads: [{ uploadUrl, fields, publicUrl }] }`, one signed S3 upload form per file. The browser then uploads each file straight to S3 |
| `POST /products/uploads/discard` | Body `{ urls }`. Deletes images that were uploaded but never saved to a product (for example when the editor is cancelled) |
| `POST /products/detect` | Body `{ businessTypes, categories: [{ name, subcategories }], image: { data, mediaType } }` (a base64 photo) or `{ businessTypes, categories, imageUrl }` (an uploaded image). `businessTypes` are labels for the prompt ("Furniture", "Lighting"; at most 20); `categories` (at most 120) are the predefined categories of the store's business types. Asks Claude to identify any kind of product and returns `{ detected: { productName, productType, categoryFit, categoryName, subcategoryName, description, dimensions, specs, tags, highlights, keywords } }`. `productType` is what the product is ("ceramic jug"). `categoryFit` is `exact`, `close` (the closest subcategory was chosen) or `none`: the product is a different kind of thing from what the `categories` cover (a jug in a furniture store), and the category and subcategory are then empty, so the admin form asks the owner to choose one. Otherwise the category and subcategory are always one of the `categories` sent (with its spelling); the model never suggests a new category |

Every `/products` and `/store` route needs a logged-in store owner: the same `Authorization: Bearer <token>` and `X-Device-Id` headers as `GET /auth/session`. They only ever see and change that owner's own store: another store's product id returns 404. Each store's images are stored under `ecatalog/stores/{slug}/` in S3 (the demo store's older images stay under `ecatalog/`).

## How the one-device rule works

- The browser creates a random device ID once and keeps it in `localStorage` under `aaw_device_id`.
- The first successful login saves that ID in Firestore at `users/{uid}.deviceId`.
- A login from any other device then gets **403 `DEVICE_LOCKED` "Logged in into another device"**.
- Logging out ends the session but **does not** remove the device binding.
- If someone clears the browser's site data or switches browsers, that counts as a new device. You then have to reset the user by hand (step 8).

Firestore layout:

```
stores/{slug}      { name, slug, ownerUid, email, whatsapp, businessTypes[], phone, publicEmail,
                     address, hours, tagline, category, since, coverImage, logo, createdAt, updatedAt,
                     whatsappRequest?: { number, status: "pending" | "rejected", requestedAt, reason?, decidedAt? } }
                     // whatsapp is the live number; only a super admin sets it
                     // (approving the owner's whatsappRequest, or directly)
users/{uid}        { email, storeSlug, deviceId, deviceBoundAt, lastLoginAt }
sessions/{sha256}  { uid, email, deviceId, createdAt, expiresAt }   // doc id = SHA-256 of the token
products/{id}      { storeSlug, productName, categoryName, subcategoryName, price, originalPrice,
                     tags[], keywords[], rating, reviewCount, colors[{ name, hex }], material,
                     dimensions, specs[{ label, value }], stockStatus, description, highlights[],
                     woodType (older furniture field; new products use a "Wood" spec),
                     isActive, mainImageUrl, plainImageUrl, images[],
                     createdAt, updatedAt }
```

The API checks every product field before writing it (see `validateProduct` in `src/products.mjs`). For example, `originalPrice` (MRP) cannot be lower than `price`, and color hex values must look like `#A1B2C3`.

### Product images

- Images are stored in the S3 bucket `aawsite` at `ecatalog/{category}/{subcategory}/{product-name}/{unique-id}.{ext}`. For example: `ecatalog/sofa/l-shape-sofa/nilgiri-l-shape-corner-sofa/mux21tpl-5283ff12.webp`.
  - The folder names are the category, subcategory and product name in lowercase, with spaces and symbols replaced by `-`.
  - If a product is renamed later, its existing images stay where they are. Only new uploads go to the new folder.
- `images` holds the public URL of every image. `mainImageUrl` (the cover photo) and `plainImageUrl` (the product on a plain background) must each be empty or one of those URLs. If `mainImageUrl` is empty, the API sets it to the first image.
- The API only accepts image URLs under `https://aawsite.s3.ap-south-1.amazonaws.com/ecatalog/`.
- Uploads must be JPG, PNG, WebP or AVIF, and at most 5 MB each. S3 enforces this through the signed upload policy, which is valid for 5 minutes.
- When a product is saved without an image it had before, or when it is deleted, the Lambda deletes those files from S3.

---

## Step-by-step setup

### 1. Firebase project

1. Open <https://console.firebase.google.com> and create a project, or pick an existing one.
2. Go to **Build → Authentication → Get started → Sign-in method** and enable **Email/Password**.
3. Go to **Authentication → Users → Add user** and create the admin's email and password. This is the only way to create users, because there is no sign-up page.
4. Go to **Build → Firestore Database → Create database**, choose **Production mode**, and pick a region (e.g. `asia-south1`).
   - The default "deny all" security rules can stay as they are. Only the Lambda reads and writes Firestore, through the Admin SDK, and the Admin SDK skips the rules.
5. Optional: set a TTL policy so expired sessions get deleted automatically. Go to **Firestore → TTL → Create policy**, with collection group `sessions` and timestamp field `expiresAt`.

### 2. Get the two secrets

1. **Web API key:** **Project settings (gear) → General → Web API Key**.
   - If you have restricted this key in Google Cloud Console, the restriction must allow the **Identity Toolkit API**. It must also not be limited to HTTP referrers, because the Lambda calls the API from a server and sends no referrer.
2. **Service account:** **Project settings → Service accounts → Generate new private key**. This downloads a JSON file.
   - Keep the file out of git. `.gitignore` already ignores `serviceAccount*.json` and `*-firebase-adminsdk-*.json`.
3. Base64-encode the JSON in PowerShell so it fits in a single environment variable:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\to\your-firebase-adminsdk.json")) | Set-Clipboard
   ```

   The encoded value is now on your clipboard.

### 3. Build the deployment zip

```powershell
cd backend-api
npm install          # first time only, creates package-lock.json
npm run package      # creates backend-api\lambda.zip (~13 MB)
```

Use `npm run package` rather than zipping the folder yourself. The script calls Windows' own `tar.exe`, which writes the forward-slash paths that Lambda needs. `Compress-Archive` writes backslash paths, so Lambda can't find the files.

### 4. Create the Lambda function (AWS Console)

1. Open **AWS Console → Lambda**. Pick a region, e.g. **ap-south-1 (Mumbai)**, and use the same region for API Gateway.
2. Click **Create function → Author from scratch** and fill in:
   - Name: `aaw-admin-auth`
   - Runtime: **Node.js 22.x**
   - Architecture: x86_64 or arm64 (either works)
   - Permissions: *Create a new role with basic Lambda permissions*. This is enough, since the function only needs CloudWatch logs.
3. On the **Code** tab, click **Upload from → .zip file** and select `backend-api\lambda.zip`.
   - The console won't show the code in the editor because the package is larger than 3 MB. That is normal.
4. Under **Code → Runtime settings → Edit**, set **Handler** to `index.handler`. This is the default, so you may not need to change it.
5. Under **Configuration → General configuration → Edit**, set **Memory** to `256 MB` and **Timeout** to `10 sec`.
6. Under **Configuration → Environment variables → Edit**, add:

   | Key | Value |
   | --- | --- |
   | `FIREBASE_WEB_API_KEY` | the Web API key from step 2.1 |
   | `FIREBASE_SERVICE_ACCOUNT_BASE64` | the base64 string from step 2.3 |
   | `SESSION_TTL_HOURS` | `12` (optional, default 12) |
   | `SUPER_ADMIN_EMAILS` | `admin@allaboutweb.com` (comma-separated; these accounts manage every store) |

7. Optional quick check: go to **Test** and create an event with this JSON, then run it:

   ```json
   {
     "routeKey": "POST /auth/login",
     "requestContext": { "http": { "method": "POST" } },
     "headers": {},
     "body": "{\"email\":\"admin@example.com\",\"password\":\"YOUR_PASSWORD\",\"deviceId\":\"console-test-device\"}"
   }
   ```

   You should get `statusCode: 200` with a token.
   - **This binds the user to `console-test-device`.** Delete `deviceId` in Firestore afterwards (step 8), or use a different test user.

### 5. Create the HTTP API (API Gateway console)

1. Open **AWS Console → API Gateway → Create API → HTTP API → Build**.
2. Under **Integrations**, click **Add integration**, choose **Lambda**, and select `aaw-admin-auth`. Name the API `aaw-admin-api` and click **Next**.
3. On **Configure routes**, add these routes. They all point to the `aaw-admin-auth` integration:
   - `POST` `/auth/login`
   - `GET` `/auth/session`
   - `POST` `/auth/logout`
   - `GET` `/catalog/products`
   - `GET` `/products`
   - `POST` `/products`
   - `POST` `/products/import`
   - `PUT` `/products/{id}`
   - `DELETE` `/products/{id}`
   - `POST` `/products/uploads`
   - `POST` `/products/uploads/discard`
4. On **Stages**, keep `$default` with **Auto-deploy** on. Click **Next**, then **Create**.
5. Open the API and go to **CORS → Configure**:
   - **Access-Control-Allow-Origin**: `http://localhost:3000` and your production URL (e.g. `https://yourdomain.com`)
   - **Access-Control-Allow-Methods**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
   - **Access-Control-Allow-Headers**: `content-type`, `authorization`, `x-device-id`
   - **Access-Control-Max-Age**: `3600`
   - Click **Save**.
6. Recommended, to slow down password guessing: go to **Protect → Throttling**, edit the `$default` stage, and set e.g. **Rate 10**, **Burst 20**.
7. Copy the **Invoke URL** from the API overview, e.g. `https://abc123.execute-api.ap-south-1.amazonaws.com`.

Test it from PowerShell:

```powershell
$api = "https://abc123.execute-api.ap-south-1.amazonaws.com"
Invoke-RestMethod -Method Post -Uri "$api/auth/login" -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"wrong","deviceId":"test-device-123"}'
# Expect a 401 "Invalid email or password"
```

### 6. Set up S3 for product images

The Lambda signs uploads with its own role, so the role needs permission to write and delete images. The browser uploads straight to the bucket, so the bucket needs CORS.

1. **Lambda role permissions.** Go to **Lambda → aaw-admin-auth → Configuration → Permissions** and click the role name. In IAM, click **Add permissions → Create inline policy → JSON**, paste the following, and save it as `aaw-ecatalog-images`:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": ["s3:PutObject", "s3:DeleteObject"],
         "Resource": "arn:aws:s3:::aawsite/ecatalog/*"
       }
     ]
   }
   ```

2. **Bucket CORS.** Go to **S3 → aawsite → Permissions → Cross-origin resource sharing (CORS) → Edit**. Add a rule like this one. If there are rules already, add this as one more entry in the list:

   ```json
   [
     {
       "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
       "AllowedMethods": ["POST"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

3. **Public read access for `ecatalog/`.** Go to **S3 → aawsite → Permissions → Bucket policy**. The images under `website/` are already public. Make sure the statement that allows `s3:GetObject` also covers `ecatalog/*`. For example, its `Resource` should be `"arn:aws:s3:::aawsite/*"`, or a list that includes `"arn:aws:s3:::aawsite/ecatalog/*"`.
4. Optional: under **Lambda → Configuration → Environment variables**, you can override `S3_BUCKET` (default `aawsite`), `S3_REGION` (default `ap-south-1`) and `S3_PREFIX` (default `ecatalog`).

### 7. Connect the website

1. In the repo root, copy `.env.local.example` to `.env.local` and set:

   ```
   NEXT_PUBLIC_API_BASE_URL=https://abc123.execute-api.ap-south-1.amazonaws.com
   ```

2. Run `npm run dev` and open <http://localhost:3000/admin>.
3. On your hosting provider, set the same `NEXT_PUBLIC_API_BASE_URL` variable before you build. `NEXT_PUBLIC_` values are baked into the build, so changing the variable means rebuilding the site.

### 8. Reset a user's device

Super admins do this on the website: **All stores → Manage users → Reset device**. To do it by hand instead:

1. Go to **Firebase Console → Firestore → `users` → the user's document**. The document ID is the user's UID, which you can find in Authentication → Users.
2. Delete the **`deviceId`** field.
   - The old device is logged out on its next session check.
   - The next device to log in becomes the bound device.
3. Optional: delete that user's documents in `sessions`.

### Updating the code later

Run `npm run package` again, then go to **Lambda → Code → Upload from → .zip file**.

### Adding the products API to an existing deployment

If your API was set up before the `/products` routes existed:

1. Run `npm run package` and upload the new `lambda.zip` to the `aaw-admin-auth` function.
2. Go to **API Gateway → aaw-admin-api → Routes → Create**. Add the five `/products` routes from step 5.3, then attach the `aaw-admin-auth` integration to each one under **Integrations**.
3. Go to **CORS → Configure** and add `PUT` and `DELETE` to **Access-Control-Allow-Methods**. Click **Save**.
4. Open `/admin/ecatalog` on the website. If the catalog is empty, click **Import starter products** to copy the starter products from `src/components/furniture-catalog/data.ts` into Firestore.

### Adding the public catalog route to an existing deployment

The website's e-catalog page (`/app/catalog/furniture`) loads its products from `GET /catalog/products`.

1. Run `npm run package` and upload the new `lambda.zip` to the `aaw-admin-auth` function.
2. Go to **API Gateway → aaw-admin-api → Routes → Create**, add `GET` `/catalog/products`, and attach the `aaw-admin-auth` integration to it under **Integrations**.
3. Check it in a browser: open `https://<your-invoke-url>/catalog/products`. You should see `{"products":[...]}` without logging in.

No CORS change is needed: the website fetches this route from its own server, not from the browser.

### Adding image uploads to an existing deployment

1. Run `npm install` and then `npm run package`. The zip now includes the AWS S3 SDK. Upload it to the `aaw-admin-auth` function.
2. Under **Configuration → General configuration**, raise **Timeout** to `15 sec`. Saving a product can now also delete images from S3.
3. Complete step 6 (S3 setup).
4. Add the routes `POST /products/uploads` and `POST /products/uploads/discard` in API Gateway, and attach the `aaw-admin-auth` integration to each one.

### Switching to stores (multi-store) on an existing deployment

Do these in order. Until step 3 is done, the live website keeps working with the old `GET /catalog/products` route.

1. **Backend.** Run `npm run package` and upload `lambda.zip` to the `aaw-admin-auth` function.
2. **API Gateway routes.** In **API Gateway → aaw-admin-api → Routes**, add the following routes, and attach the `aaw-admin-auth` integration to each one:
   - `POST /auth/register`
   - `GET /stores/check`
   - `GET /catalog/{store}/products`
   - `GET /store`
   - `PUT /store`

   CORS already allows `PUT`. Under **Protect → Throttling**, keep a rate limit on the stage, because `POST /auth/register` is public.
3. **Move the existing products into the Demo store.** Run this once from `backend-api/`, with the same service account as the Lambda. First do a dry run, then run it for real:

   ```powershell
   $env:FIREBASE_SERVICE_ACCOUNT_BASE64 = "<the same value as the Lambda's variable>"
   node scripts/migrate-demo-store.mjs --admin-email=you@example.com --dry-run
   node scripts/migrate-demo-store.mjs --admin-email=you@example.com
   ```

   It does three things:
   - creates the store `demo` (named "Demo"), owned by that admin account;
   - puts every existing product into it;
   - clears the admin's device binding. The admin panel now lives on catalog24.in, where the browser has a new device id. The first login there binds the device again.
4. **Website.** Deploy the website. It loads each store from `GET /catalog/{store}/products`.
5. **Wildcard subdomain.** In **Amplify → Hosting → Custom domains → catalog24.in → Manage subdomains**, add the subdomain `*` pointing to the production branch. If the domain's DNS isn't on Route 53, add the `CNAME` record for `*.catalog24.in` that Amplify shows. Amplify issues the wildcard certificate.
6. **Check.**
   - `https://demo.catalog24.in` shows the existing products.
   - `https://catalog24.in/register` creates a store.
   - The new store's catalog opens at `https://<slug>.catalog24.in`.

Locally, open `http://catalog24.localhost:3000/register` and `http://<slug>.localhost:3000`. Browsers send any `*.localhost` to your own machine, so no setup is needed.

### Adding product limits and store on/off to an existing deployment

Every store has a product limit and an active flag in `stores/{slug}`:

- **`productLimit`:** new stores get 20. A store without the field (such as the Demo store) is unlimited.
  - `POST /products` returns 403 `PRODUCT_LIMIT` at the limit.
  - `POST /products/import` only imports up to the limit and reports `limitReached`.
- **`active`:** a missing field counts as active. When it's `false`:
  - the owner can't log in, and open sessions end on their next request (403 `STORE_INACTIVE`);
  - `GET /catalog/{store}/products` returns 403 `STORE_INACTIVE` with only the store's name, so the website shows "Store unavailable".

Super admins (`SUPER_ADMIN_EMAILS`) change both on the website's **All stores** page (`/admin/stores`). They are never blocked by their own store's status.

1. Run `npm run package` and upload `lambda.zip`.
2. Add the environment variable `SUPER_ADMIN_EMAILS` (for example `admin@allaboutweb.com`).
3. In API Gateway, add these routes with the `aaw-admin-auth` integration:
   - `GET /admin/stores`
   - `PUT /admin/stores/{slug}`

### Adding store users (super admin) to an existing deployment

On **All stores → Manage users**, super admins see each store's logins, reset a login's device lock, add another login for the store (same access as the owner) and remove extra logins. Extra logins are `users/{uid}` documents with the store's `storeSlug`, like the owner's.

1. Run `npm run package` and upload `lambda.zip`.
2. In API Gateway, add these routes with the `aaw-admin-auth` integration:
   - `GET /admin/stores/{slug}/users`
   - `POST /admin/stores/{slug}/users`
   - `POST /admin/stores/{slug}/users/{uid}/reset-device`
   - `DELETE /admin/stores/{slug}/users/{uid}`

   CORS already allows `POST` and `DELETE`.

### Adding WhatsApp number approval to an existing deployment

Store owners no longer set their WhatsApp number themselves, so nobody can put a number that isn't theirs on a catalog. They request one in **Store settings** (`POST /store/whatsapp-request`); super admins approve or reject it on **All stores → Requests**, or set a number directly. Numbers that were already live stay as they are. A number sent at registration is a request too.

1. Run `npm run package` and upload `lambda.zip`.
2. In API Gateway, add the route `POST /store/whatsapp-request` with the `aaw-admin-auth` integration.

### Adding store deletion (super admin) to an existing deployment

On **All stores**, each store's **Delete** button permanently deletes it (see `DELETE /admin/stores/{slug}` above). The Demo store and your own store can't be deleted.

1. Run `npm run package` and upload `lambda.zip`.
2. In API Gateway, add the route `DELETE /admin/stores/{slug}` with the `aaw-admin-auth` integration.
3. Optional: to also delete files in the store's folder that never made it into a product (abandoned uploads), let the Lambda role list that folder. Add this statement to the `aaw-ecatalog-images` policy. Without it, product images, the logo and the cover image are still deleted; only the leftovers stay.

   ```json
   {
     "Effect": "Allow",
     "Action": "s3:ListBucket",
     "Resource": "arn:aws:s3:::aawsite",
     "Condition": { "StringLike": { "s3:prefix": "ecatalog/stores/*" } }
   }
   ```

### Adding photo detection to an existing deployment

When a photo is added to a new product, the admin form fills in the name, category, subcategory, description, colours, material and wood type from it. The Lambda asks Claude (model `claude-haiku-5-5`) to identify the product.

1. **Get an Anthropic API key.**
   1. Sign up at <https://platform.claude.com>.
   2. Under **Settings → Billing**, add a card and buy credits. Billing is prepaid: each detection is deducted from the balance. You can turn on auto-reload and set a monthly spend limit.
   3. Under **Settings → API Keys**, create a key.
   4. Each detection costs about $0.0007, so 1,000 products cost about $0.65. Prices can change.
2. Run `npm install` and then `npm run package`. The zip now includes the Anthropic SDK. Upload it to the `aaw-admin-auth` function.
3. Under **Configuration → Environment variables**, add `ANTHROPIC_API_KEY` with the key.
   - Optional: set `ANTHROPIC_MODEL` to use a different Claude model, for example `claude-sonnet-5-5`, which is more accurate but about 20 times the price.
4. Under **Configuration → General configuration**, raise **Timeout** to `30 sec`. A detection usually takes 2–6 seconds, but this leaves room for one retry.
5. In API Gateway, add the route `POST /products/detect` and attach the `aaw-admin-auth` integration to it. API Gateway's integration timeout is 30 seconds by default. Leave it at that.

If the key is missing or invalid, the admin form shows "Photo detection is not set up". You can then still fill in the name, category and subcategory by hand and click **Retry** on the photo.

---

## Error codes returned by the API

| Status | `code` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Missing or invalid email, password, deviceId or product field, or a body that isn't valid JSON |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `NO_SESSION` / `SESSION_INVALID` / `SESSION_EXPIRED` / `DEVICE_RESET` | Session check failed |
| 404 | `NOT_FOUND` | Unknown route, or the product id does not exist |
| 403 | `DEVICE_LOCKED` | The user is bound to a different device ("Logged in into another device") |
| 403 | `NO_STORE` | The account has no store (`users/{uid}.storeSlug` is missing) |
| 403 | `STORE_INACTIVE` | The store has been deactivated by a super admin |
| 403 | `PRODUCT_LIMIT` | The store has reached its product limit |
| 403 | `FORBIDDEN` | A super-admin route called by someone else |
| 404 | `STORE_NOT_FOUND` | No store with that slug |
| 404 | `USER_NOT_FOUND` | Store users: the uid isn't a login of that store |
| 409 | `STORE_TAKEN` / `EMAIL_TAKEN` | Registration: the store name or the email is already used |
| 403 | `USER_DISABLED` | The account is disabled in Firebase Auth |
| 429 | `TOO_MANY_ATTEMPTS` | Firebase rate-limited this account |
| 422 | `NOT_DETECTED` | Photo detection couldn't identify the product (or the model declined) |
| 429 | `RATE_LIMITED` | Too many photo detections at once (Anthropic rate limit) |
| 502 | `DETECT_FAILED` | The Claude API couldn't be reached. Check CloudWatch logs |
| 503 | `NOT_CONFIGURED` | `ANTHROPIC_API_KEY` is missing or invalid |
| 500/502 | `INTERNAL` / `AUTH_PROVIDER_ERROR` | Check CloudWatch logs for the Lambda |

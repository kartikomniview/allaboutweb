# backend-api — Admin API (Firebase Auth + Firestore on AWS Lambda)

This is the backend for the `/admin` panel on the website: the admin login, the e-catalog product manager, and product image uploads to S3. It runs as one Node.js Lambda function behind an API Gateway HTTP API.

| Route | Purpose |
| --- | --- |
| `POST /auth/login` | Body `{ email, password, deviceId }`. Checks the credentials with Firebase Auth, applies the one-device rule, and returns `{ token, expiresAt, user }` |
| `GET /auth/session` | Headers `Authorization: Bearer <token>` and `X-Device-Id`. Returns `{ user, expiresAt }`, or 401 |
| `POST /auth/logout` | Header `Authorization: Bearer <token>`. Deletes the session |
| `GET /catalog/products` | **Public, no login.** Lists the published products (`isActive: true`) as `{ products }`, without `createdAt`/`updatedAt`. The website's e-catalog page reads this |
| `GET /products` | Lists all products as `{ products }` |
| `POST /products` | Body is one product. Creates it with an auto id and returns `{ product }` |
| `POST /products/import` | Body `{ products: [{ id, ...product }] }`. Creates products with fixed ids and skips ids that already exist. Returns `{ created, skipped }` |
| `PUT /products/{id}` | Body is the full product. Replaces its fields and returns `{ product }` |
| `DELETE /products/{id}` | Deletes the product and its images in S3 |
| `POST /products/uploads` | Body `{ categoryName, subcategoryName, productName, files: [{ contentType, size }] }`. Returns `{ uploads: [{ uploadUrl, fields, publicUrl }] }`, one signed S3 upload form per file. The browser then uploads each file straight to S3 |
| `POST /products/uploads/discard` | Body `{ urls }`. Deletes images that were uploaded but never saved to a product (for example when the editor is cancelled) |

Every `/products` route needs a logged-in admin: the same `Authorization: Bearer <token>` and `X-Device-Id` headers as `GET /auth/session`. `GET /catalog/products` is the only product route that is public.

## How the one-device rule works

- The browser creates a random device ID once and keeps it in `localStorage` under `aaw_device_id`.
- The first successful login saves that ID in Firestore at `users/{uid}.deviceId`.
- A login from any other device then gets **403 `DEVICE_LOCKED` "Logged in into another device"**.
- Logging out ends the session but **does not** remove the device binding.
- If someone clears the browser's site data or switches browsers, that counts as a new device. You then have to reset the user by hand (step 8).

Firestore layout:

```
users/{uid}        { email, deviceId, deviceBoundAt, lastLoginAt }
sessions/{sha256}  { uid, email, deviceId, createdAt, expiresAt }   // doc id = SHA-256 of the token
products/{id}      { productName, categoryName, subcategoryName, price, originalPrice,
                     tags[], rating, reviewCount, colors[{ name, hex }], material,
                     dimensions, woodType, stockStatus, description, highlights[],
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

### 8. Reset a user's device (manual)

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

---

## Error codes returned by the API

| Status | `code` | When |
| --- | --- | --- |
| 400 | `BAD_REQUEST` | Missing or invalid email, password, deviceId or product field, or a body that isn't valid JSON |
| 401 | `INVALID_CREDENTIALS` | Wrong email or password |
| 401 | `NO_SESSION` / `SESSION_INVALID` / `SESSION_EXPIRED` / `DEVICE_RESET` | Session check failed |
| 404 | `NOT_FOUND` | Unknown route, or the product id does not exist |
| 403 | `DEVICE_LOCKED` | The user is bound to a different device ("Logged in into another device") |
| 403 | `USER_DISABLED` | The account is disabled in Firebase Auth |
| 429 | `TOO_MANY_ATTEMPTS` | Firebase rate-limited this account |
| 500/502 | `INTERNAL` / `AUTH_PROVIDER_ERROR` | Check CloudWatch logs for the Lambda |

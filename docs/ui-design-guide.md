# Catalog24 UI design guide

The design language of the store-owner screens. The reference implementation is the login and registration pages:

- [`src/components/admin/AuthLayout.tsx`](../src/components/admin/AuthLayout.tsx): layout and shared classes
- [`src/components/admin/ripple.ts`](../src/components/admin/ripple.ts): tap feedback
- [`src/components/admin/admin.css`](../src/components/admin/admin.css): animations
- [`src/app/admin/page.tsx`](../src/app/admin/page.tsx): login
- [`src/app/admin/register/page.tsx`](../src/app/admin/register/page.tsx): registration
- [`src/components/admin/BusinessTypePicker.tsx`](../src/components/admin/BusinessTypePicker.tsx): option cards

Use this guide when you build or improve any other admin page.

- **Already follow it:** the dashboard, the products page (`/admin/ecatalog`), and "Add product", which is its own full-screen route (`/admin/ecatalog/new`; the step-by-step flow in [`ProductFormDrawer.tsx`](../src/components/admin/ecatalog/ProductFormDrawer.tsx) with `layout="page"`).
- **Not yet:** the full edit form (the drawer for existing products) and Store settings. See [Bringing an existing page in line](#bringing-an-existing-page-in-line).
- **Full-screen routes:** add a focused flow to `FOCUS_ROUTES` in [`AdminShell.tsx`](../src/components/admin/AdminShell.tsx) so it renders without the sidebar and top bar.

## The live catalog (public store pages)

The store pages (`src/components/furniture-catalog/`) use the same corners and layout rules with a **neutral black & white** palette, so product photos stand out:

- **Text:** `neutral-900`.
- **Main buttons and active states:** `neutral-900` / `#111111`.
- **Surfaces:** `white`, `neutral-100` and `neutral-200`.
- **Borders:** `neutral-200`.
- **Orange (`text-primary`):** only for small labels, such as the store tagline, a product's subcategory and "Search results".
- **WhatsApp buttons:** keep WhatsApp green.
- **Furniture placeholder drawings:** keep their wood colours.
- **Subcategory chips:** never solid black, because their photos blend into the chip colour (`mix-blend-multiply`). The selected chip is a shade darker (`neutral-200`) with a check badge; selected items have no border.

## Principles

1. **Mobile first.** Most store owners use a phone. Design at 360–430px wide first, then let the layout grow.
2. **Feels like an app.** Phones get full-screen screens, a top bar, a pinned main action and native-feeling feedback. Desktop gets the same content in a centred white card.
3. **Minimal and professional.** Use white surfaces, thin borders, small corners, one accent colour and no decoration that doesn't help the task.
4. **One clear action per screen.** It is a filled dark button, full width on phones. Everything else is secondary.
5. **Quiet, quick motion.** Motion confirms what happened, in 300ms or less, and turns off for "reduce motion".

## Tokens

Defined in [`src/app/globals.css`](../src/app/globals.css) (`@theme`). Use the token classes, never one-off hex values.

| Use | Class | Value |
|---|---|---|
| Text, headings | `text-ink` | `#01123c` |
| Secondary text | `text-slate` | `#5b6270` |
| Borders, dividers | `border-line` / `bg-line` | `#e3e6ee` |
| Page background (desktop), subtle fills | `bg-paper` | `#f6f7fb` |
| Surfaces | `bg-white` | |
| Main button | `bg-button`, `hover:bg-button-hover` | `#143e3b` / `#0d2b29` |
| Accent: links, focus, selection, progress | `text-primary`, `border-primary`, `bg-primary` | `#fc6c26` |
| Selected-card fill | `bg-tint/60` | `#fff0e8` |
| Error | `text-red-600`, `border-red-500`, `bg-red-50` | |
| Success | `text-emerald-600`/`700`, `bg-emerald-50` | |

### Corners (keep them small)

| Element | Class | Radius |
|---|---|---|
| Inputs, buttons, option cards, info boxes, alerts | `rounded-md` | 6px |
| Desktop card / panel | `rounded-lg` | 8px |
| Checkbox | `rounded-sm` | |
| Round only: icon buttons, badges, progress bars, avatars | `rounded-full` | |

Don't use `rounded-xl`/`2xl`/`3xl`, `rounded-btn` (10px), `rounded-card` (16px) or `rounded-panel` (24px) on new work. Those belong to the marketing site.

### Type

| Use | Classes |
|---|---|
| Screen title | `text-[1.375rem] font-bold leading-tight tracking-[-0.025em] text-ink` |
| Subtitle / help | `text-sm leading-relaxed text-slate` |
| Field label | `text-[13px] font-semibold text-ink` (`authLabelClass`) |
| Input text | `text-base` (16px, so iOS doesn't zoom on focus; never smaller on inputs) |
| Button | `text-[15px] font-semibold` |
| Small print | `text-xs` / `text-[11px] text-slate/80` |
| Field error | `text-[13px] font-medium text-red-600` (`authFieldErrorClass`) |

Titles are **left-aligned** (the app convention); only small print and the links under a button are centred.

### Spacing and sizes

- **Screen padding:** `px-5` on phones, `px-8` inside the desktop card.
- **Gaps:** 20px between fields (`gap-5`), 24px under the title block (`mb-6`).
- **Control height:** 48px for inputs and buttons (`h-12`).
- **Touch targets:** at least 44×44px (`h-11 w-11`) for icon buttons, checkbox rows and anything tappable.
- **Desktop card width:** `max-w-[420px]` for forms. A wider page can use more, but keep forms in one narrow column.

### Elevation

Use borders first and shadows rarely:
- **Cards:** `border border-line` plus a soft shadow on desktop only (see `AuthLayout`).
- **Pinned bars:** `border-t border-line bg-white/95 backdrop-blur`.
- **Never** use heavy drop shadows or dark gradient headers.

## Layout patterns

### Full-screen form screen (login, register, single-task flows)

Use `AuthLayout`. Its phone and desktop variants:

```
Phone (< 640px)                      Desktop (sm+)
┌───────────────────────┐            grey page
│ ←    [C] Catalog24     │ top bar      [C] Catalog24
│ ▬▬▬▬▬▬░░░░░░ Step 2/3  │ progress   ┌───────────────┐
│ Title                  │            │ ▬▬▬░░ Step 2/3 │
│ Subtitle               │            │ Title          │
│ [ field ]              │            │ [ field ]      │
│ [ field ]              │            │ [← ][Continue] │
│                        │            │ link           │
│ ────────────────────── │ pinned     └───────────────┘
│ [      Continue      ] │
│ link · small print     │
└───────────────────────┘
```

```tsx
<AuthLayout title="…" subtitle="…" progress={<AuthProgress current={i} total={3} />} onBack={…}>
  <form onSubmit={…} noValidate className={authFormClass}>
    {/* fields, in <div className="flex flex-col gap-5"> */}
    <AuthActions>
      {/* server error alert, main button, link, small print */}
    </AuthActions>
  </form>
</AuthLayout>
```

- **`AuthActions`** pins the buttons to the bottom on phones (safe-area aware) and puts them at the end of the card on desktop.
- **The back arrow** goes in the top bar on phones (`onBack`) and in `AuthActions` beside the main button on desktop (`hidden sm:inline-flex`).
- **Viewport:** [`src/app/admin/layout.tsx`](../src/app/admin/layout.tsx) sets `interactiveWidget: "resizes-content"`, so the pinned bar rides above the Android keyboard.

### Panel pages (dashboard, products, settings): the target for the redesign

- **Phones and tablets:** a white page with a sticky top bar (title, plus a back arrow or menu) and content in full-width sections divided by `border-line`.
- **Bottom tabs (below `lg`):** `MobileTabBar` in [`AdminShell.tsx`](../src/components/admin/AdminShell.tsx) is fixed at the bottom: Home, Products, a raised **Add** button in the middle (Add product), Settings, and Stores for super admins. The shell pads the page bottom so content clears it. Don't add another pinned bar for "Add product". Anything else fixed to the bottom (toasts, a page's own pinned "Save changes") sits above it: `bottom-[calc(5rem+env(safe-area-inset-bottom))]`. Full-screen flows (`FOCUS_ROUTES`) have no tabs.
- **Desktop:** the existing side navigation, with content in white `rounded-lg border border-line` cards on `bg-paper`.
- **Lists:** rows with a 44px or taller hit area, a thumbnail on the left, text in the middle, and an action or chevron on the right.

## Components

Import the shared classes from `@/components/admin/AuthLayout`. Don't restyle each control by hand.

| Export | What it is |
|---|---|
| `authInputClass` | 48px input, 6px corners, a primary focus ring, red when `aria-invalid`. Leaves room for a left icon. |
| `authInputIconClass` | An 18px icon inside an input (put the input in a `relative` wrapper) |
| `authLabelClass` | Field label |
| `authFieldErrorClass` | Error text under a field (fades in) |
| `authButtonClass` | Main action: filled dark green, full width, ripple-ready |
| `authSecondaryButtonClass` | Outline button (Back, Cancel) |
| `authFormClass` | The `<form>` that fills the screen so `AuthActions` can sit at the bottom |
| `AuthLayout`, `AuthActions`, `AuthProgress`, `AuthLoading`, `BrandMark` | Layout pieces |

### Field

```tsx
<div data-field>
  <label htmlFor="x" className={authLabelClass}>Email address</label>
  <div className="relative">
    <Mail className={authInputIconClass} aria-hidden />
    <input id="x" ref={ref} className={authInputClass}
      aria-invalid={!!err} aria-describedby={err ? "x-error" : undefined} … />
  </div>
  {err && <p id="x-error" className={authFieldErrorClass}>{err}</p>}
</div>
```

`data-field` marks the box that shakes when the field has a problem (see `flagField`).

### Buttons

- **Main:** `className={authButtonClass}` with `onPointerDown={ripple}`. While it works, show a spinner and a verb ("Logging in…") and keep the same width.
- **Disabled:** only while the action can't run yet (submitting, or waiting for a check). Otherwise keep it enabled and explain the problem under the field when tapped.
- **Icon buttons:** `relative grid h-11 w-11 place-items-center overflow-hidden rounded-full`, with an `aria-label`.

### Option cards (multi-select choices)

Follow `BusinessTypePicker`:
- A grid of cards, 3 per row on phones.
- The icon sits in a 44px `rounded-md` tile above a 12.5px semibold label.
- **Selected:** `border-primary bg-tint/60 ring-1 ring-inset ring-primary`, the icon turns primary, and a check badge pops in (`admin-pop-check`).
- **Tap:** a ripple and `hapticTick()`.

### Progress (multi-step flows)

`<AuthProgress current total label />` shows a segmented bar that fills as you go, plus "Step 2 of 3 · Label". Keep flows to 3 or 4 steps, one topic each.

### Alerts

Show a server or general error above the main button, inside `AuthActions`:
`rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700`, with a `TriangleAlert` icon and `role="alert"`.

### Loading

- **Whole-screen check (session):** `<AuthLoading label="…" />`.
- **Inside a page:** `Skeleton` from `@/components/admin/ui`, not spinners, for content that is loading.

### Icons

- **Library:** lucide-react, 18px in inputs and buttons, 24px in option cards, `strokeWidth` 1.75 to 2.
- **Custom icons** (no lucide equivalent): draw them on the 24px grid with `createLucideIcon` in `src/components/icons/`. See `FabricRollIcon.ts` and `FloorTilesIcon.ts`.
- **Category icons:** render them with `<CategoryIcon category=… />`. Calling `categoryIcon()` during render breaks the React lint rule.

## Motion

All motion lives in `admin.css`. The global `prefers-reduced-motion` rule in `globals.css` disables it, and the helpers in `ripple.ts` also skip when reduced motion is on.

| Effect | How | Duration |
|---|---|---|
| Tap ripple | `onPointerDown={ripple}`; the host needs `relative overflow-hidden` | 450ms |
| Press | `active:scale-[0.98]` (cards `0.97`) | 150ms |
| Screen enter | `admin-fade-in` / `admin-pop-in` | 200–220ms |
| Step forward / back | `admin-step-in-right` / `admin-step-in-left` (via `AuthLayout` `contentKey` + `contentClassName`) | 220ms |
| Field problem | `flagField(inputEl)`: focus plus `admin-shake` | 300ms |
| Confirmation tick | `admin-pop-check` | 240ms |
| Selection haptic | `hapticTick()` (Android; iOS ignores it) | 8ms |

Don't add looping, parallax or decorative animation.

## Forms: behaviour rules

- **When to validate:** on submit or Continue. Show the message **under the field**, focus and shake the first bad field, and clear its message as the user types.
- **Messages:** short, human and specific ("Use at least 6 characters.", "The passwords don't match.").
- **Server errors** that belong to a field (e.g. `EMAIL_TAKEN`) go under that field. The rest go in the alert above the button.
- **Phone keyboard attributes on every input:**
  - `type` / `inputMode`: `email`, `tel`, `numeric`.
  - `autoComplete`: `username`, `current-password`, `new-password`, `organization`, `tel`.
  - `enterKeyHint`: `next` between fields, `go` or `done` on the last.
  - `autoCapitalize`: `none` for email and passwords, `words` for names.
  - `spellCheck={false}` for email and passwords.
- **Passwords:** a show/hide eye (a 44px button) and a strength bar on new passwords.
- **Multi-step flows:** each step does `history.pushState`, and a `popstate` listener goes back a step, so the phone's back button or gesture works. Earlier input is kept, and the next step can only be reached through valid earlier steps.
- **After success:** a brief confirmation (a tick plus one line, about 700ms), then navigate.

## Accessibility

- **Labels:** every input has a `<label>`. Errors are linked with `aria-describedby` and marked `aria-invalid`.
- **Icon-only buttons** have an `aria-label`. Toggles use `aria-pressed`.
- **Focus:** visible, using the control's own `ring`. Controls with their own ring add `focus-visible:outline-none!`, because the global `:focus-visible` outline in `globals.css` is unlayered and would stack on top.
- **Live regions:** use `aria-live="polite"` for live statuses (e.g. "Available / Taken"), `role="alert"` for errors and `role="status"` for loading.
- **Contrast:** body text uses `text-ink` or `text-slate` on white. Don't use `text-slate/60` for anything users must read.

## Bringing an existing page in line

1. **Corners:** swap `rounded-xl`/`2xl`/`btn`/`card` for `rounded-md` (controls) and `rounded-lg` (cards).
2. **Controls:** use the shared `auth*` classes, or panel equivalents built the same way: 48px height, 16px input text and a primary focus ring.
3. **Feedback:** add `onPointerDown={ripple}` and `relative overflow-hidden` to buttons and tappable cards.
4. **Phones:** a sticky top bar, and the page's main action pinned at the bottom (safe-area padding).
5. **Errors:** move them under their fields and use `flagField` on submit.
6. **Inputs:** add the keyboard attributes from [Forms](#forms-behaviour-rules).
7. **Touch:** check that every tap target is at least 44px.
8. **Verify** (below).

## Verifying a page

- **Static checks:** `npx tsc --noEmit -p .`, `npx eslint src` and `npx next build`.
- **Screenshots:** headless Edge against the dev server, for example:
  ```
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless=new --disable-gpu --hide-scrollbars \
    --virtual-time-budget=15000 --window-size=500,900 --screenshot="C:/path/out.png" \
    "http://catalog24.localhost:3000/register"
  ```
  - Headless Edge can't go narrower than 496px, so use 500px as the "phone" shot and 1280×800 for desktop.
  - Use forward slashes in `--screenshot` paths in Git Bash.
- **On a real phone:** check the keyboard (Next/Go keys, the pinned button above the keyboard), the back gesture, the ripple and the shake.

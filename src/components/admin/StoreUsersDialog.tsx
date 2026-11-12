"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff, Lock, MonitorSmartphone, RotateCcw, Trash2, TriangleAlert, UserPlus, UserRound, X } from "lucide-react";
import { useAdminUser } from "./AdminShell";
import {
  authFieldErrorClass,
  authInputClass,
  authInputIconClass,
  authLabelClass,
} from "./AuthLayout";
import ConfirmDialog from "./ecatalog/ConfirmDialog";
import { useOverlay } from "./ecatalog/useOverlay";
import PasswordStrength from "./PasswordStrength";
import { flagField, ripple } from "./ripple";
import { Badge, Button, Skeleton, formatRelative } from "./ui";
import { AuthError, LOGIN_DOMAIN, USERNAME_RE, cleanUsername, loginNameOf, toLoginEmail } from "@/lib/adminAuth";
import {
  addStoreUser,
  listStoreUsers,
  removeStoreUser,
  resetUserDevice,
  type ManagedStore,
  type StoreUser,
} from "@/lib/adminStores";

type Pending = { kind: "reset" | "remove"; user: StoreUser };

const message = (err: unknown, fallback: string) => (err instanceof AuthError ? err.message : fallback);

// Super admins: a store's logins. Reset a login's device lock, add another login
// with the owner's access, or remove an extra one. A bottom sheet on phones.
export default function StoreUsersDialog({
  store,
  onClose,
  onToast,
  onCountChange,
}: {
  store: ManagedStore;
  onClose: () => void;
  onToast: (text: string, tone?: "ok" | "error") => void;
  onCountChange: (count: number) => void;
}) {
  const me = useAdminUser();
  const router = useRouter();
  const [users, setUsers] = useState<StoreUser[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [pendingBusy, setPendingBusy] = useState(false);
  const [pendingError, setPendingError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  // Escape closes only the top overlay, so an open confirm dialog closes first.
  const panelRef = useOverlay<HTMLDivElement>(onClose, pendingBusy);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      setUsers(await listStoreUsers(store.slug));
    } catch (err) {
      setLoadError(message(err, "Couldn't load the users."));
    }
  }, [store.slug]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data fetch
    load();
  }, [load]);

  const setList = (next: StoreUser[]) => {
    setUsers(next);
    onCountChange(next.length);
  };

  async function confirmPending() {
    if (!pending || !users) return;
    const { kind, user } = pending;
    setPendingBusy(true);
    setPendingError(null);
    try {
      if (kind === "reset") {
        const saved = await resetUserDevice(store.slug, user.uid);
        // Your own device: this session has just ended.
        if (user.uid === me.uid) {
          router.replace("/admin");
          return;
        }
        setUsers(users.map((u) => (u.uid === saved.uid ? saved : u)));
        onToast(`${loginNameOf(user.email)} can log in on a new device`);
      } else {
        await removeStoreUser(store.slug, user.uid);
        setList(users.filter((u) => u.uid !== user.uid));
        onToast(`${loginNameOf(user.email)} removed`);
      }
      setPending(null);
    } catch (err) {
      setPendingError(message(err, kind === "reset" ? "Couldn't reset the device." : "Couldn't remove the user."));
    } finally {
      setPendingBusy(false);
    }
  }

  return (
    <div
      className="admin-fade-in fixed inset-0 z-[105] flex items-end justify-center bg-ink/40 backdrop-blur-[2px] sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pendingBusy) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-users-title"
        tabIndex={-1}
        className="admin-pop-in flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-panel bg-white shadow-2xl focus:outline-none sm:max-w-lg sm:rounded-card"
      >
        <header className="flex items-start gap-3 border-b border-line px-5 pt-4 pb-3.5">
          <div className="min-w-0 flex-1">
            <h2 id="store-users-title" className="truncate text-base font-semibold text-ink">
              Users · {store.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate">Each login works on one device. All have the owner&apos;s access.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            onPointerDown={ripple}
            aria-label="Close"
            className="relative -mr-2 -mt-1 grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-slate transition-colors hover:bg-ink/[0.05] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
          {loadError ? (
            <div className="flex flex-col items-center gap-3 px-5 py-8 text-center">
              <TriangleAlert className="h-6 w-6 text-red-600" aria-hidden />
              <p className="text-sm text-slate">{loadError}</p>
              <Button onClick={load}>Try again</Button>
            </div>
          ) : users === null ? (
            <ul className="divide-y divide-line" aria-label="Loading users">
              {[0, 1].map((i) => (
                <li key={i} className="flex items-center gap-3 px-5 py-3.5">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-line">
              {users.length === 0 && <li className="px-5 py-6 text-center text-sm text-slate">No logins yet.</li>}
              {users.map((user) => (
                <UserRow
                  key={user.uid}
                  user={user}
                  isMe={user.uid === me.uid}
                  onReset={() => {
                    setPendingError(null);
                    setPending({ kind: "reset", user });
                  }}
                  onRemove={() => {
                    setPendingError(null);
                    setPending({ kind: "remove", user });
                  }}
                />
              ))}
            </ul>
          )}

          {users !== null && (
            <div className="border-t border-line px-5 py-4">
              {adding ? (
                <AddUserForm
                  slug={store.slug}
                  onCancel={() => setAdding(false)}
                  onAdded={(user) => {
                    setList([...users, user]);
                    setAdding(false);
                    onToast(`${loginNameOf(user.email)} added to ${store.name}`);
                  }}
                />
              ) : (
                <Button onClick={() => setAdding(true)} className="h-11 w-full">
                  <UserPlus className="h-[18px] w-[18px]" aria-hidden />
                  Add user
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {pending && (
        <ConfirmDialog
          title={
            pending.kind === "reset"
              ? `Reset device for ${loginNameOf(pending.user.email)}?`
              : `Remove ${loginNameOf(pending.user.email)}?`
          }
          confirmLabel={pending.kind === "reset" ? "Reset device" : "Remove"}
          busy={pendingBusy}
          error={pendingError}
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
        >
          {pending.kind === "reset" ? (
            pending.user.uid === me.uid ? (
              <>This is your own login: you&apos;ll be logged out here, and the next device you log in on becomes yours.</>
            ) : (
              <>They&apos;re logged out now, and the next device they log in on becomes their device.</>
            )
          ) : (
            <>This login is deleted and logged out everywhere. The store and its products stay as they are.</>
          )}
        </ConfirmDialog>
      )}
    </div>
  );
}

function UserRow({
  user,
  isMe,
  onReset,
  onRemove,
}: {
  user: StoreUser;
  isMe: boolean;
  onReset: () => void;
  onRemove: () => void;
}) {
  const name = loginNameOf(user.email);
  const lastLogin = user.lastLoginAt ? `last login ${formatRelative(user.lastLoginAt).toLowerCase()}` : "never logged in";

  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tint text-sm font-bold uppercase text-primary"
        aria-hidden
      >
        {name.charAt(0) || "U"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-[14px] font-semibold text-ink" title={user.email}>
            {name}
          </p>
          {user.isOwner && <Badge tone="neutral">Owner</Badge>}
          {isMe && <Badge tone="neutral">You</Badge>}
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate">
          <MonitorSmartphone className={`h-3.5 w-3.5 shrink-0 ${user.deviceBound ? "text-emerald-600" : ""}`} aria-hidden />
          <span className="truncate">
            {user.deviceBound ? "Locked to a device" : "No device yet"} · {lastLogin}
          </span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {user.deviceBound && (
          <Button onClick={onReset} className="h-11 px-3" aria-label={`Reset device for ${name}`}>
            <RotateCcw className="h-4 w-4" aria-hidden />
            <span className="hidden min-[400px]:inline">Reset device</span>
          </Button>
        )}
        {!user.isOwner && !isMe && (
          <Button variant="danger-ghost" size="icon" onClick={onRemove} aria-label={`Remove ${name}`} title="Remove" className="h-11 w-11">
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        )}
      </div>
    </li>
  );
}

type Field = "username" | "password";

function AddUserForm({
  slug,
  onAdded,
  onCancel,
}: {
  slug: string;
  onAdded: (user: StoreUser) => void;
  onCancel: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Shown by default: the admin passes it on to the new user, and there's no confirm field.
  const [showPassword, setShowPassword] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => usernameRef.current?.focus(), []);

  const clearError = (field: Field) => errors[field] && setErrors((e) => ({ ...e, [field]: undefined }));
  // Anything with an "@" is a full email; otherwise username@catalog24.in.
  const isEmail = username.includes("@");

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!username) next.username = "Choose a username.";
    else if (!isEmail && !USERNAME_RE.test(username)) next.username = "Use 3 to 30 letters, numbers, dots, dashes or underscores.";
    else if (isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) next.username = "Enter a valid email address.";
    if (password.length < 6) next.password = "Use at least 6 characters.";
    setErrors(next);
    setError(null);
    if (next.username) return flagField(usernameRef.current);
    if (next.password) return flagField(passwordRef.current);

    setSaving(true);
    try {
      onAdded(await addStoreUser(slug, { email: toLoginEmail(username), password }));
    } catch (err) {
      setSaving(false);
      if (err instanceof AuthError && err.code === "EMAIL_TAKEN") {
        setErrors({ username: "This username is taken. Try another one." });
        return flagField(usernameRef.current);
      }
      setError(message(err, "Couldn't add the user."));
    }
  }

  return (
    <form onSubmit={submit} noValidate className="admin-fade-in flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink">Add a user</p>

      <div data-field>
        <label htmlFor="new-user-name" className={authLabelClass}>
          Username
        </label>
        <div className="relative">
          <UserRound className={authInputIconClass} aria-hidden />
          <input
            ref={usernameRef}
            id="new-user-name"
            name="new-user-name"
            type="text"
            inputMode="email"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={isEmail ? 120 : 30}
            value={username}
            onChange={(e) => {
              setUsername(cleanUsername(e.target.value));
              clearError("username");
            }}
            aria-invalid={!!errors.username}
            aria-describedby={errors.username ? "new-user-name-error" : "new-user-name-help"}
            className={`${authInputClass} ${isEmail ? "" : "pr-[8.5rem]"}`}
            placeholder="staffname"
          />
          {!isEmail && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-slate">
              @{LOGIN_DOMAIN}
            </span>
          )}
        </div>
        {errors.username ? (
          <p id="new-user-name-error" className={authFieldErrorClass}>
            {errors.username}
          </p>
        ) : (
          <p id="new-user-name-help" className="mt-1.5 text-xs text-slate">
            They log in with <span className="font-semibold text-ink">{username || "staffname"}</span> on the login page.
          </p>
        )}
      </div>

      <div data-field>
        <label htmlFor="new-user-password" className={authLabelClass}>
          Password
        </label>
        <div className="relative">
          <Lock className={authInputIconClass} aria-hidden />
          <input
            ref={passwordRef}
            id="new-user-password"
            name="new-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="done"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError("password");
            }}
            aria-invalid={!!errors.password}
            aria-describedby="new-user-password-help"
            className={`${authInputClass} pr-12`}
            placeholder="At least 6 characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            onPointerDown={ripple}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-0.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center overflow-hidden rounded-md text-slate transition-colors hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-[18px] w-[18px]" aria-hidden /> : <Eye className="h-[18px] w-[18px]" aria-hidden />}
          </button>
        </div>
        <div id="new-user-password-help">
          {errors.password ? (
            <p className={authFieldErrorClass}>{errors.password}</p>
          ) : (
            password && <PasswordStrength password={password} />
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="admin-fade-in flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] font-medium text-red-700"
        >
          <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-2.5">
        <Button onClick={onCancel} disabled={saving} className="h-11 flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving} className="h-11 flex-[2]">
          {saving ? "Adding…" : "Add user"}
        </Button>
      </div>
    </form>
  );
}

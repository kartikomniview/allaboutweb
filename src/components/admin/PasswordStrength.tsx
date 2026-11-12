// The strength bar under a new password (register page, super admins adding a store user).

/** A rough password strength: 0 weak, 1 okay, 2 strong. */
export function passwordStrength(pw: string): 0 | 1 | 2 {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/i.test(pw) && /\d/.test(pw)) score++;
  if (/[^a-z0-9]/i.test(pw) || (/[a-z]/.test(pw) && /[A-Z]/.test(pw))) score++;
  return score >= 4 ? 2 : score >= 2 ? 1 : 0;
}

const STRENGTH = [
  { label: "Weak", bar: "bg-red-500", text: "text-red-600" },
  { label: "Okay", bar: "bg-amber-500", text: "text-amber-700" },
  { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-700" },
] as const;

export default function PasswordStrength({ password }: { password: string }) {
  const strength = passwordStrength(password);
  return (
    <div className="admin-fade-in mt-2 flex items-center gap-2.5">
      <div className="flex flex-1 gap-1" aria-hidden>
        {STRENGTH.map((s, i) => (
          <span
            key={s.label}
            className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength ? STRENGTH[strength].bar : "bg-line"}`}
          />
        ))}
      </div>
      <span className={`w-12 text-right text-xs font-semibold ${STRENGTH[strength].text}`}>{STRENGTH[strength].label}</span>
    </div>
  );
}

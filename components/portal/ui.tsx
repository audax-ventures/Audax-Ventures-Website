import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/portal/types";
import { STATUS_LABELS } from "@/lib/portal/types";

// Shared building blocks for the portal. Colours follow the login screen:
// deep navy for primary actions, Audax blue for accents, soft blue-grey surfaces.

export const brand = {
  navy: "#0F2341",
  navyHover: "#1A3A5C",
  blue: "#2E5F8A",
} as const;

// ----- Layout -----

export function PageHeader({
  title,
  description,
  actions,
  back,
  eyebrow,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  eyebrow?: React.ReactNode;
}) {
  return (
    <div className="mb-7">
      {back ? (
        <Link
          href={back.href}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors hover:text-[#0F2341]"
        >
          <span aria-hidden>←</span> {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#2E5F8A]">{eyebrow}</p>
          ) : null}
          <h1 className="font-heading text-[1.9rem] font-bold leading-tight tracking-tight text-[#0B1B33]">
            {title}
          </h1>
          {description ? <p className="mt-1.5 max-w-2xl text-[0.95rem] text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/80 bg-white/95 shadow-[0_1px_2px_rgba(15,35,65,0.05),0_12px_32px_-14px_rgba(15,35,65,0.16)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  actions,
  description,
  icon: Icon,
}: {
  title: React.ReactNode;
  actions?: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#EEF1F5] px-5 py-4">
      <div className="flex min-w-0 items-start gap-3">
        {Icon ? <IconBadge icon={Icon} /> : null}
        <div className="min-w-0">
          <h2 className="font-heading text-[1.05rem] font-semibold text-[#0B1B33]">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export type IconTone = "blue" | "amber" | "green" | "slate" | "sky" | "violet" | "red";

export function IconBadge({ icon: Icon, tone = "blue", size = "md" }: { icon: LucideIcon; tone?: IconTone; size?: "sm" | "md" | "lg" }) {
  const tones = {
    blue: "bg-gradient-to-br from-[#E6EFFA] to-[#D6E4F5] text-[#1F5A99] ring-1 ring-inset ring-[#C6D8EE]",
    amber: "bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 ring-1 ring-inset ring-amber-200/70",
    green: "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-inset ring-emerald-200/70",
    slate: "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
    sky: "bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 ring-1 ring-inset ring-sky-200/70",
    violet: "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 ring-1 ring-inset ring-violet-200/70",
    red: "bg-gradient-to-br from-red-50 to-red-100 text-red-600 ring-1 ring-inset ring-red-200/70",
  };
  const sizes = { sm: "h-7 w-7 rounded-lg", md: "h-9 w-9 rounded-xl", lg: "h-11 w-11 rounded-xl" };
  const iconSizes = { sm: "h-3.5 w-3.5", md: "h-[18px] w-[18px]", lg: "h-5 w-5" };
  return (
    <span className={cn("flex shrink-0 items-center justify-center", sizes[size], tones[tone])}>
      <Icon className={iconSizes[size]} />
    </span>
  );
}

// ----- Buttons -----

const buttonStyles = {
  primary:
    "bg-gradient-to-b from-[#1E4675] to-[#0F2341] text-white shadow-[0_6px_16px_-6px_rgba(15,35,65,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] hover:from-[#24538A] hover:to-[#14305A] disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none",
  secondary:
    "border border-[#D6E0EC] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,35,65,0.05)] hover:border-[#BFD0E4] hover:bg-[#F7FAFD] disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-[#0F2341] disabled:text-slate-300",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
  success:
    "bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-[0_6px_16px_-6px_rgba(4,120,87,0.55)] hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2E5F8A]/15 disabled:cursor-not-allowed",
    size === "sm" ? "h-8 rounded-lg px-2.5 text-xs" : "h-10 rounded-xl px-4 text-sm",
    buttonStyles[variant],
  );
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: "sm" | "md" }) {
  return <button type="button" {...props} className={cn(buttonClass(variant, size), className)} />;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(buttonClass(variant, size), className)} {...rest}>
      {children}
    </Link>
  );
}

// ----- Forms -----

export const inputClass =
  "block w-full rounded-xl border border-[#D5DCE6] bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-[0_1px_2px_rgba(15,35,65,0.03)] placeholder:text-slate-400 transition-colors focus:border-[#2E5F8A] focus:outline-none focus:ring-4 focus:ring-[#2E5F8A]/10 disabled:bg-slate-50 disabled:text-slate-600";

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("block", className)}>
      <label className="block">
        <span className="mb-1.5 block text-[0.8rem] font-semibold text-slate-700">{label}</span>
        {children}
      </label>
      {hint ? <span className="mt-1.5 block text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
      {message}
    </p>
  );
}

// ----- Status & identity -----

const statusStyles: Record<ReportStatus, { pill: string; dot: string }> = {
  draft: { pill: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  in_review: { pill: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  approved: { pill: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  sent: { pill: "bg-sky-50 text-sky-800", dot: "bg-sky-500" },
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", s.pill)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-600", className)}>
      {children}
    </span>
  );
}

export function ClientLogo({ src, name, size = 36 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data URL logos
      <img
        src={src}
        alt=""
        style={{ width: size, height: size }}
        className="shrink-0 rounded-lg border border-[#E4E9F0] bg-white object-contain p-1"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-lg bg-[#EEF3F9] text-xs font-semibold text-[#2E5F8A]"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function initials(name: string): string {
  const parts = name.trim().split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Avatar({ name, size = 28, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      title={name}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#2E5F8A] to-[#0F2341] font-semibold text-white",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

// ----- Feedback -----

export function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      {Icon ? (
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F0FA] to-[#D5E3F4] text-[#1F5A99] shadow-[0_8px_24px_-10px_rgba(31,90,153,0.45)] ring-8 ring-[#F1F6FC]">
          <Icon className="h-6 w-6" />
        </span>
      ) : null}
      <p className="font-heading text-base font-semibold text-[#0B1B33]">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const tileTones = {
  amber: { bg: "from-white via-white to-amber-50", wave: "#F59E0B", line: "#FCD34D" },
  blue: { bg: "from-white via-white to-[#E8F0FA]", wave: "#2E6FB8", line: "#9DBDE3" },
  green: { bg: "from-white via-white to-emerald-50", wave: "#10B981", line: "#6EE7B7" },
  sky: { bg: "from-white via-white to-sky-50", wave: "#0EA5E9", line: "#7DD3FC" },
  slate: { bg: "from-white via-white to-slate-50", wave: "#64748B", line: "#CBD5E1" },
} as const;

/** A headline number with a label, on a soft tinted card. Text stays in ink colours; colour carries the category. */
export function StatTile({
  label,
  value,
  caption,
  icon,
  tone = "blue",
  href,
}: {
  label: string;
  value: React.ReactNode;
  caption?: React.ReactNode;
  icon: LucideIcon;
  tone?: keyof typeof tileTones;
  href?: string;
}) {
  const t = tileTones[tone];
  const body = (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-2xl border border-white/80 bg-gradient-to-b p-5 pb-10 shadow-[0_1px_2px_rgba(15,35,65,0.05),0_12px_32px_-14px_rgba(15,35,65,0.18)]",
        t.bg,
        href && "transition-all hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,35,65,0.05),0_18px_40px_-16px_rgba(15,35,65,0.28)]",
      )}
    >
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-9 w-full" viewBox="0 0 300 64" preserveAspectRatio="none">
        <path d="M0 40 C 60 20, 120 56, 190 34 C 240 18, 275 26, 300 16 L 300 64 L 0 64 Z" fill={t.wave} fillOpacity="0.07" />
        <path d="M0 52 C 70 34, 130 62, 200 46 C 245 36, 280 40, 300 32 L 300 64 L 0 64 Z" fill={t.wave} fillOpacity="0.06" />
        <path d="M0 40 C 60 20, 120 56, 190 34 C 240 18, 275 26, 300 16" stroke={t.line} strokeOpacity="0.6" strokeWidth="1.2" fill="none" />
      </svg>
      <div className="relative flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <IconBadge icon={icon} tone={tone} />
      </div>
      <p className="relative mt-3 font-heading text-[2.4rem] font-bold leading-none tabular-nums tracking-tight text-[#0B1B33]">{value}</p>
      {caption ? <p className="relative mt-2 text-xs text-slate-500">{caption}</p> : null}
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2E5F8A]/15">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Small uppercase table header cell style. */
export const thClass = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500";

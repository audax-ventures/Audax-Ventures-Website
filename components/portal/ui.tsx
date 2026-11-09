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
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#2E5F8A]">{eyebrow}</p>
          ) : null}
          <h1 className="font-[var(--font-outfit)] text-[1.65rem] font-semibold leading-tight tracking-tight text-[#0F2341]">
            {title}
          </h1>
          {description ? <p className="mt-1.5 max-w-2xl text-sm text-slate-500">{description}</p> : null}
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
        "rounded-2xl border border-[#E4E9F0] bg-white shadow-[0_1px_2px_rgba(15,35,65,0.04),0_4px_16px_-8px_rgba(15,35,65,0.06)]",
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
          <h2 className="text-[0.95rem] font-semibold text-[#0F2341]">{title}</h2>
          {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

export function IconBadge({ icon: Icon, tone = "blue", size = "md" }: { icon: LucideIcon; tone?: "blue" | "amber" | "green" | "slate" | "sky"; size?: "sm" | "md" | "lg" }) {
  const tones = {
    blue: "bg-[#EEF3F9] text-[#2E5F8A]",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-600",
    sky: "bg-sky-50 text-sky-700",
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
  primary: "bg-[#0F2341] text-white shadow-sm hover:bg-[#1A3A5C] disabled:bg-slate-300 disabled:shadow-none",
  secondary:
    "border border-[#D9E0EA] bg-white text-slate-700 shadow-[0_1px_2px_rgba(15,35,65,0.05)] hover:border-slate-300 hover:bg-slate-50 disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-[#0F2341] disabled:text-slate-300",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
  success: "bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 disabled:bg-slate-300",
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
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F1F5FA] text-[#2E5F8A] ring-8 ring-[#F7F9FC]">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-[#0F2341]">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** A headline number with a label. Text stays in ink colours; the icon carries the accent. */
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
  tone?: "blue" | "amber" | "green" | "slate" | "sky";
  href?: string;
}) {
  const body = (
    <Card className={cn("h-full p-5", href && "transition-all hover:-translate-y-px hover:border-[#C9D5E6] hover:shadow-md")}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.8rem] font-medium text-slate-500">{label}</p>
        <IconBadge icon={icon} tone={tone} size="sm" />
      </div>
      <p className="mt-3 font-[var(--font-outfit)] text-3xl font-semibold tabular-nums tracking-tight text-[#0F2341]">{value}</p>
      {caption ? <p className="mt-1 text-xs text-slate-500">{caption}</p> : null}
    </Card>
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

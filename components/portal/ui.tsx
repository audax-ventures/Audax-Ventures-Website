import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReportStatus } from "@/lib/portal/types";
import { STATUS_LABELS } from "@/lib/portal/types";

// Small building blocks shared by the portal pages.

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link href={back.href} className="mb-2 inline-block text-xs font-medium text-slate-500 hover:text-slate-800">
          ← {back.label}
        </Link>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-[var(--font-outfit)] text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-slate-200 bg-white", className)}>{children}</div>;
}

export function CardHeader({ title, actions, description }: { title: React.ReactNode; actions?: React.ReactNode; description?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

const buttonStyles = {
  primary: "bg-[#2E5F8A] text-white hover:bg-[#1A3A5C] disabled:bg-slate-300",
  secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:text-slate-300",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50 disabled:text-red-300",
  success: "bg-emerald-700 text-white hover:bg-emerald-800 disabled:bg-slate-300",
} as const;

export type ButtonVariant = keyof typeof buttonStyles;

export function buttonClass(variant: ButtonVariant = "primary", size: "sm" | "md" = "md") {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed",
    size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
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

export const inputClass =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#2E5F8A] focus:outline-none focus:ring-2 focus:ring-[#2E5F8A]/15 disabled:bg-slate-50 disabled:text-slate-600";

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
        <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
        {children}
      </label>
      {hint ? <span className="mt-1 block text-xs text-slate-500">{hint}</span> : null}
    </div>
  );
}

const statusStyles: Record<ReportStatus, string> = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  in_review: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  sent: "bg-sky-50 text-sky-800 ring-sky-200",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        statusStyles[status],
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm font-medium text-slate-800">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
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
        className="shrink-0 rounded-md border border-slate-200 bg-white object-contain p-0.5"
      />
    );
  }
  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-600"
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function ErrorNote({ message }: { message: string | null | undefined }) {
  if (!message) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

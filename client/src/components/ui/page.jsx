import { cn } from "@/lib/utils";

export function PageShell({ children, className }) {
  return <div className={cn("page-shell", className)}>{children}</div>;
}

export function PageHeader({ children, className }) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-end justify-between gap-4", className)}>
      {children}
    </div>
  );
}

export function PageHeaderMain({ children, className }) {
  return <div className={cn("min-w-0", className)}>{children}</div>;
}

export function PageHeaderActions({ children, className }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 shrink-0", className)}>
      {children}
    </div>
  );
}

export function PageEyebrow({ children }) {
  return <p className="page-eyebrow">{children}</p>;
}

export function PageTitle({ children, className }) {
  return <h1 className={cn("page-title", className)}>{children}</h1>;
}

export function PageDescription({ children, className }) {
  return <p className={cn("page-description", className)}>{children}</p>;
}

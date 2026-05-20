import { cn } from "@/lib/utils";

export function Card({ children, className, ...props }) {
  return (
    <div
      className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, icon: Icon }) {
  return (
    <div className={cn("flex items-center gap-2 min-w-0", className)}>
      {Icon && <Icon size={18} weight="duotone" className="text-teal-600 shrink-0" />}
      <h3 className="font-bold text-slate-900 text-sm tracking-tight truncate">{children}</h3>
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function DashboardPanel({ title, icon: Icon, action, children, className, bodyClassName }) {
  return (
    <Card className={cn("overflow-hidden flex flex-col", className)}>
      <CardHeader>
        <CardTitle icon={Icon}>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardBody className={cn("flex-1", bodyClassName)}>{children}</CardBody>
    </Card>
  );
}

import { cn } from "@/lib/utils";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export function ProfileSectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="flex items-center gap-2 font-bold text-slate-400 text-[10px] uppercase tracking-widest">
      {Icon && <Icon size={18} weight="duotone" className="text-teal-600 shrink-0" />}
      {children}
    </h3>
  );
}

export function ProfileField({ label, children, className }) {
  return (
    <div className={cn("min-w-0", className)}>
      <p className="field-label">{label}</p>
      <div className="field-value mt-1">{children}</div>
    </div>
  );
}

export function ProfileFieldGrid({ children, cols = 2, className }) {
  return (
    <div
      className={cn(
        "grid gap-4",
        cols === 1 && "grid-cols-1",
        cols === 2 && "grid-cols-1 sm:grid-cols-2",
        cols === 3 && "grid-cols-1 sm:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function ProfileCard({ title, icon, children, className, bodyClassName }) {
  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-0 border-b-0">
        <ProfileSectionTitle icon={icon}>{title}</ProfileSectionTitle>
      </CardHeader>
      <CardBody className={cn("pt-4 space-y-5", bodyClassName)}>{children}</CardBody>
    </Card>
  );
}

export function ClinicalTabShell({ title, description, children, action }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500 font-medium mt-0.5">{description}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

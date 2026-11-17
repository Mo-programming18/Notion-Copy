import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[10px] border border-dashed border-border bg-[#fbfbfa] px-6 py-14 text-center",
        className,
      )}
    >
      {icon && <div className="mb-4 text-3xl">{icon}</div>}
      <h3 className="text-[16px] font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-md text-[13px] leading-5 text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

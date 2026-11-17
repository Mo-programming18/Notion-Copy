import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-[4px] bg-[#e9e9e7]", className)} {...props} />;
}

export { Skeleton };

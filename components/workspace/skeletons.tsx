import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
  return (
    <div className="flex h-full w-[260px] shrink-0 flex-col gap-3 border-r border-border bg-sidebar p-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <div className="mt-3 space-y-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className="h-[22px] w-full" />
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[900px] px-14 pb-24 pt-16" aria-label="Loading page" role="status">
      <Skeleton className="mb-10 h-32 w-full rounded-[6px]" />
      <Skeleton className="mb-5 h-10 w-12 rounded-[6px]" />
      <Skeleton className="mb-10 h-11 w-[62%]" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[92%]" />
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="mt-8 h-8 w-[42%]" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[84%]" />
        <Skeleton className="mt-8 h-5 w-[36%]" />
        <Skeleton className="h-5 w-[78%]" />
        <Skeleton className="h-5 w-[65%]" />
      </div>
      <span className="sr-only">Loading page</span>
    </div>
  );
}

export function SubpageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-[1120px] px-6 pb-24 pt-10 sm:px-10"
      aria-label="Loading workspace"
      role="status"
    >
      <Skeleton className="mb-4 h-4 w-32" />
      <Skeleton className="mb-3 h-10 w-[48%]" />
      <Skeleton className="mb-10 h-5 w-[70%]" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-[6px]" />
        ))}
      </div>
      <span className="sr-only">Loading workspace</span>
    </div>
  );
}

export function AssistantSkeleton() {
  return (
    <div className="flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-white" aria-label="Loading assistant" role="status">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Skeleton className="h-5 w-5 rounded-[4px]" />
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="flex-1 space-y-5 p-4">
        <Skeleton className="h-20 w-full rounded-[8px]" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="border-t border-border p-4">
        <Skeleton className="h-20 w-full rounded-[8px]" />
      </div>
    </div>
  );
}

export function AuthSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f7f7f5] px-5 py-10" role="status" aria-label="Loading account pages">
      <div className="w-full max-w-[420px] space-y-3 rounded-[10px] border border-border bg-white p-8 shadow-notion-200">
        <Skeleton className="mx-auto h-8 w-8 rounded-[6px]" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-6 h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="mt-4 h-10 w-full" />
        <span className="sr-only">Loading account pages</span>
      </div>
    </div>
  );
}

export function WorkspaceBootSkeleton() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-white">
      <SidebarSkeleton />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-[45px] items-center gap-3 border-b border-border px-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <PageSkeleton />
      </div>
    </div>
  );
}

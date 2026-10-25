import { Skeleton } from "@/components/ui/skeleton";

const CARDS_PER_COLUMN = 5;

export function KanbanSkeleton() {
  return (
    <div aria-busy="true" className="flex items-start gap-4 overflow-x-auto pb-2">
      {Array.from({ length: 4 }, (_, column) => (
        <div key={column} className="flex min-w-62.5 flex-[1_1_250px] flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <span className="size-2.5 rounded-full bg-zinc-300" aria-hidden="true" />
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="ml-auto h-5.5 w-7 rounded-full" />
          </div>
          <div className="flex h-190 flex-col gap-2.5 overflow-hidden rounded-xl border border-transparent bg-zinc-100 p-3">
            {Array.from({ length: CARDS_PER_COLUMN }, (_, card) => (
              <div
                key={card}
                className="flex flex-col gap-2 rounded-[10px] border border-zinc-200 bg-white p-3"
              >
                <Skeleton className="h-3 w-22.5" />
                <Skeleton className="h-3.5 w-32.5" />
                <Skeleton className="h-3 w-42.5 bg-zinc-100" />
                <Skeleton className="h-3.5 w-18" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

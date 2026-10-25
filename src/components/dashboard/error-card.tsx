import { Button } from "@/components/ui/button";

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-white p-5"
    >
      <p className="text-sm text-red-700">{message}</p>
      <Button
        variant="outline"
        onClick={onRetry}
        className="h-9 rounded-lg border-zinc-300 px-4 text-sm font-medium"
      >
        Reintentar
      </Button>
    </div>
  );
}

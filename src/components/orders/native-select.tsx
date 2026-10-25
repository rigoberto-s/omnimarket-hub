import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type NativeSelectProps = React.ComponentProps<"select"> & { wrapperClassName?: string };

/** <select> nativo con chevron a la derecha (Playwright usa selectOption sobre él). */
export function NativeSelect({ className, wrapperClassName, children, ...props }: NativeSelectProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-lg border border-zinc-300 bg-white pr-9 pl-3 text-sm outline-none",
          "focus-visible:border-indigo-600 focus-visible:ring-3 focus-visible:ring-indigo-600/20",
          "disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-700",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
    </div>
  );
}

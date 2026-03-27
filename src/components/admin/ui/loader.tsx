import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils"; // Assuming utils exists, if not I'll just use clsx/template strings

interface LoaderProps {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 24 }: LoaderProps) {
  return (
    <Loader2 
      className={cn("animate-spin text-slate-400", className)} 
      size={size} 
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-12">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-900 border-t-transparent" />
        </div>
        <p className="animate-pulse text-sm font-medium text-slate-500">Loading your data...</p>
      </div>
    </div>
  );
}

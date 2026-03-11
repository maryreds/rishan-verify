import { ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <div className="flex items-center gap-2 animate-pulse">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold text-foreground">Rishan Verify</span>
      </div>
      <Skeleton className="h-1.5 w-48 rounded-full" />
    </div>
  );
}

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile Not Found</h1>
        <p className="text-muted-foreground mb-6">
          This verification profile doesn&apos;t exist or the candidate hasn&apos;t been
          verified yet.
        </p>
        <Button asChild>
          <Link href="/">Go to Rishan Verify</Link>
        </Button>
      </div>
    </div>
  );
}

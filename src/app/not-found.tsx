import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-fixed text-primary text-2xl font-semibold">
          ?
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Page not found
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The page you&rsquo;re looking for doesn&rsquo;t exist, or the
            verified profile is no longer public.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/employer">Browse candidates</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

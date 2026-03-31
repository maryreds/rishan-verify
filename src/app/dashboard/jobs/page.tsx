import { JobFeedClient } from "@/components/dashboard/job-feed";

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Job Matches</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered job matching based on your skills and experience.
        </p>
      </div>
      <JobFeedClient />
    </div>
  );
}

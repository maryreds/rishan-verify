import { SalaryBenchmark } from "@/components/dashboard/salary-benchmark";

export default function SalaryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Salary Insights</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-powered salary benchmarking based on your skills, experience, and location.
        </p>
      </div>
      <SalaryBenchmark />
    </div>
  );
}

import { BadgeCheck, Clock, XCircle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type VerificationStatus = "unverified" | "pending" | "verified" | "rejected" | "expired";

const statusConfig: Record<
  VerificationStatus,
  { label: string; icon: React.ElementType; className: string; variant?: "outline" | "secondary" | "destructive" }
> = {
  verified: {
    label: "Verified",
    icon: BadgeCheck,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    className: "",
    variant: "destructive",
  },
  unverified: {
    label: "Unverified",
    icon: ShieldCheck,
    className: "",
    variant: "outline",
  },
  expired: {
    label: "Expired",
    icon: Clock,
    className: "",
    variant: "secondary",
  },
};

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
}

export function VerificationBadge({ status, className }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      <Icon className="size-3" />
      {config.label}
    </Badge>
  );
}

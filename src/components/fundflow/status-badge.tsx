import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  accountStatusLabel,
  collectionStatusLabel,
  financialStatusLabel,
  paymentStatusLabel,
  type AccountStatus,
  type CollectionStatus,
  type FinancialStatus,
  type PaymentStatus,
} from "@/lib/fundflow-data";

const badge = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        info: "border-primary/25 bg-primary/10 text-primary",
        success: "border-success/25 bg-success/10 text-success",
        warning: "border-warning/30 bg-warning/15 text-warning-foreground",
        danger: "border-destructive/25 bg-destructive/10 text-destructive",
        gold: "border-gold/40 bg-gold/20 text-gold-foreground",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type Tone = NonNullable<VariantProps<typeof badge>["tone"]>;

function Dot({ tone }: { tone: Tone }) {
  return (
    <span
      className={cn(
        "size-1.5 rounded-full",
        tone === "success" && "bg-success",
        tone === "warning" && "bg-warning",
        tone === "danger" && "bg-destructive",
        tone === "info" && "bg-primary",
        tone === "gold" && "bg-gold",
        tone === "neutral" && "bg-muted-foreground/60",
      )}
    />
  );
}

export function StatusBadge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn(badge({ tone }), className)}>
      <Dot tone={tone} />
      {children}
    </span>
  );
}

const collectionTone: Record<CollectionStatus, Tone> = {
  DRAFT: "neutral",
  OPEN: "success",
  CLOSED: "info",
  ARCHIVED: "neutral",
};

const paymentTone: Record<PaymentStatus, Tone> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
};

const financialTone: Record<FinancialStatus, Tone> = {
  UNPAID: "danger",
  PARTIAL: "warning",
  PAID: "success",
  OVERPAID: "gold",
};

const accountTone: Record<AccountStatus, Tone> = {
  PENDING: "warning",
  ACTIVE: "success",
  DISABLED: "danger",
};

export const CollectionStatusBadge = ({ status }: { status: CollectionStatus }) => (
  <StatusBadge tone={collectionTone[status]}>{collectionStatusLabel[status]}</StatusBadge>
);

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => (
  <StatusBadge tone={paymentTone[status]}>{paymentStatusLabel[status]}</StatusBadge>
);

export const FinancialStatusBadge = ({ status }: { status: FinancialStatus }) => (
  <StatusBadge tone={financialTone[status]}>{financialStatusLabel[status]}</StatusBadge>
);

export const AccountStatusBadge = ({ status }: { status: AccountStatus }) => (
  <StatusBadge tone={accountTone[status]}>{accountStatusLabel[status]}</StatusBadge>
);

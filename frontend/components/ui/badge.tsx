import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border text-xs font-mono tracking-wide transition-colors",
  {
    variants: {
      variant: {
        outline:
          "border-hairline bg-white/[0.03] text-steel-400 px-3 py-1.5",
        solid:
          "border-cyan-accent/30 bg-cyan-accent/10 text-cyan-accent px-3 py-1.5",
        status:
          "border-transparent bg-transparent px-0 py-0 text-status-good",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

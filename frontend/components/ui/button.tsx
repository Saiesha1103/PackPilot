import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-cyan-accent text-base-950 shadow-[0_0_0_1px_rgba(63,198,224,0.4)] hover:bg-[#59D2E8] hover:shadow-[0_0_24px_0_rgba(63,198,224,0.35)] active:translate-y-px",
        secondary:
          "border border-hairline bg-base-800/60 text-steel-300 backdrop-blur-sm hover:border-cyan-accent/40 hover:text-white hover:bg-base-700/60 hover:shadow-[0_0_16px_0_rgba(63,198,224,0.16)] active:translate-y-px",
        ghost:
          "text-steel-400 hover:text-white hover:bg-white/5",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

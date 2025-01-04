import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        create:
          "bg-[#df912b] text-primary-foreground shadow hover:bg-[#df912b]/90",
        submit:
          "bg-[#1cd396] text-primary-foreground shadow hover:bg-[#1cd396]/90",
        edit: "bg-[#fe9e1d] text-primary-foreground shadow hover:bg-[#fe9e1d]/90",
        nav: "bg-[#fd9e1d] text-primary-foreground shadow hover:bg-[#fd9e1d]/90",
        delete:
          "bg-[#da281c] text-primary-foreground shadow hover:bg-[#da281c]/90",
        download:
          "bg-[#c7c940] text-primary-foreground shadow hover:bg-[#c7c940]/90",
        send: "bg-[#e7a7a3] text-primary-foreground shadow hover:bg-[#e7a7a3]/90",
        cancel:
          "bg-[#eb1e28] text-primary-foreground shadow hover:bg-[#eb1e28]/90",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

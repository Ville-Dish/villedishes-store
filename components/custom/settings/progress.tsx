import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

export const SettingsProgress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const getProgressColor = (value: number | undefined) => {
    if (value === undefined) return "bg-[#adadad]";
    if (value < 50) return "bg-[#eb1e28]";
    if (value === 50) return "bg-[#fe9e1d]";
    if (value < 90) return "bg-blue-500";
    if (value < 100) return "bg-blue-500";
    return "bg-[#167a4a]";
  };

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className={cn(
          "h-full w-full flex-1 transition-all",
          getProgressColor(value || 0)
        )}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
SettingsProgress.displayName = ProgressPrimitive.Root.displayName;

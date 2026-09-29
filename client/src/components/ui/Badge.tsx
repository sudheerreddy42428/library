import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-[var(--color-primary-600)] text-white": variant === "default",
          "border-transparent bg-[var(--muted)] text-[var(--muted-foreground)]": variant === "secondary",
          "border-transparent bg-[var(--color-danger-500)] text-white": variant === "destructive",
          "border-transparent bg-[var(--color-success-500)] text-white": variant === "success",
          "border-transparent bg-[var(--color-warning-500)] text-white": variant === "warning",
          "text-[var(--foreground)]": variant === "outline",
        },
        className
      )}
      {...props}
    />
  )
}

export { Badge }

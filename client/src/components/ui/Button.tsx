import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-700)]": variant === "default",
            "bg-[var(--color-danger-500)] text-white hover:bg-[var(--color-danger-600)]": variant === "destructive",
            "border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]": variant === "outline",
            "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--muted)]/80": variant === "secondary",
            "hover:bg-[var(--muted)] hover:text-[var(--foreground)]": variant === "ghost",
            "text-[var(--color-primary-600)] underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

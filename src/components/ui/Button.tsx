"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-primary text-black border-2 border-primary hover:bg-transparent hover:text-primary shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] hover:-translate-y-0.5",
      secondary:
        "bg-secondary text-white border-2 border-secondary hover:bg-transparent hover:text-secondary shadow-[4px_4px_0px_0px_var(--primary)] hover:shadow-[6px_6px_0px_0px_var(--primary)] hover:-translate-y-0.5",
      outline:
        "border-2 border-white/20 text-foreground hover:border-primary hover:text-primary backdrop-blur-sm",
      ghost: "hover:bg-white/5 text-foreground hover:text-primary",
      danger: "bg-red-600 text-white border-2 border-red-600 hover:bg-transparent hover:text-red-500",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-none",
      md: "px-6 py-3 text-sm uppercase tracking-wider font-bold rounded-none",
      lg: "px-8 py-5 text-base uppercase tracking-wider font-bold rounded-none",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          icon && iconPosition === "left" && icon
        )}
        {children}
        {!loading && icon && iconPosition === "right" && icon}
      </button>
    );
  }
);

Button.displayName = "Button";

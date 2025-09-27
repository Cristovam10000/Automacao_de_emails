import React from "react";

const variants = {
  default: "bg-primary text-primary-foreground hover:opacity-90 shadow-corporate",
  outline: "border border-border bg-transparent hover:bg-muted/50",
  ghost: "bg-transparent hover:bg-muted/50",
  link: "bg-transparent underline-offset-4 hover:underline p-0 h-auto",
};

const sizes = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4",
  lg: "h-12 px-6 text-base",
};

export function Button({ as: Comp = "button", className = "", variant = "default", size = "md", ...props }) {
  const cls = [
    "inline-flex items-center justify-center rounded-lg font-medium transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none",
    variants[variant] ?? variants.default,
    sizes[size] ?? sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <Comp className={cls} {...props} />;
}

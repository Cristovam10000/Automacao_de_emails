import React from "react";

const variants = {
  default: "inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground",
  secondary: "inline-flex items-center rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground",
  outline: "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
};

export function Badge({ className = "", variant = "default", ...props }) {
  const cls = [variants[variant] ?? variants.default, className].filter(Boolean).join(" ");
  return <span className={cls} {...props} />;
}

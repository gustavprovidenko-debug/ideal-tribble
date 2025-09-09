
import * as React from "react";
import { cn } from "@/lib/utils";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: "default" | "outline" | "secondary"; size?: "sm" | "md"; }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "md", ...props }, ref) => {
  const base = "inline-flex items-center justify-center rounded-2xl font-medium transition active:scale-[.99]";
  const variants = { default: "bg-black text-white hover:bg-neutral-800", outline: "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50", secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200" }[variant];
  const sizes = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" }[size];
  return <button ref={ref} className={cn(base, variants, sizes, className)} {...props} />;
});
Button.displayName = "Button";

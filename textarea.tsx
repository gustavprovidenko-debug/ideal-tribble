
import * as React from "react";
import { cn } from "@/lib/utils";
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn("w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm outline-none focus:border-neutral-400 min-h-[120px]", className)} {...props} />
));
Textarea.displayName = "Textarea";

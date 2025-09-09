
import * as React from "react";
interface SwitchProps { checked: boolean; onCheckedChange: (checked: boolean) => void; }
export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} className="h-5 w-9 rounded-full bg-neutral-300 checked:bg-black" />;
}

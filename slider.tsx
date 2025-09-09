
import * as React from "react";
interface SliderProps { value: number[]; onValueChange: (value: number[]) => void; min?: number; max?: number; step?: number; }
export function Slider({ value, onValueChange, min = 0, max = 100, step = 1 }: SliderProps) {
  const v = value?.[0] ?? 0;
  return <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => onValueChange([Number(e.target.value)])} className="w-full accent-black" />;
}

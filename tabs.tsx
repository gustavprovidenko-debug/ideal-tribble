
import * as React from "react";
interface TabsProps { value: string; onValueChange: (v: string) => void; className?: string; children: React.ReactNode; }
interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}
interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { value: string; }
const TabsContext = React.createContext<{ value: string; onChange: (v: string) => void } | null>(null);
export function Tabs({ value, onValueChange, className, children }: TabsProps) { return <TabsContext.Provider value={{ value, onChange: onValueChange }}><div className={className}>{children}</div></TabsContext.Provider>; }
export function TabsList({ className, ...props }: TabsListProps) { return <div className={"rounded-xl bg-neutral-100 p-1 " + (className ?? "")} {...props} />; }
export function TabsTrigger({ value, className, ...props }: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext)!; const active = ctx.value === value;
  return <button onClick={() => ctx.onChange(value)} className={(active ? "bg-white shadow" : "") + " text-sm rounded-lg px-3 py-1.5 transition" + (className ? " " + className : "")} {...props} />;
}

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const variants=cva("inline-flex items-center justify-center rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-sky-600 text-white hover:bg-sky-700",outline:"border border-sky-200 bg-white/70 text-sky-900 hover:bg-sky-50",ghost:"hover:bg-sky-100 text-sky-900"},size:{default:"h-10 px-4",sm:"h-9 px-3 text-sm",lg:"h-12 px-6 text-base"}},defaultVariants:{variant:"default",size:"default"}});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,VariantProps<typeof variants>{asChild?:boolean}
export const Button=React.forwardRef<HTMLButtonElement,ButtonProps>(({className,variant,size,asChild=false,...props},ref)=>{const C=asChild?Slot:"button";return <C ref={ref} className={cn(variants({variant,size,className}))} {...props}/>}); Button.displayName="Button";

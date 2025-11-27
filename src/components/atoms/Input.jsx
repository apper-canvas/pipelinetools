import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Input = forwardRef(({ 
  className, 
  type = "text", 
  error = false,
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
        error && "border-red-500 focus:ring-red-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = "Input"

export default Input
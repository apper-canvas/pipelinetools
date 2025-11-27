import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Button = forwardRef(({ 
  className, 
  variant = "default", 
  size = "default", 
  children, 
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
  
  const variants = {
    default: "bg-gradient-to-r from-primary to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500 shadow-lg hover:shadow-xl active:scale-95",
    outline: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-500 shadow-sm hover:shadow-md",
    ghost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-500",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg hover:shadow-xl active:scale-95",
    success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500 shadow-lg hover:shadow-xl active:scale-95"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm h-8",
    default: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12"
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button
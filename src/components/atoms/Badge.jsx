import { cn } from "@/utils/cn"

const Badge = ({ 
  children, 
  variant = "default", 
  size = "default",
  className,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center rounded-full font-medium transition-all duration-200"
  
  const variants = {
    default: "bg-slate-100 text-slate-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    lead: "bg-purple-100 text-purple-800",
    qualified: "bg-blue-100 text-blue-800",
    proposal: "bg-orange-100 text-orange-800",
    negotiation: "bg-yellow-100 text-yellow-800",
    closed: "bg-green-100 text-green-800",
    active: "bg-green-100 text-green-800",
    inactive: "bg-gray-100 text-gray-800",
    prospect: "bg-blue-100 text-blue-800"
  }
  
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base"
  }
  
  return (
    <span
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
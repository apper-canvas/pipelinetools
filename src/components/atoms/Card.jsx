import { forwardRef } from "react"
import { cn } from "@/utils/cn"

const Card = forwardRef(({ 
  className, 
  children, 
  hover = true,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:scale-[1.01]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

Card.displayName = "Card"

export default Card
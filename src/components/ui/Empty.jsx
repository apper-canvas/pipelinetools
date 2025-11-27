import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Empty = ({ 
  title = "No data found", 
  description = "Get started by creating your first item.",
  icon = "Inbox",
  action,
  actionLabel = "Get Started",
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 ${className}`}>
      <div className="flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full">
        <ApperIcon name={icon} size={40} className="text-slate-500" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-600 max-w-md">{description}</p>
      </div>
      
      {action && (
        <Button 
          onClick={action}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>{actionLabel}</span>
        </Button>
      )}
    </div>
  )
}

export default Empty
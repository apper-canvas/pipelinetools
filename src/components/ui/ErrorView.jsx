import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const ErrorView = ({ 
  error = "Something went wrong", 
  onRetry, 
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[400px] text-center space-y-6 ${className}`}>
      <div className="flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
        <ApperIcon name="AlertTriangle" size={40} className="text-red-600" />
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-900">Oops! Something went wrong</h3>
        <p className="text-slate-600 max-w-md">
          {error || "We encountered an error while loading your data. Please try again."}
        </p>
      </div>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" size={16} />
          <span>Try Again</span>
        </Button>
      )}
    </div>
  )
}

export default ErrorView
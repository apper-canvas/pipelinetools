import { useNavigate } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg mx-auto">
          <ApperIcon name="AlertCircle" size={48} className="text-slate-400" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-slate-900">404</h1>
          <h2 className="text-2xl font-semibold text-slate-700">Page Not Found</h2>
          <p className="text-slate-600">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex items-center justify-center space-x-2"
          >
            <ApperIcon name="ArrowLeft" size={20} />
            <span>Go Back</span>
          </Button>
          <Button 
            onClick={() => navigate("/")}
            className="flex items-center justify-center space-x-2"
          >
            <ApperIcon name="Home" size={20} />
            <span>Back to Pipeline</span>
          </Button>
        </div>

        <div className="pt-4">
          <p className="text-sm text-slate-500">
            Need help? Check out your{" "}
            <button
              onClick={() => navigate("/contacts")}
              className="text-primary hover:text-blue-700 underline"
            >
              contacts
            </button>
            {" "}or{" "}
            <button
              onClick={() => navigate("/analytics")}
              className="text-primary hover:text-blue-700 underline"
            >
              analytics
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
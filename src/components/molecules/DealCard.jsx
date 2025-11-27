import { useState } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Badge from "@/components/atoms/Badge"
import Button from "@/components/atoms/Button"

const DealCard = ({ 
  deal, 
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragEnd,
  className = "" 
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStageColor = (stage) => {
    const colors = {
      "Lead": "lead",
      "Qualified": "qualified", 
      "Proposal": "proposal",
      "Negotiation": "negotiation",
      "Closed": "closed"
    }
    return colors[stage] || "default"
  }

  const handleDragStart = (e) => {
    setIsDragging(true)
    if (onDragStart) {
      onDragStart(e, deal)
    }
  }

  const handleDragEnd = (e) => {
    setIsDragging(false)
    if (onDragEnd) {
      onDragEnd(e, deal)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`bg-white rounded-lg border border-slate-200 p-4 cursor-move shadow-sm hover:shadow-md transition-all duration-200 group ${
        isDragging ? "dragging" : ""
      } ${className}`}
    >
      {/* Deal Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
            {deal.title}
          </h4>
          <p className="text-xs text-slate-600">{deal.contactName}</p>
        </div>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (onEdit) onEdit(deal)
            }}
            className="p-1 h-6 w-6"
          >
            <ApperIcon name="Edit2" size={12} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              if (onDelete) onDelete(deal.Id)
            }}
            className="p-1 h-6 w-6 text-red-600 hover:text-red-700"
          >
            <ApperIcon name="Trash2" size={12} />
          </Button>
        </div>
      </div>

      {/* Deal Value */}
      <div className="mb-3">
        <span className="text-lg font-bold text-slate-900">
          {formatCurrency(deal.value)}
        </span>
        <span className="text-xs text-slate-500 ml-2">
          {deal.probability}% probability
        </span>
      </div>

      {/* Stage Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={getStageColor(deal.stage)} size="sm">
          {deal.stage}
        </Badge>
        <span className="text-xs text-slate-500">
          {deal.updatedAt && format(new Date(deal.updatedAt), "MMM d")}
        </span>
      </div>

      {/* Expected Close Date */}
      {deal.expectedCloseDate && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1">
            <ApperIcon name="Calendar" size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              Expected: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>
      )}

      {/* Notes Preview */}
      {deal.notes && (
        <div className="mt-2">
          <p className="text-xs text-slate-600 line-clamp-2">
            {deal.notes}
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default DealCard
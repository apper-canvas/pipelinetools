import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import DealCard from "@/components/molecules/DealCard"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import DealModal from "@/components/organisms/DealModal"
import dealsService from "@/services/api/dealsService"

const PipelineBoard = () => {
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedDeal, setSelectedDeal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [draggedDeal, setDraggedDeal] = useState(null)
  const [dragOverStage, setDragOverStage] = useState(null)

  const stages = [
    { name: "Lead", color: "purple" },
    { name: "Qualified", color: "blue" },
    { name: "Proposal", color: "orange" },
    { name: "Negotiation", color: "yellow" },
    { name: "Closed", color: "green" }
  ]

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await dealsService.getAll()
      setDeals(response)
    } catch (err) {
      setError(err.message || "Failed to load deals")
      toast.error("Failed to load deals")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDeals()
  }, [])

  const getDealsByStage = (stage) => {
    return deals.filter(deal => deal.stage === stage)
  }

  const getStageTotal = (stage) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + deal.value, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleDragStart = (e, deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e, stage) => {
    e.preventDefault()
    setDragOverStage(stage)
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  const handleDrop = async (e, newStage) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedDeal || draggedDeal.stage === newStage) {
      setDraggedDeal(null)
      return
    }

    try {
      const updatedDeal = {
        ...draggedDeal,
        stage: newStage,
        updatedAt: new Date().toISOString()
      }

      await dealsService.update(draggedDeal.Id, updatedDeal)
      
      setDeals(prevDeals =>
        prevDeals.map(deal =>
          deal.Id === draggedDeal.Id ? updatedDeal : deal
        )
      )

      toast.success(`Deal moved to ${newStage}`)
    } catch (err) {
      toast.error("Failed to update deal stage")
    } finally {
      setDraggedDeal(null)
    }
  }

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal)
    setIsModalOpen(true)
  }

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm("Are you sure you want to delete this deal?")) {
      return
    }

    try {
      await dealsService.delete(dealId)
      setDeals(prevDeals => prevDeals.filter(deal => deal.Id !== dealId))
      toast.success("Deal deleted successfully")
    } catch (err) {
      toast.error("Failed to delete deal")
    }
  }

  const handleSaveDeal = async (dealData) => {
    try {
      if (selectedDeal) {
        const updatedDeal = await dealsService.update(selectedDeal.Id, dealData)
        setDeals(prevDeals =>
          prevDeals.map(deal =>
            deal.Id === selectedDeal.Id ? updatedDeal : deal
          )
        )
        toast.success("Deal updated successfully")
      } else {
        const newDeal = await dealsService.create(dealData)
        setDeals(prevDeals => [...prevDeals, newDeal])
        toast.success("Deal created successfully")
      }
      setIsModalOpen(false)
      setSelectedDeal(null)
    } catch (err) {
      toast.error(selectedDeal ? "Failed to update deal" : "Failed to create deal")
    }
  }

  const handleAddDeal = () => {
    setSelectedDeal(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return <Loading type="pipeline" />
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadDeals} />
  }

  if (deals.length === 0) {
    return (
      <Empty
        title="No deals in your pipeline"
        description="Start building your pipeline by creating your first deal."
        icon="BarChart3"
        action={handleAddDeal}
        actionLabel="Create First Deal"
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Sales Pipeline</h1>
            <p className="text-slate-600">Track and manage your deals through each stage</p>
          </div>
          <Button onClick={handleAddDeal} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={20} />
            <span>Add Deal</span>
          </Button>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.name)
            const stageTotal = getStageTotal(stage.name)
            
            return (
              <div key={stage.name} className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">{stage.name}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900">
                  {formatCurrency(stageTotal)}
                </p>
              </div>
            )
          })}
        </div>

        {/* Pipeline Board */}
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {stages.map((stage) => {
            const stageDeals = getDealsByStage(stage.name)
            const isDropTarget = dragOverStage === stage.name
            
            return (
              <div
                key={stage.name}
                className={`flex-shrink-0 w-80 ${isDropTarget ? "drag-over" : ""}`}
                onDragOver={(e) => handleDragOver(e, stage.name)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.name)}
              >
                <div className="bg-white rounded-lg shadow-sm border border-slate-200 h-full">
                  {/* Stage Header */}
                  <div className={`p-4 border-b border-slate-200 bg-gradient-to-r ${
                    stage.color === "purple" ? "from-purple-50 to-purple-100" :
                    stage.color === "blue" ? "from-blue-50 to-blue-100" :
                    stage.color === "orange" ? "from-orange-50 to-orange-100" :
                    stage.color === "yellow" ? "from-yellow-50 to-yellow-100" :
                    "from-green-50 to-green-100"
                  } rounded-t-lg`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900">{stage.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-white bg-opacity-70 text-slate-600 px-2 py-1 rounded-full">
                          {stageDeals.length}
                        </span>
                        <span className="text-sm font-medium text-slate-700">
                          {formatCurrency(getStageTotal(stage.name))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deal Cards */}
                  <div className="p-4 space-y-3 min-h-[400px]">
                    <AnimatePresence>
                      {stageDeals.map((deal) => (
                        <DealCard
                          key={deal.Id}
                          deal={deal}
                          onEdit={handleEditDeal}
                          onDelete={handleDeleteDeal}
                          onDragStart={handleDragStart}
                        />
                      ))}
                    </AnimatePresence>

                    {stageDeals.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <ApperIcon name="Circle" size={32} className="text-slate-300 mb-2" />
                        <p className="text-sm text-slate-500">No deals in {stage.name}</p>
                        <p className="text-xs text-slate-400">Drag deals here or create new ones</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDeal(null)
        }}
        deal={selectedDeal}
        onSave={handleSaveDeal}
      />
    </>
  )
}

export default PipelineBoard
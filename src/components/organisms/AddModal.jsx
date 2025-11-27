import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import contactsService from "@/services/api/contactsService"
import dealsService from "@/services/api/dealsService"

const AddModal = ({ isOpen, onClose, onSuccess }) => {
  const [activeTab, setActiveTab] = useState("contact")
  const [loading, setLoading] = useState(false)
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "Prospect",
    notes: ""
  })
  const [dealData, setDealData] = useState({
    title: "",
    value: "",
    stage: "Lead",
    probability: "25",
    expectedCloseDate: "",
    notes: ""
  })

  const resetForms = () => {
    setContactData({
      name: "",
      email: "",
      phone: "",
      company: "",
      position: "",
      status: "Prospect",
      notes: ""
    })
    setDealData({
      title: "",
      value: "",
      stage: "Lead",
      probability: "25",
      expectedCloseDate: "",
      notes: ""
    })
  }

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newContact = await contactsService.create({
        ...contactData,
        tags: [],
        createdAt: new Date().toISOString(),
        lastContactedAt: null
      })
      
      onSuccess("contact", newContact)
      resetForms()
    } catch (error) {
      console.error("Failed to create contact:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDealSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const newDeal = await dealsService.create({
        ...dealData,
        value: parseFloat(dealData.value) || 0,
        probability: parseInt(dealData.probability) || 0,
        contactId: "1", // Default contact for quick creation
        contactName: "Quick Deal",
        expectedCloseDate: dealData.expectedCloseDate || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      onSuccess("deal", newDeal)
      resetForms()
    } catch (error) {
      console.error("Failed to create deal:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForms()
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">Quick Add</h2>
                  <button
                    onClick={handleClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ApperIcon name="X" size={24} />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => setActiveTab("contact")}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "contact"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Contact
                  </button>
                  <button
                    onClick={() => setActiveTab("deal")}
                    className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === "deal"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Deal
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {activeTab === "contact" ? (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Name *
                      </label>
                      <Input
                        value={contactData.name}
                        onChange={(e) => setContactData({...contactData, name: e.target.value})}
                        placeholder="Enter contact name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={contactData.email}
                        onChange={(e) => setContactData({...contactData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Phone
                      </label>
                      <Input
                        value={contactData.phone}
                        onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Company
                      </label>
                      <Input
                        value={contactData.company}
                        onChange={(e) => setContactData({...contactData, company: e.target.value})}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Position
                      </label>
                      <Input
                        value={contactData.position}
                        onChange={(e) => setContactData({...contactData, position: e.target.value})}
                        placeholder="Enter job title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Status
                      </label>
                      <Select
                        value={contactData.status}
                        onChange={(e) => setContactData({...contactData, status: e.target.value})}
                      >
                        <option value="Prospect">Prospect</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes
                      </label>
                      <Textarea
                        value={contactData.notes}
                        onChange={(e) => setContactData({...contactData, notes: e.target.value})}
                        placeholder="Add any additional notes..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? "Creating..." : "Create Contact"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleDealSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Deal Title *
                      </label>
                      <Input
                        value={dealData.title}
                        onChange={(e) => setDealData({...dealData, title: e.target.value})}
                        placeholder="Enter deal title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Value *
                      </label>
                      <Input
                        type="number"
                        value={dealData.value}
                        onChange={(e) => setDealData({...dealData, value: e.target.value})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stage
                      </label>
                      <Select
                        value={dealData.stage}
                        onChange={(e) => setDealData({...dealData, stage: e.target.value})}
                      >
                        <option value="Lead">Lead</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Proposal">Proposal</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Closed">Closed</option>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Probability (%)
                      </label>
                      <Input
                        type="number"
                        value={dealData.probability}
                        onChange={(e) => setDealData({...dealData, probability: e.target.value})}
                        min="0"
                        max="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Expected Close Date
                      </label>
                      <Input
                        type="date"
                        value={dealData.expectedCloseDate}
                        onChange={(e) => setDealData({...dealData, expectedCloseDate: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Notes
                      </label>
                      <Textarea
                        value={dealData.notes}
                        onChange={(e) => setDealData({...dealData, notes: e.target.value})}
                        placeholder="Add any additional notes..."
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? "Creating..." : "Create Deal"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default AddModal
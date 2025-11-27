import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"
import contactsService from "@/services/api/contactsService"

const DealModal = ({ isOpen, onClose, deal, onSave }) => {
  const [contacts, setContacts] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    value: "",
    contactId: "",
    stage: "Lead",
    probability: "25",
    expectedCloseDate: "",
    notes: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      loadContacts()
    }
  }, [isOpen])

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || "",
        value: deal.value?.toString() || "",
        contactId: deal.contactId || "",
        stage: deal.stage || "Lead",
        probability: deal.probability?.toString() || "25",
        expectedCloseDate: deal.expectedCloseDate || "",
        notes: deal.notes || ""
      })
    } else {
      setFormData({
        title: "",
        value: "",
        contactId: "",
        stage: "Lead",
        probability: "25",
        expectedCloseDate: "",
        notes: ""
      })
    }
    setErrors({})
  }, [deal, isOpen])

  const loadContacts = async () => {
    try {
      const response = await contactsService.getAll()
      setContacts(response)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = "Deal title is required"
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      newErrors.value = "Please enter a valid deal value"
    }
    
    if (!formData.contactId) {
      newErrors.contactId = "Please select a contact"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const selectedContact = contacts.find(c => c.Id === formData.contactId)
      
      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        probability: parseInt(formData.probability),
        contactName: selectedContact ? selectedContact.name : "Unknown",
        expectedCloseDate: formData.expectedCloseDate || null,
        createdAt: deal?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await onSave(dealData)
    } catch (error) {
      console.error("Failed to save deal:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const getProbabilityByStage = (stage) => {
    const stageProbabilities = {
      "Lead": 25,
      "Qualified": 50,
      "Proposal": 75,
      "Negotiation": 90,
      "Closed": 100
    }
    return stageProbabilities[stage] || 25
  }

  const handleStageChange = (newStage) => {
    const newProbability = getProbabilityByStage(newStage)
    setFormData(prev => ({
      ...prev,
      stage: newStage,
      probability: newProbability.toString()
    }))
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
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-900">
                    {deal ? "Edit Deal" : "Add New Deal"}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <ApperIcon name="X" size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900">Deal Information</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Deal Title *
                      </label>
                      <Input
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Enter deal title"
                        error={!!errors.title}
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Deal Value *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-slate-500 sm:text-sm">$</span>
                        </div>
                        <Input
                          type="number"
                          value={formData.value}
                          onChange={(e) => handleInputChange("value", e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="pl-8"
                          error={!!errors.value}
                        />
                      </div>
                      {errors.value && (
                        <p className="mt-1 text-sm text-red-600">{errors.value}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact *
                      </label>
                      <Select
                        value={formData.contactId}
                        onChange={(e) => handleInputChange("contactId", e.target.value)}
                        error={!!errors.contactId}
                      >
                        <option value="">Select a contact</option>
                        {contacts.map((contact) => (
                          <option key={contact.Id} value={contact.Id}>
                            {contact.name} - {contact.company}
                          </option>
                        ))}
                      </Select>
                      {errors.contactId && (
                        <p className="mt-1 text-sm text-red-600">{errors.contactId}</p>
                      )}
                    </div>
                  </div>

                  {/* Stage and Probability */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-900">Deal Progress</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Stage
                      </label>
                      <Select
                        value={formData.stage}
                        onChange={(e) => handleStageChange(e.target.value)}
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
                        Win Probability (%)
                      </label>
                      <Input
                        type="number"
                        value={formData.probability}
                        onChange={(e) => handleInputChange("probability", e.target.value)}
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
                        value={formData.expectedCloseDate}
                        onChange={(e) => handleInputChange("expectedCloseDate", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Add any notes about this deal..."
                      rows={4}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4 border-t border-slate-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className="flex-1"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default DealModal
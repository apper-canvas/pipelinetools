import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Input from "@/components/atoms/Input"
import Select from "@/components/atoms/Select"
import Textarea from "@/components/atoms/Textarea"

const ActivityModal = ({ isOpen, onClose, activity, contacts, onSave }) => {
  const [formData, setFormData] = useState({
    type: "Call",
    contactId: "",
    dealId: "",
    subject: "",
    notes: "",
    date: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const activityTypes = [
    { value: "Call", label: "Phone Call", icon: "Phone" },
    { value: "Email", label: "Email", icon: "Mail" },
    { value: "Meeting", label: "Meeting", icon: "Calendar" },
    { value: "Note", label: "Note", icon: "FileText" }
  ]

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type || "Call",
        contactId: activity.contactId || "",
        dealId: activity.dealId || "",
        subject: activity.subject || "",
        notes: activity.notes || "",
        date: activity.date ? activity.date.substring(0, 16) : ""
      })
    } else {
      // Set current date and time as default
      const now = new Date()
      const localDateTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
      setFormData({
        type: "Call",
        contactId: "",
        dealId: "",
        subject: "",
        notes: "",
        date: localDateTime.toISOString().slice(0, 16)
      })
    }
    setErrors({})
  }, [activity, isOpen])

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.contactId) {
      newErrors.contactId = "Please select a contact"
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "Activity subject is required"
    }
    
    if (!formData.date) {
      newErrors.date = "Please select date and time"
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
      const activityData = {
        ...formData,
        date: new Date(formData.date).toISOString(),
        dealId: formData.dealId || null,
        createdAt: activity?.createdAt || new Date().toISOString()
      }
      
      await onSave(activityData)
    } catch (error) {
      console.error("Failed to save activity:", error)
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

  const getSubjectPlaceholder = (type) => {
    const placeholders = {
      "Call": "e.g., Follow-up call about proposal",
      "Email": "e.g., Sent product information",
      "Meeting": "e.g., Product demo meeting",
      "Note": "e.g., Customer feedback notes"
    }
    return placeholders[type] || "Enter activity subject"
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
                    {activity ? "Edit Activity" : "Log New Activity"}
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
                  {/* Activity Type */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Activity Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {activityTypes.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange("type", type.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                            formData.type === type.value
                              ? "border-primary bg-blue-50 text-primary"
                              : "border-slate-200 hover:border-slate-300 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <ApperIcon name={type.icon} size={18} />
                            <span className="font-medium text-sm">{type.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact Selection */}
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

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => handleInputChange("subject", e.target.value)}
                      placeholder={getSubjectPlaceholder(formData.type)}
                      error={!!errors.subject}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date & Time *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      error={!!errors.date}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Notes
                    </label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Add detailed notes about this activity..."
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
                      {loading ? "Saving..." : activity ? "Update Activity" : "Log Activity"}
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

export default ActivityModal
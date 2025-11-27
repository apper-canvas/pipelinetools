import { useState, useEffect } from "react"
import { format, isToday, isYesterday } from "date-fns"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import Select from "@/components/atoms/Select"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import ActivityModal from "@/components/organisms/ActivityModal"
import activitiesService from "@/services/api/activitiesService"
import contactsService from "@/services/api/contactsService"

const ActivitiesFeed = () => {
  const [activities, setActivities] = useState([])
  const [contacts, setContacts] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [typeFilter, setTypeFilter] = useState("")
  const [contactFilter, setContactFilter] = useState("")

  const activityTypes = [
    { value: "Call", label: "Call", icon: "Phone", color: "blue" },
    { value: "Email", label: "Email", icon: "Mail", color: "green" },
    { value: "Meeting", label: "Meeting", icon: "Calendar", color: "purple" },
    { value: "Note", label: "Note", icon: "FileText", color: "slate" }
  ]

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [activitiesResponse, contactsResponse] = await Promise.all([
        activitiesService.getAll(),
        contactsService.getAll()
      ])
      setActivities(activitiesResponse)
      setContacts(contactsResponse)
      setFilteredActivities(activitiesResponse)
    } catch (err) {
      setError(err.message || "Failed to load activities")
      toast.error("Failed to load activities")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filter activities
  useEffect(() => {
    let filtered = [...activities]

    if (typeFilter) {
      filtered = filtered.filter(activity => activity.type === typeFilter)
    }

    if (contactFilter) {
      filtered = filtered.filter(activity => activity.contactId === contactFilter)
    }

    // Sort by date, newest first
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date))

    setFilteredActivities(filtered)
  }, [activities, typeFilter, contactFilter])

  const getContactName = (contactId) => {
    const contact = contacts.find(c => c.Id === contactId)
    return contact ? contact.name : "Unknown Contact"
  }

  const getActivityTypeConfig = (type) => {
    return activityTypes.find(t => t.value === type) || activityTypes[0]
  }

  const formatActivityDate = (date) => {
    const activityDate = new Date(date)
    
    if (isToday(activityDate)) {
      return `Today at ${format(activityDate, "h:mm a")}`
    } else if (isYesterday(activityDate)) {
      return `Yesterday at ${format(activityDate, "h:mm a")}`
    } else {
      return format(activityDate, "MMM d, yyyy 'at' h:mm a")
    }
  }

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity)
    setIsModalOpen(true)
  }

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) {
      return
    }

    try {
      await activitiesService.delete(activityId)
      setActivities(prevActivities => 
        prevActivities.filter(activity => activity.Id !== activityId)
      )
      toast.success("Activity deleted successfully")
    } catch (err) {
      toast.error("Failed to delete activity")
    }
  }

  const handleSaveActivity = async (activityData) => {
    try {
      if (selectedActivity) {
        const updatedActivity = await activitiesService.update(selectedActivity.Id, activityData)
        setActivities(prevActivities =>
          prevActivities.map(activity =>
            activity.Id === selectedActivity.Id ? updatedActivity : activity
          )
        )
        toast.success("Activity updated successfully")
      } else {
        const newActivity = await activitiesService.create(activityData)
        setActivities(prevActivities => [...prevActivities, newActivity])
        toast.success("Activity logged successfully")
      }
      setIsModalOpen(false)
      setSelectedActivity(null)
    } catch (err) {
      toast.error(selectedActivity ? "Failed to update activity" : "Failed to log activity")
    }
  }

  const handleAddActivity = () => {
    setSelectedActivity(null)
    setIsModalOpen(true)
  }

  if (loading) {
    return <Loading type="cards" />
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />
  }

  if (activities.length === 0) {
    return (
      <Empty
        title="No activities logged yet"
        description="Start tracking your customer interactions by logging your first activity."
        icon="Activity"
        action={handleAddActivity}
        actionLabel="Log First Activity"
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Activities</h1>
            <p className="text-slate-600">Track all customer interactions and communications</p>
          </div>
          <Button onClick={handleAddActivity} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={20} />
            <span>Log Activity</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All activity types</option>
              {activityTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex-1">
            <Select
              value={contactFilter}
              onChange={(e) => setContactFilter(e.target.value)}
            >
              <option value="">All contacts</option>
              {contacts.map((contact) => (
                <option key={contact.Id} value={contact.Id}>
                  {contact.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Activities Feed */}
        <div className="space-y-4">
          {filteredActivities.map((activity) => {
            const typeConfig = getActivityTypeConfig(activity.type)
            
            return (
              <div
                key={activity.Id}
                className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Activity Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      typeConfig.color === "blue" ? "bg-blue-100 text-blue-600" :
                      typeConfig.color === "green" ? "bg-green-100 text-green-600" :
                      typeConfig.color === "purple" ? "bg-purple-100 text-purple-600" :
                      "bg-slate-100 text-slate-600"
                    }`}>
                      <ApperIcon name={typeConfig.icon} size={20} />
                    </div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <Badge 
                          variant={typeConfig.color === "slate" ? "default" : typeConfig.color}
                          size="sm"
                        >
                          {activity.type}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900">
                          {getContactName(activity.contactId)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {formatActivityDate(activity.date)}
                        </span>
                      </div>

                      <h4 className="text-lg font-semibold text-slate-900 mb-2">
                        {activity.subject}
                      </h4>

                      {activity.notes && (
                        <p className="text-slate-600 text-sm leading-relaxed">
                          {activity.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditActivity(activity)}
                      className="p-2"
                    >
                      <ApperIcon name="Edit2" size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteActivity(activity.Id)}
                      className="p-2 text-red-600 hover:text-red-700"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredActivities.length === 0 && (typeFilter || contactFilter) && (
            <div className="text-center py-12">
              <ApperIcon name="Search" size={48} className="text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No activities found</h3>
              <p className="text-slate-600 mb-4">
                No activities match your current filters.
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTypeFilter("")
                    setContactFilter("")
                  }}
                >
                  Clear Filters
                </Button>
                <Button onClick={handleAddActivity}>
                  Log New Activity
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredActivities.length > 0 && (
          <div className="text-center text-sm text-slate-500 py-4 border-t border-slate-200">
            <span>
              Showing {filteredActivities.length} of {activities.length} activities
            </span>
          </div>
        )}
      </div>

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedActivity(null)
        }}
        activity={selectedActivity}
        contacts={contacts}
        onSave={handleSaveActivity}
      />
    </>
  )
}

export default ActivitiesFeed
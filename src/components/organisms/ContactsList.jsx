import { useState, useEffect } from "react"
import { format } from "date-fns"
import { toast } from "react-toastify"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import Badge from "@/components/atoms/Badge"
import SearchBar from "@/components/molecules/SearchBar"
import FilterPanel from "@/components/molecules/FilterPanel"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import ContactModal from "@/components/organisms/ContactModal"
import contactsService from "@/services/api/contactsService"

const ContactsList = () => {
  const [contacts, setContacts] = useState([])
  const [filteredContacts, setFilteredContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({})
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" })

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Prospect", label: "Prospect" }
  ]

  const loadContacts = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await contactsService.getAll()
      setContacts(response)
      setFilteredContacts(response)
    } catch (err) {
      setError(err.message || "Failed to load contacts")
      toast.error("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  // Filter and search contacts
  useEffect(() => {
    let filtered = [...contacts]

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.company.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply filters
    if (filters.status) {
      filtered = filtered.filter(contact => contact.status === filters.status)
    }

    if (filters.tag) {
      filtered = filtered.filter(contact =>
        contact.tags && contact.tags.includes(filters.tag)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })

    setFilteredContacts(filtered)
  }, [contacts, searchTerm, filters, sortConfig])

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc"
    }))
  }

  const handleEditContact = (contact) => {
    setSelectedContact(contact)
    setIsModalOpen(true)
  }

  const handleDeleteContact = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact?")) {
      return
    }

    try {
      await contactsService.delete(contactId)
      setContacts(prevContacts => prevContacts.filter(contact => contact.Id !== contactId))
      toast.success("Contact deleted successfully")
    } catch (err) {
      toast.error("Failed to delete contact")
    }
  }

  const handleSaveContact = async (contactData) => {
    try {
      if (selectedContact) {
        const updatedContact = await contactsService.update(selectedContact.Id, contactData)
        setContacts(prevContacts =>
          prevContacts.map(contact =>
            contact.Id === selectedContact.Id ? updatedContact : contact
          )
        )
        toast.success("Contact updated successfully")
      } else {
        const newContact = await contactsService.create(contactData)
        setContacts(prevContacts => [...prevContacts, newContact])
        toast.success("Contact created successfully")
      }
      setIsModalOpen(false)
      setSelectedContact(null)
    } catch (err) {
      toast.error(selectedContact ? "Failed to update contact" : "Failed to create contact")
    }
  }

  const handleAddContact = () => {
    setSelectedContact(null)
    setIsModalOpen(true)
  }

  const getStatusVariant = (status) => {
    const variants = {
      "Active": "success",
      "Inactive": "default",
      "Prospect": "primary"
    }
    return variants[status] || "default"
  }

  const allTags = [...new Set(contacts.flatMap(contact => contact.tags || []))]

  if (loading) {
    return <Loading type="table" />
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadContacts} />
  }

  if (contacts.length === 0) {
    return (
      <Empty
        title="No contacts yet"
        description="Start building your network by adding your first contact."
        icon="Users"
        action={handleAddContact}
        actionLabel="Add First Contact"
      />
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
            <p className="text-slate-600">Manage your customer relationships and contacts</p>
          </div>
          <Button onClick={handleAddContact} className="flex items-center space-x-2">
            <ApperIcon name="Plus" size={20} />
            <span>Add Contact</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="lg:w-80">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              availableStatuses={statusOptions}
              availableTags={allTags}
            />
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Name</span>
                      {sortConfig.key === "name" && (
                        <ApperIcon 
                          name={sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown"} 
                          size={14}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("company")}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      {sortConfig.key === "company" && (
                        <ApperIcon 
                          name={sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown"} 
                          size={14}
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortConfig.key === "status" && (
                        <ApperIcon 
                          name={sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown"} 
                          size={14}
                        />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("lastContactedAt")}
                    className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Last Contact</span>
                      {sortConfig.key === "lastContactedAt" && (
                        <ApperIcon 
                          name={sortConfig.direction === "asc" ? "ChevronUp" : "ChevronDown"} 
                          size={14}
                        />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredContacts.map((contact) => (
                  <tr key={contact.Id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {contact.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {contact.name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {contact.position}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{contact.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{contact.email}</div>
                      <div className="text-sm text-slate-500">{contact.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusVariant(contact.status)} size="sm">
                        {contact.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {contact.lastContactedAt 
                        ? format(new Date(contact.lastContactedAt), "MMM d, yyyy")
                        : "Never"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditContact(contact)}
                          className="p-2"
                        >
                          <ApperIcon name="Edit2" size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.Id)}
                          className="p-2 text-red-600 hover:text-red-700"
                        >
                          <ApperIcon name="Trash2" size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredContacts.length === 0 && searchTerm && (
            <div className="p-8 text-center">
              <ApperIcon name="Search" size={40} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No contacts found matching "{searchTerm}"</p>
              <Button
                variant="ghost"
                onClick={() => setSearchTerm("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          )}
        </div>

        {/* Results Summary */}
        {filteredContacts.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Showing {filteredContacts.length} of {contacts.length} contacts
            </span>
            {searchTerm && (
              <span>
                Search results for "{searchTerm}"
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedContact(null)
        }}
        contact={selectedContact}
        onSave={handleSaveContact}
      />
    </>
  )
}

export default ContactsList
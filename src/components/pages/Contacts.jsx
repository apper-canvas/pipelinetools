import ContactsList from "@/components/organisms/ContactsList"

const Contacts = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ContactsList />
      </div>
    </div>
  )
}

export default Contacts
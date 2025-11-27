import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import AddModal from "@/components/organisms/AddModal"

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const navigation = [
    { name: "Pipeline", href: "/", icon: "BarChart3" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Activities", href: "/activities", icon: "Activity" },
    { name: "Analytics", href: "/analytics", icon: "TrendingUp" }
  ]

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary to-blue-600 rounded-lg">
                <ApperIcon name="BarChart3" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Pipeline Pro
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-primary bg-blue-50 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <ApperIcon name={item.icon} size={20} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Plus" size={20} />
                <span>Add</span>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="p-2"
              >
                <ApperIcon name="Plus" size={20} />
              </Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ApperIcon name={isMenuOpen ? "X" : "Menu"} size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-slate-200"
            >
              <div className="px-4 py-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive(item.href)
                        ? "text-primary bg-blue-50 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <ApperIcon name={item.icon} size={20} />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Add Modal */}
      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(type, data) => {
          setIsAddModalOpen(false)
          if (type === "contact") {
            navigate("/contacts")
          } else if (type === "deal") {
            navigate("/")
          }
        }}
      />
    </>
  )
}

export default Header
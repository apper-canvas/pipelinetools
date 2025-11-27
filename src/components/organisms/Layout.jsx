import { Outlet, Link, useLocation } from "react-router-dom"
import ApperIcon from "@/components/ApperIcon"
const Layout = () => {
const location = useLocation()

const navigation = [
    { name: "Pipeline", href: "/", icon: "BarChart3" },
    { name: "Contacts", href: "/contacts", icon: "Users" },
    { name: "Company", href: "/company", icon: "Building2" },
    { name: "Activities", href: "/activities", icon: "Activity" },
    { name: "Quotes", href: "/quotes", icon: "FileText" },
{ name: "Sales Orders", href: "/sales-orders", icon: "ShoppingCart" },
    { name: "Analytics", href: "/analytics", icon: "TrendingUp" },
{ name: "Reports", href: "/reports", icon: "FileBarChart" },
    { name: "Customize", href: "/customize", icon: "Wrench" },
    { name: "Settings", href: "/settings", icon: "Settings" }
  ]

  const isActive = (href) => {
    if (href === "/") {
      return location.pathname === "/"
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-slate-200">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="BarChart3" className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Pipeline Pro</span>
            </div>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-primary bg-blue-50 shadow-sm border border-blue-100"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <ApperIcon
                  name={item.icon}
                  size={20}
                  className={`mr-3 flex-shrink-0 ${
                    isActive(item.href) ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
<main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Pipeline from "@/components/pages/Pipeline";

const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()



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
              <Link
                to="/"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  location.pathname === "/" 
                    ? "text-primary bg-blue-50" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/contacts"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  location.pathname === "/contacts" 
                    ? "text-primary bg-blue-50" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Contacts
              </Link>
              <Link
                to="/company"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  location.pathname === "/company" 
                    ? "text-primary bg-blue-50" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Company
              </Link>
              <Link
                to="/activities"
                className={`px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                  location.pathname === "/activities" 
                    ? "text-primary bg-blue-50" 
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Activities
              </Link>
            </nav>

            {/* Desktop Actions */}

            {/* Mobile Menu Button */}
          </div>
        </div>
      </header>
      {/* Mobile Navigation */}

      {/* Add Modal */}
    </>
  )
}

export default Header
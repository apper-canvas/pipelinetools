import { useState } from "react"
import ApperIcon from "@/components/ApperIcon"
import Input from "@/components/atoms/Input"

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  value = "",
  onChange
}) => {
  const [searchTerm, setSearchTerm] = useState(value)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchTerm)
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    setSearchTerm(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon name="Search" size={20} className="text-slate-400" />
      </div>
      <Input
        type="search"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="pl-10 pr-4"
      />
    </form>
  )
}

export default SearchBar
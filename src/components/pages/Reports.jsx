import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Chart from 'react-apexcharts'
import { format, subDays, startOfMonth, endOfMonth, isAfter, isBefore } from 'date-fns'
import ApperIcon from '@/components/ApperIcon'
import Card from '@/components/atoms/Card'
import Badge from '@/components/atoms/Badge'
import Button from '@/components/atoms/Button'
import Loading from '@/components/ui/Loading'
import ErrorView from '@/components/ui/ErrorView'
import dealsService from '@/services/api/dealsService'
import contactsService from '@/services/api/contactsService'
import activitiesService from '@/services/api/activitiesService'

function Reports() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [selectedReport, setSelectedReport] = useState('overview')
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  })

  const reportTypes = [
    { id: 'overview', name: 'Overview', icon: 'BarChart3' },
    { id: 'sales', name: 'Sales Performance', icon: 'TrendingUp' },
    { id: 'pipeline', name: 'Pipeline Analysis', icon: 'GitBranch' },
    { id: 'contacts', name: 'Contact Activity', icon: 'Users' },
    { id: 'revenue', name: 'Revenue Trends', icon: 'DollarSign' }
  ]

  useEffect(() => {
    loadReportData()
  }, [dateRange])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [deals, contacts, activities] = await Promise.all([
        dealsService.getAll(),
        contactsService.getAll(),
        activitiesService.getAll()
      ])

      const startDate = new Date(dateRange.start)
      const endDate = new Date(dateRange.end)
      
      // Filter data by date range
      const filteredDeals = deals.filter(deal => {
        const dealDate = new Date(deal.createdAt)
        return isAfter(dealDate, startDate) && isBefore(dealDate, endDate)
      })
      
      const filteredActivities = activities.filter(activity => {
        const activityDate = new Date(activity.date)
        return isAfter(activityDate, startDate) && isBefore(activityDate, endDate)
      })

      // Calculate metrics
      const totalRevenue = filteredDeals.reduce((sum, deal) => sum + deal.value, 0)
      const totalDeals = filteredDeals.length
      const wonDeals = filteredDeals.filter(deal => deal.stage === 'Closed').length
      const winRate = totalDeals > 0 ? (wonDeals / totalDeals * 100) : 0
      
      // Pipeline analysis
      const pipelineData = filteredDeals.reduce((acc, deal) => {
        acc[deal.stage] = (acc[deal.stage] || 0) + deal.value
        return acc
      }, {})

      // Activity breakdown
      const activityTypes = filteredActivities.reduce((acc, activity) => {
        acc[activity.type] = (acc[activity.type] || 0) + 1
        return acc
      }, {})

      // Revenue by month
      const monthlyRevenue = filteredDeals.reduce((acc, deal) => {
        const month = format(new Date(deal.createdAt), 'MMM yyyy')
        acc[month] = (acc[month] || 0) + deal.value
        return acc
      }, {})

      // Top contacts by deal value
      const contactDeals = filteredDeals.reduce((acc, deal) => {
        const contactName = deal.contactName || 'Unknown'
        if (!acc[contactName]) {
          acc[contactName] = { count: 0, value: 0 }
        }
        acc[contactName].count += 1
        acc[contactName].value += deal.value
        return acc
      }, {})

      const topContacts = Object.entries(contactDeals)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      setReportData({
        summary: {
          totalRevenue,
          totalDeals,
          wonDeals,
          winRate,
          avgDealSize: totalDeals > 0 ? totalRevenue / totalDeals : 0,
          totalContacts: contacts.length,
          totalActivities: filteredActivities.length
        },
        pipelineData,
        activityTypes,
        monthlyRevenue,
        topContacts,
        dealsByStage: filteredDeals.reduce((acc, deal) => {
          acc[deal.stage] = (acc[deal.stage] || 0) + 1
          return acc
        }, {})
      })
    } catch (err) {
      setError('Failed to load report data')
      console.error('Error loading reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  const exportReport = () => {
    if (!reportData) return
    
    const exportData = {
      reportType: selectedReport,
      dateRange,
      generatedAt: new Date().toISOString(),
      summary: reportData.summary,
      data: reportData
    }
    
    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedReport}-report-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) return <Loading />
  if (error) return <ErrorView error={error} onRetry={loadReportData} />

  const renderOverviewReport = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(reportData.summary.totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <ApperIcon name="DollarSign" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Deals</p>
              <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalDeals}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatPercentage(reportData.summary.winRate)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ApperIcon name="Target" className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(reportData.summary.avgDealSize)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <ApperIcon name="Calculator" className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )

  const renderSalesReport = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deals by Stage</h3>
          <Chart
            options={{
              chart: { type: 'pie' },
              labels: Object.keys(reportData.dealsByStage),
              colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
              legend: { position: 'bottom' }
            }}
            series={Object.values(reportData.dealsByStage)}
            type="pie"
            height={300}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Contacts by Revenue</h3>
          <div className="space-y-3">
            {reportData.topContacts.map((contact, index) => (
              <div key={contact.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="font-medium">{contact.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(contact.value)}</p>
                  <p className="text-sm text-gray-500">{contact.count} deals</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderPipelineReport = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Pipeline Value by Stage</h3>
        <Chart
          options={{
            chart: { type: 'bar', toolbar: { show: false } },
            xaxis: { categories: Object.keys(reportData.pipelineData) },
            yaxis: {
              labels: {
                formatter: (value) => formatCurrency(value)
              }
            },
            colors: ['#3b82f6'],
            plotOptions: {
              bar: { borderRadius: 4, horizontal: false }
            }
          }}
          series={[{
            name: 'Pipeline Value',
            data: Object.values(reportData.pipelineData)
          }]}
          type="bar"
          height={350}
        />
      </Card>
    </div>
  )

  const renderContactsReport = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activity Types</h3>
        <Chart
          options={{
            chart: { type: 'donut' },
            labels: Object.keys(reportData.activityTypes),
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            legend: { position: 'bottom' }
          }}
          series={Object.values(reportData.activityTypes)}
          type="donut"
          height={300}
        />
      </Card>
    </div>
  )

  const renderRevenueReport = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Revenue Trend</h3>
        <Chart
          options={{
            chart: { type: 'line', toolbar: { show: false } },
            xaxis: { categories: Object.keys(reportData.monthlyRevenue) },
            yaxis: {
              labels: {
                formatter: (value) => formatCurrency(value)
              }
            },
            colors: ['#10b981'],
            stroke: { curve: 'smooth', width: 3 }
          }}
          series={[{
            name: 'Revenue',
            data: Object.values(reportData.monthlyRevenue)
          }]}
          type="line"
          height={350}
        />
      </Card>
    </div>
  )

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport()
      case 'sales':
        return renderSalesReport()
      case 'pipeline':
        return renderPipelineReport()
      case 'contacts':
        return renderContactsReport()
      case 'revenue':
        return renderRevenueReport()
      default:
        return renderOverviewReport()
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive business analytics and insights</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2">
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <Button onClick={exportReport} className="flex items-center gap-2">
              <ApperIcon name="Download" size={16} />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Report Type Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setSelectedReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedReport === report.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ApperIcon name={report.icon} size={16} />
              {report.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Report Content */}
      <div className="space-y-6">
        {selectedReport === 'overview' && renderOverviewReport()}
        {renderReportContent()}
      </div>
    </div>
  )
}

export default Reports
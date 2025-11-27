import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Chart from "react-apexcharts"
import ApperIcon from "@/components/ApperIcon"
import Card from "@/components/atoms/Card"
import Badge from "@/components/atoms/Badge"
import Loading from "@/components/ui/Loading"
import ErrorView from "@/components/ui/ErrorView"
import Empty from "@/components/ui/Empty"
import dealsService from "@/services/api/dealsService"
import contactsService from "@/services/api/contactsService"
import activitiesService from "@/services/api/activitiesService"

const AnalyticsDashboard = () => {
  const [deals, setDeals] = useState([])
  const [contacts, setContacts] = useState([])
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [dealsResponse, contactsResponse, activitiesResponse] = await Promise.all([
        dealsService.getAll(),
        contactsService.getAll(),
        activitiesService.getAll()
      ])
      setDeals(dealsResponse)
      setContacts(contactsResponse)
      setActivities(activitiesResponse)
    } catch (err) {
      setError(err.message || "Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Calculate metrics
  const metrics = {
    totalDeals: deals.length,
    totalPipelineValue: deals.reduce((sum, deal) => sum + deal.value, 0),
    closedDeals: deals.filter(deal => deal.stage === "Closed").length,
    averageDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
    conversionRate: deals.length > 0 ? (deals.filter(deal => deal.stage === "Closed").length / deals.length) * 100 : 0,
    totalContacts: contacts.length,
    activeContacts: contacts.filter(contact => contact.status === "Active").length,
    totalActivities: activities.length
  }

  // Stage distribution data
  const stageDistribution = {
    Lead: deals.filter(deal => deal.stage === "Lead").reduce((sum, deal) => sum + deal.value, 0),
    Qualified: deals.filter(deal => deal.stage === "Qualified").reduce((sum, deal) => sum + deal.value, 0),
    Proposal: deals.filter(deal => deal.stage === "Proposal").reduce((sum, deal) => sum + deal.value, 0),
    Negotiation: deals.filter(deal => deal.stage === "Negotiation").reduce((sum, deal) => sum + deal.value, 0),
    Closed: deals.filter(deal => deal.stage === "Closed").reduce((sum, deal) => sum + deal.value, 0)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`
  }

  // Chart configurations
  const pipelineChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#eab308', '#10b981'],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        dataLabels: { position: 'top' }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => formatCurrency(val),
      offsetY: -20,
      style: {
        fontSize: '12px',
        colors: ['#64748b']
      }
    },
    xaxis: {
      categories: Object.keys(stageDistribution),
      labels: {
        style: { colors: '#64748b', fontSize: '12px' }
      }
    },
    yaxis: {
      labels: {
        formatter: (val) => formatCurrency(val),
        style: { colors: '#64748b', fontSize: '12px' }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 3
    },
    tooltip: {
      y: {
        formatter: (val) => formatCurrency(val)
      }
    }
  }

  const pipelineChartSeries = [{
    name: 'Pipeline Value',
    data: Object.values(stageDistribution)
  }]

  // Activity distribution
  const activityDistribution = activities.reduce((acc, activity) => {
    acc[activity.type] = (acc[activity.type] || 0) + 1
    return acc
  }, {})

  const activityChartOptions = {
    chart: {
      type: 'donut',
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#3b82f6', '#10b981', '#8b5cf6', '#64748b'],
    labels: Object.keys(activityDistribution),
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => metrics.totalActivities.toString()
            }
          }
        }
      }
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: { colors: '#64748b' }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} activities`
      }
    }
  }

  const activityChartSeries = Object.values(activityDistribution)

  if (loading) {
    return <Loading type="cards" />
  }

  if (error) {
    return <ErrorView error={error} onRetry={loadData} />
  }

  if (deals.length === 0 && contacts.length === 0 && activities.length === 0) {
    return (
      <Empty
        title="No analytics data available"
        description="Start using Pipeline Pro to see your sales analytics and insights here."
        icon="TrendingUp"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600">Track your sales performance and pipeline insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(metrics.totalPipelineValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="TrendingUp" size={24} className="text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Active Deals</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.totalDeals}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="BarChart3" size={24} className="text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Conversion Rate</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPercentage(metrics.conversionRate)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="Target" size={24} className="text-white" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Avg Deal Size</p>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(metrics.averageDealSize)}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <ApperIcon name="DollarSign" size={24} className="text-white" />
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Contacts</h3>
            <ApperIcon name="Users" size={20} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total Contacts</span>
              <span className="text-sm font-medium">{metrics.totalContacts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Active Contacts</span>
              <span className="text-sm font-medium">{metrics.activeContacts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Activity Rate</span>
              <Badge variant="success" size="sm">
                {metrics.totalContacts > 0 ? formatPercentage((metrics.activeContacts / metrics.totalContacts) * 100) : "0%"}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Deal Performance</h3>
            <ApperIcon name="Award" size={20} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Closed Deals</span>
              <span className="text-sm font-medium">{metrics.closedDeals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">In Progress</span>
              <span className="text-sm font-medium">{metrics.totalDeals - metrics.closedDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Success Rate</span>
              <Badge variant="primary" size="sm">
                {formatPercentage(metrics.conversionRate)}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Activity Summary</h3>
            <ApperIcon name="Activity" size={20} className="text-slate-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Total Activities</span>
              <span className="text-sm font-medium">{metrics.totalActivities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Per Contact</span>
              <span className="text-sm font-medium">
                {metrics.totalContacts > 0 ? (metrics.totalActivities / metrics.totalContacts).toFixed(1) : "0"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Engagement</span>
              <Badge variant="success" size="sm">High</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Pipeline by Stage</h3>
            <ApperIcon name="BarChart" size={20} className="text-slate-500" />
          </div>
          {Object.values(stageDistribution).some(value => value > 0) ? (
            <Chart
              options={pipelineChartOptions}
              series={pipelineChartSeries}
              type="bar"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <div className="text-center">
                <ApperIcon name="BarChart" size={40} className="mx-auto mb-2 text-slate-300" />
                <p>No pipeline data available</p>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-slate-900">Activities Distribution</h3>
            <ApperIcon name="PieChart" size={20} className="text-slate-500" />
          </div>
          {Object.keys(activityDistribution).length > 0 ? (
            <Chart
              options={activityChartOptions}
              series={activityChartSeries}
              type="donut"
              height={300}
            />
          ) : (
            <div className="flex items-center justify-center h-[300px] text-slate-500">
              <div className="text-center">
                <ApperIcon name="PieChart" size={40} className="mx-auto mb-2 text-slate-300" />
                <p>No activity data available</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Pipeline Stage Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-slate-900">Stage Performance</h3>
          <ApperIcon name="Layers" size={20} className="text-slate-500" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left pb-3 text-sm font-medium text-slate-600">Stage</th>
                <th className="text-left pb-3 text-sm font-medium text-slate-600">Deals</th>
                <th className="text-left pb-3 text-sm font-medium text-slate-600">Value</th>
                <th className="text-left pb-3 text-sm font-medium text-slate-600">Avg Deal Size</th>
                <th className="text-left pb-3 text-sm font-medium text-slate-600">% of Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {Object.entries(stageDistribution).map(([stage, value]) => {
                const stageDeals = deals.filter(deal => deal.stage === stage)
                const avgDealSize = stageDeals.length > 0 ? value / stageDeals.length : 0
                const percentage = metrics.totalPipelineValue > 0 ? (value / metrics.totalPipelineValue) * 100 : 0
                
                return (
                  <tr key={stage}>
                    <td className="py-3">
                      <Badge
                        variant={
                          stage === "Lead" ? "lead" :
                          stage === "Qualified" ? "qualified" :
                          stage === "Proposal" ? "proposal" :
                          stage === "Negotiation" ? "negotiation" :
                          "closed"
                        }
                        size="sm"
                      >
                        {stage}
                      </Badge>
                    </td>
                    <td className="py-3 text-sm text-slate-900">{stageDeals.length}</td>
                    <td className="py-3 text-sm font-medium text-slate-900">{formatCurrency(value)}</td>
                    <td className="py-3 text-sm text-slate-900">{formatCurrency(avgDealSize)}</td>
                    <td className="py-3 text-sm text-slate-900">{formatPercentage(percentage)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default AnalyticsDashboard
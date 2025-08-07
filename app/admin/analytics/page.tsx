'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { RefreshCw, TrendingUp, Users, FileText, CreditCard, Activity } from 'lucide-react'

type AnalyticsData = {
  userGrowth: any[]
  documentGeneration: any[]
  subscriptions: any[]
  usageAnalytics: any[]
  metrics: {
    revenue: {
      total: number
      activeSubscriptions: number
      averageRevenue: number
    }
    users: {
      total: number
      lawyers: number
      admins: number
    }
    documents: {
      total: number
      completed: number
      pending: number
    }
  }
  topActions: {
    action: string
    count: number
  }[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export default function AnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('month')
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<AnalyticsData | null>(null)
  const { toast } = useToast()

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)
      setError('')
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load analytics data. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value)
  }

  const renderMetricCards = () => {
    if (!data) return null

    const { metrics } = data

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.revenue.total)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.revenue.activeSubscriptions} active subscriptions
            </p>
          </CardContent>
        </Card>

        {/* Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.users.lawyers} lawyers, {metrics.users.admins} admins
            </p>
          </CardContent>
        </Card>

        {/* Documents Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.documents.total}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.documents.completed} completed, {metrics.documents.pending} pending
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderUserGrowthChart = () => {
    if (!data?.userGrowth || data.userGrowth.length === 0) return null

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New user registrations over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.userGrowth} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lawyer" stroke="#0088FE" activeDot={{ r: 8 }} name="Lawyers" />
              <Line type="monotone" dataKey="admin" stroke="#00C49F" name="Admins" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderDocumentGenerationChart = () => {
    if (!data?.documentGeneration || data.documentGeneration.length === 0) return null

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Document Generation</CardTitle>
          <CardDescription>Documents generated over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.documentGeneration} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#0088FE" name="Completed" />
              <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderSubscriptionChart = () => {
    if (!data?.subscriptions || data.subscriptions.length === 0) return null

    // Aggregate subscription data by plan
    const planCounts: Record<string, number> = {}
    data.subscriptions.forEach(item => {
      Object.entries(item)
        .filter(([key]) => key !== 'date')
        .forEach(([plan, count]) => {
          planCounts[plan] = (planCounts[plan] || 0) + (count as number)
        })
    })

    const pieData = Object.entries(planCounts).map(([name, value], index) => ({
      name,
      value,
    }))

    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
          <CardDescription>Distribution of subscription plans</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderTopActionsChart = () => {
    if (!data?.topActions || data.topActions.length === 0) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Top User Actions</CardTitle>
          <CardDescription>Most frequent user activities</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data.topActions}
              margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="action" />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8884d8" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  const renderUsageAnalyticsChart = () => {
    if (!data?.usageAnalytics || data.usageAnalytics.length === 0) return null

    // Get all unique actions
    const allActions = new Set<string>()
    data.usageAnalytics.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date') allActions.add(key)
      })
    })

    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Usage Analytics</CardTitle>
          <CardDescription>User actions over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.usageAnalytics} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Array.from(allActions).map((action, index) => (
                <Line
                  key={action}
                  type="monotone"
                  dataKey={action}
                  stroke={COLORS[index % COLORS.length]}
                  name={action}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Last 24 Hours</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-[200px] w-full" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAnalytics}>Try Again</Button>
          </div>
        ) : (
          <>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {renderMetricCards()}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderUserGrowthChart()}
                  {renderTopActionsChart()}
                </div>
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {renderMetricCards()}
                {renderUserGrowthChart()}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Document Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium">Total Documents</div>
                          <div className="text-2xl font-bold">{data?.metrics.documents.total}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Completed</div>
                          <div className="text-2xl font-bold">{data?.metrics.documents.completed}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Pending</div>
                          <div className="text-2xl font-bold">{data?.metrics.documents.pending}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {renderDocumentGenerationChart()}
                </div>
              </TabsContent>

              <TabsContent value="subscriptions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Subscription Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm font-medium">Total Revenue</div>
                          <div className="text-2xl font-bold">{formatCurrency(data?.metrics.revenue.total || 0)}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Active Subscriptions</div>
                          <div className="text-2xl font-bold">{data?.metrics.revenue.activeSubscriptions}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Average Revenue per Subscription</div>
                          <div className="text-2xl font-bold">{formatCurrency(data?.metrics.revenue.averageRevenue || 0)}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  {renderSubscriptionChart()}
                </div>
              </TabsContent>

              <TabsContent value="usage" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderTopActionsChart()}
                  {renderUsageAnalyticsChart()}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components/layouts/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { useToast } from '@/hooks/use-toast'
import { Search, Filter, RefreshCw, Calendar, CreditCard } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Subscription = {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone?: string
  barCouncilId?: string
  plan: string
  amount: string
  status: 'active' | 'cancelled' | 'expired' | 'trial'
  razorpayId?: string
  startDate: string
  endDate: string
  createdAt: string
}

export default function SubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const { toast } = useToast()
  const [status, setStatus] = useState('')
  const [plan, setPlan] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [availablePlans, setAvailablePlans] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('all')

  const fetchSubscriptions = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin/login')
        return
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (search) queryParams.set('search', search)
      if (status) queryParams.set('status', status)
      if (plan) queryParams.set('plan', plan)

      const response = await fetch(`/api/admin/subscriptions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions')
      }

      const data = await response.json()
      setSubscriptions(data.subscriptions)
      setAvailablePlans(data.plans)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error('Error fetching subscriptions:', err)
      setError('Failed to load subscriptions. Please try again.')
      toast({
        title: 'Error',
        description: 'Failed to load subscriptions. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const resetFilters = () => {
    setSearch('')
    setSearchInput('')
    setStatus('')
    setPlan('')
    setPage(1)
  }

  useEffect(() => {
    fetchSubscriptions()
  }, [page, limit, search, status, plan])

  useEffect(() => {
    // Set status filter based on active tab
    switch (activeTab) {
      case 'active':
        setStatus('active')
        break
      case 'trial':
        setStatus('trial')
        break
      case 'expired':
        setStatus('expired')
        break
      case 'cancelled':
        setStatus('cancelled')
        break
      default:
        setStatus('')
        break
    }
  }, [activeTab])

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => page > 1 && setPage(page - 1)}
              className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => setPage(1)}>1</PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
            </>
          )}
          
          {pages.map((p) => (
            <PaginationItem key={p}>
              <PaginationLink 
                onClick={() => setPage(p)}
                isActive={page === p}
              >
                {p}
              </PaginationLink>
            </PaginationItem>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => setPage(totalPages)}>{totalPages}</PaginationLink>
              </PaginationItem>
            </>
          )}
          
          <PaginationItem>
            <PaginationNext 
              onClick={() => page < totalPages && setPage(page + 1)}
              className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(amount))
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'trial':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      case 'expired':
        return 'outline'
      default:
        return 'default'
    }
  }

  const calculateSubscriptionStats = () => {
    if (!subscriptions.length) return { active: 0, trial: 0, expired: 0, cancelled: 0, total: 0, revenue: 0 }

    const stats = {
      active: 0,
      trial: 0,
      expired: 0,
      cancelled: 0,
      total: subscriptions.length,
      revenue: 0,
    }

    subscriptions.forEach(sub => {
      switch (sub.status) {
        case 'active':
          stats.active++
          stats.revenue += Number(sub.amount)
          break
        case 'trial':
          stats.trial++
          break
        case 'expired':
          stats.expired++
          break
        case 'cancelled':
          stats.cancelled++
          break
      }
    })

    return stats
  }

  const stats = calculateSubscriptionStats()

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.active / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Trials</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.trial}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.trial / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.revenue.toString())}</div>
              <p className="text-xs text-muted-foreground">
                From {stats.active} active subscriptions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired/Cancelled</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.expired + stats.cancelled}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.expired + stats.cancelled) / stats.total * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Management</CardTitle>
            <CardDescription>
              Manage all subscriptions in the system. Total: {total} subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="trial">Free Trial</TabsTrigger>
                <TabsTrigger value="expired">Expired</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 flex items-center space-x-2">
                <Input
                  placeholder="Search by name, email or subscription ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex space-x-2">
                <Select value={plan} onValueChange={setPlan}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Plans</SelectItem>
                    {availablePlans.map((planName) => (
                      <SelectItem key={planName} value={planName}>
                        {planName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-500">{error}</p>
                <Button onClick={fetchSubscriptions} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No subscriptions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Subscription ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{subscription.userName}</div>
                            <div className="text-sm text-muted-foreground">{subscription.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{subscription.plan}</TableCell>
                        <TableCell>{formatCurrency(subscription.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(subscription.status)}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(subscription.startDate)}</TableCell>
                        <TableCell>{formatDate(subscription.endDate)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {subscription.razorpayId || 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && subscriptions.length > 0 && (
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} subscriptions
                </div>
                {renderPagination()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
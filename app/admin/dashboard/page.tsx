"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  FileText,
  TrendingUp,
  DollarSign,
  Activity,
  AlertCircle,
  CheckCircle,
  Plus,
  Settings,
  BarChart3,
} from "lucide-react"
import Link from "next/link"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useAuth } from "@/hooks/use-auth"

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeLawyers: 0,
    documentsGenerated: 0,
    monthlyRevenue: 0,
    templatesCreated: 0,
    subscriptionRate: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [topTemplates, setTopTemplates] = useState([])
  const [userGrowth, setUserGrowth] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentActivities(data.recentActivities)
        setTopTemplates(data.topTemplates)
        setUserGrowth(data.userGrowth)
      } else {
        // Mock data for demonstration
        setStats({
          totalUsers: 1247,
          activeLawyers: 892,
          documentsGenerated: 15634,
          monthlyRevenue: 2847500,
          templatesCreated: 45,
          subscriptionRate: 78.5,
        })

        setRecentActivities([
          { id: 1, type: "user_registered", user: "Advocate Sharma", time: "2 hours ago" },
          { id: 2, type: "document_generated", user: "Advocate Patel", template: "Sale Deed", time: "3 hours ago" },
          { id: 3, type: "subscription_upgraded", user: "Advocate Kumar", plan: "Pro", time: "5 hours ago" },
          { id: 4, type: "template_created", template: "Rent Agreement v2", time: "1 day ago" },
        ])

        setTopTemplates([
          { name: "Sale Deed", usage: 2847, growth: 12.5 },
          { name: "Rent Agreement", usage: 1923, growth: 8.3 },
          { name: "Power of Attorney", usage: 1456, growth: -2.1 },
          { name: "Affidavit", usage: 1234, growth: 15.7 },
          { name: "Will & Testament", usage: 987, growth: 5.4 },
        ])
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="opacity-90">Here's what's happening with Advocate AI Pro today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Lawyers</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeLawyers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {((stats.activeLawyers / stats.totalUsers) * 100).toFixed(1)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentsGenerated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Generated this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.monthlyRevenue / 100000).toFixed(1)}L</div>
              <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Templates</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.templatesCreated}</div>
              <p className="text-xs text-muted-foreground">Active templates</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.subscriptionRate}%</div>
              <Progress value={stats.subscriptionRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your platform efficiently</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/admin/templates">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <Plus className="h-6 w-6" />
                  <span>Create Template</span>
                </Button>
              </Link>

              <Link href="/admin/users">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Users className="h-6 w-6" />
                  <span>Manage Users</span>
                </Button>
              </Link>

              <Link href="/admin/analytics">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                </Button>
              </Link>

              <Link href="/admin/settings">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Settings className="h-6 w-6" />
                  <span>System Settings</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest platform activities and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {activity.type === "user_registered" && `${activity.user} registered`}
                        {activity.type === "document_generated" && `${activity.user} generated ${activity.template}`}
                        {activity.type === "subscription_upgraded" && `${activity.user} upgraded to ${activity.plan}`}
                        {activity.type === "template_created" && `New template: ${activity.template}`}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Top Templates</CardTitle>
              <CardDescription>Most used document templates this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topTemplates.map((template: any, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">{template.usage} uses</p>
                      </div>
                    </div>
                    <Badge variant={template.growth > 0 ? "default" : "destructive"}>
                      {template.growth > 0 ? "+" : ""}
                      {template.growth}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">API Status</p>
                  <p className="text-sm text-muted-foreground">Operational</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Database</p>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium">OCR Service</p>
                  <p className="text-sm text-muted-foreground">Degraded</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">AI Models</p>
                  <p className="text-sm text-muted-foreground">Online</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}

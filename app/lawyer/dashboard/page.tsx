"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, Scale, Brain, TrendingUp, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"
import { LawyerLayout } from "@/components/layouts/lawyer-layout"
import { useAuth } from "@/hooks/use-auth"

export default function LawyerDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalCases: 0,
    activeCases: 0,
    documentsGenerated: 0,
    upcomingHearings: 0,
    winRate: 0,
  })
  const [recentActivities, setRecentActivities] = useState([])
  const [upcomingHearings, setUpcomingHearings] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/lawyer/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setStats(data.stats)
        setRecentActivities(data.recentActivities)
        setUpcomingHearings(data.upcomingHearings)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    }
  }

  return (
    <LawyerLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.firstName} {user?.lastName}
          </h1>
          <p className="opacity-90">Here's what's happening with your legal practice today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCases}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCases}</div>
              <p className="text-xs text-muted-foreground">Requiring attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documentsGenerated}</div>
              <p className="text-xs text-muted-foreground">Generated this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hearings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingHearings}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.winRate}%</div>
              <Progress value={stats.winRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/lawyer/document-automation">
                <Button className="w-full h-20 flex flex-col items-center justify-center space-y-2">
                  <FileText className="h-6 w-6" />
                  <span>Document Automation</span>
                </Button>
              </Link>

              <Link href="/lawyer/ecourt-integration">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Scale className="h-6 w-6" />
                  <span>eCourt Integration</span>
                </Button>
              </Link>

              <Link href="/lawyer/argument-genius">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <Brain className="h-6 w-6" />
                  <span>Argument Genius</span>
                </Button>
              </Link>

              <Link href="/lawyer/win-predictor">
                <Button
                  variant="outline"
                  className="w-full h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                >
                  <TrendingUp className="h-6 w-6" />
                  <span>Win Predictor</span>
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
              <CardDescription>Your latest actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity: any, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No recent activities</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Hearings */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Hearings</CardTitle>
              <CardDescription>Your scheduled court appearances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingHearings.length > 0 ? (
                  upcomingHearings.map((hearing: any, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{hearing.caseName}</p>
                        <p className="text-sm text-muted-foreground">
                          {hearing.court} - {hearing.judge}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {hearing.date} at {hearing.time}
                        </p>
                      </div>
                      <Badge variant={hearing.priority === "high" ? "destructive" : "secondary"}>
                        {hearing.priority}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming hearings</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LawyerLayout>
  )
}

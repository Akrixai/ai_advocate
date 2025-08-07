import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    
    let decoded;
    try {
      decoded = verifyJWT(token)
      
      // Verify admin access
      if (decoded.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const period = url.searchParams.get("period") || "month" // day, week, month, year
    
    // Calculate date range based on period
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
        break
      case "week":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case "year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
    }
    
    const startDateStr = startDate.toISOString()

    // Get user registrations over time
    const { data: userRegistrations } = await supabase
      .from("users")
      .select("created_at, user_type")
      .gte("created_at", startDateStr)
      .order("created_at", { ascending: true })
    
    // Get document generation stats
    const { data: documentStats } = await supabase
      .from("documents")
      .select("created_at, status")
      .gte("created_at", startDateStr)
    
    // Get subscription stats
    const { data: subscriptionStats } = await supabase
      .from("subscriptions")
      .select("created_at, amount, plan_name, status")
      .gte("created_at", startDateStr)
    
    // Get usage analytics
    const { data: usageStats } = await supabase
      .from("usage_analytics")
      .select("action, created_at")
      .gte("created_at", startDateStr)
    
    // Process data for charts
    const userGrowthData = processTimeSeriesData(userRegistrations || [], period, "user_type")
    const documentGenerationData = processTimeSeriesData(documentStats || [], period, "status")
    const subscriptionData = processTimeSeriesData(subscriptionStats || [], period, "plan_name")
    const usageData = processTimeSeriesData(usageStats || [], period, "action")
    
    // Calculate revenue metrics
    const totalRevenue = subscriptionStats?.reduce((sum, sub) => sum + Number.parseFloat(sub.amount), 0) || 0
    const activeSubscriptions = subscriptionStats?.filter(sub => sub.status === "active").length || 0
    
    // Calculate user metrics
    const totalUsers = userRegistrations?.length || 0
    const lawyerUsers = userRegistrations?.filter(user => user.user_type === "lawyer").length || 0
    const adminUsers = userRegistrations?.filter(user => user.user_type === "admin").length || 0
    
    // Calculate document metrics
    const totalDocuments = documentStats?.length || 0
    const completedDocuments = documentStats?.filter(doc => doc.status === "completed").length || 0
    const pendingDocuments = documentStats?.filter(doc => doc.status === "pending").length || 0
    
    // Get top actions from usage analytics
    const actionCounts: Record<string, number> = {}
    usageStats?.forEach(stat => {
      actionCounts[stat.action] = (actionCounts[stat.action] || 0) + 1
    })
    
    const topActions = Object.entries(actionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([action, count]) => ({ action, count }))

    return NextResponse.json({
      userGrowth: userGrowthData,
      documentGeneration: documentGenerationData,
      subscriptions: subscriptionData,
      usageAnalytics: usageData,
      metrics: {
        revenue: {
          total: totalRevenue,
          activeSubscriptions,
          averageRevenue: activeSubscriptions > 0 ? totalRevenue / activeSubscriptions : 0
        },
        users: {
          total: totalUsers,
          lawyers: lawyerUsers,
          admins: adminUsers
        },
        documents: {
          total: totalDocuments,
          completed: completedDocuments,
          pending: pendingDocuments
        }
      },
      topActions
    })
  } catch (error) {
    console.error("Admin analytics API error:", error)
    return NextResponse.json({ message: "Failed to fetch analytics data" }, { status: 500 })
  }
}

// Helper function to process time series data
function processTimeSeriesData(data: any[], period: string, categoryField: string) {
  const result: Record<string, Record<string, number>> = {}
  const dateFormat = getDateFormat(period)
  
  data.forEach(item => {
    const date = new Date(item.created_at)
    const formattedDate = formatDate(date, dateFormat)
    const category = item[categoryField] || "unknown"
    
    if (!result[formattedDate]) {
      result[formattedDate] = {}
    }
    
    result[formattedDate][category] = (result[formattedDate][category] || 0) + 1
  })
  
  // Convert to array format for charts
  return Object.entries(result).map(([date, categories]) => {
    return {
      date,
      ...categories
    }
  }).sort((a, b) => a.date.localeCompare(b.date))
}

function getDateFormat(period: string): string {
  switch (period) {
    case "day":
      return "HH:00" // Hour format
    case "week":
      return "yyyy-MM-dd" // Daily format
    case "year":
      return "yyyy-MM" // Monthly format
    case "month":
    default:
      return "yyyy-MM-dd" // Daily format
  }
}

function formatDate(date: Date, format: string): string {
  switch (format) {
    case "HH:00":
      return `${date.getHours().toString().padStart(2, '0')}:00`
    case "yyyy-MM-dd":
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
    case "yyyy-MM":
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
    default:
      return date.toISOString()
  }
}
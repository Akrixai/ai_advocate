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

    // Get user statistics
    const { data: userStats } = await supabase.from("users").select("user_type, is_active, created_at")

    const totalUsers = userStats?.length || 0
    const activeLawyers = userStats?.filter((u) => u.user_type === "lawyer" && u.is_active).length || 0

    // Get document statistics
    const { data: documentStats } = await supabase
      .from("documents")
      .select("created_at, status")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const documentsGenerated = documentStats?.length || 0

    // Get subscription statistics
    const { data: subscriptionStats } = await supabase
      .from("subscriptions")
      .select("amount, status, created_at")
      .eq("status", "active")

    const monthlyRevenue = subscriptionStats?.reduce((sum, sub) => sum + Number.parseFloat(sub.amount), 0) || 0

    // Get template statistics
    const { data: templateStats } = await supabase.from("templates").select("id, usage_count").eq("status", "active")

    const templatesCreated = templateStats?.length || 0

    // Calculate subscription rate
    const subscriptionRate = totalUsers > 0 ? ((subscriptionStats?.length || 0) / totalUsers) * 100 : 0

    // Get recent activities
    const { data: recentActivities } = await supabase
      .from("usage_analytics")
      .select("action, created_at, metadata, users(first_name, last_name)")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get top templates
    const topTemplates =
      templateStats
        ?.sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 5)
        .map((t) => ({
          name: t.name,
          usage: t.usage_count,
          growth: Math.random() * 20 - 5, // Mock growth data
        })) || []

    return NextResponse.json({
      stats: {
        totalUsers,
        activeLawyers,
        documentsGenerated,
        monthlyRevenue,
        templatesCreated,
        subscriptionRate: Math.round(subscriptionRate * 10) / 10,
      },
      recentActivities:
        recentActivities?.map((activity) => ({
          id: Math.random(),
          type: activity.action,
          user: `${activity.users?.first_name} ${activity.users?.last_name}`,
          time: new Date(activity.created_at).toLocaleString(),
          ...activity.metadata,
        })) || [],
      topTemplates,
    })
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return NextResponse.json({ message: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

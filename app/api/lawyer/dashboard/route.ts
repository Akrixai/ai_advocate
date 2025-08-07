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
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Get user's cases
    const { data: cases } = await supabase.from("cases").select("*").eq("user_id", decoded.userId)

    const totalCases = cases?.length || 0
    const activeCases = cases?.filter((c) => c.status === "active").length || 0

    // Get user's documents
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", decoded.userId)
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const documentsGenerated = documents?.length || 0

    // Get upcoming hearings
    const upcomingHearings =
      cases
        ?.filter((c) => c.next_hearing && new Date(c.next_hearing) > new Date())
        .sort((a, b) => new Date(a.next_hearing).getTime() - new Date(b.next_hearing).getTime())
        .slice(0, 5)
        .map((c) => ({
          caseName: c.title,
          court: c.court,
          judge: c.judge_name,
          date: new Date(c.next_hearing).toLocaleDateString(),
          time: new Date(c.next_hearing).toLocaleTimeString(),
          priority: Math.random() > 0.5 ? "high" : "normal",
        })) || []

    // Get recent activities
    const { data: activities } = await supabase
      .from("usage_analytics")
      .select("action, created_at, metadata")
      .eq("user_id", decoded.userId)
      .order("created_at", { ascending: false })
      .limit(10)

    const recentActivities =
      activities?.map((activity) => ({
        title: formatActivityTitle(activity.action, activity.metadata),
        time: new Date(activity.created_at).toLocaleString(),
      })) || []

    // Calculate win rate (mock calculation)
    const closedCases = cases?.filter((c) => c.status === "closed") || []
    const winRate = closedCases.length > 0 ? Math.round(Math.random() * 40 + 60) : 0

    return NextResponse.json({
      stats: {
        totalCases,
        activeCases,
        documentsGenerated,
        upcomingHearings: upcomingHearings.length,
        winRate,
      },
      recentActivities,
      upcomingHearings,
    })
  } catch (error) {
    console.error("Lawyer dashboard error:", error)
    return NextResponse.json({ message: "Failed to fetch dashboard data" }, { status: 500 })
  }
}

function formatActivityTitle(action: string, metadata: any): string {
  switch (action) {
    case "document_generated":
      return `Generated ${metadata?.template_name || "document"}`
    case "case_created":
      return `Created new case`
    case "ai_arguments_generated":
      return `Generated AI arguments`
    case "win_prediction_generated":
      return `Generated win prediction`
    default:
      return action.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }
}

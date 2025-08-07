import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import { fetchCasesFromECourt } from "@/lib/ecourt"

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

    // Get user's bar council ID for eCourt API
    const { data: user } = await supabase.from("users").select("bar_council_id").eq("id", decoded.userId).single()

    if (!user?.bar_council_id) {
      return NextResponse.json({ message: "Bar Council ID not found" }, { status: 400 })
    }

    // Fetch cases from eCourt API
    const eCourtCases = await fetchCasesFromECourt(user.bar_council_id)

    // Sync with local database
    for (const eCase of eCourtCases) {
      await supabase
        .from("cases")
        .upsert({
          user_id: decoded.userId,
          title: eCase.title,
          case_number: eCase.caseNumber,
          court: eCase.court,
          judge_name: eCase.judge,
          status: eCase.status,
          stage: eCase.stage,
          next_hearing: eCase.nextHearing,
          filed_date: eCase.filingDate,
          ecourt_case_id: eCase.caseNumber,
        })
        .match({ ecourt_case_id: eCase.caseNumber, user_id: decoded.userId })
    }

    // Get updated cases from database
    const { data: cases, error } = await supabase
      .from("cases")
      .select("*")
      .eq("user_id", decoded.userId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Log usage analytics
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "ecourt_cases_fetched",
      resource_type: "case",
      metadata: { cases_count: cases.length },
    })

    return NextResponse.json({ cases })
  } catch (error) {
    console.error("eCourt cases fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch cases" }, { status: 500 })
  }
}

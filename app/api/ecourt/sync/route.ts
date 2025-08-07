import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import { syncCaseData } from "@/lib/ecourt"

export async function POST(request: NextRequest) {
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

    const { caseId } = await request.json()

    if (!caseId) {
      return NextResponse.json({ message: "Case ID is required" }, { status: 400 })
    }

    // Get case from database
    const { data: localCase, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", caseId)
      .eq("user_id", decoded.userId)
      .single()

    if (error || !localCase) {
      return NextResponse.json({ message: "Case not found" }, { status: 404 })
    }

    // Sync with eCourt API
    const eCourtData = await syncCaseData(localCase.ecourt_case_id)

    // Update local database
    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update({
        status: eCourtData.status,
        stage: eCourtData.stage,
        next_hearing: eCourtData.nextHearing,
        judge_name: eCourtData.judge,
        updated_at: new Date().toISOString(),
      })
      .eq("id", caseId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Log sync activity
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "case_synced",
      resource_type: "case",
      resource_id: caseId,
      metadata: { ecourt_case_id: localCase.ecourt_case_id },
    })

    return NextResponse.json({ case: updatedCase })
  } catch (error) {
    console.error("Case sync error:", error)
    return NextResponse.json({ message: "Failed to sync case data" }, { status: 500 })
  }
}

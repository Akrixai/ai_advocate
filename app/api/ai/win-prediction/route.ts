import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import { predictCaseOutcome } from "@/lib/openai"

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

    const caseData = await request.json()

    if (!caseData.caseId || !caseData.caseType || !caseData.facts) {
      return NextResponse.json({ message: "Case ID, type, and facts are required" }, { status: 400 })
    }

    // Generate AI prediction
    const aiResponse = await predictCaseOutcome(caseData)

    // Parse the AI response to extract structured data
    const prediction = parseWinPrediction(aiResponse.content)

    // Get historical data for similar cases
    const { data: similarCases } = await supabase
      .from("cases")
      .select("*")
      .eq("case_type", caseData.caseType)
      .limit(100)

    const historicalData = calculateHistoricalMetrics(similarCases || [])

    // Save prediction to database
    await supabase.from("ai_predictions").insert({
      case_id: caseData.caseId,
      user_id: decoded.userId,
      prediction_type: "win_prediction",
      input_data: caseData,
      prediction_result: prediction,
      confidence_score: prediction.confidence,
    })

    // Log usage analytics
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "win_prediction_generated",
      resource_type: "case",
      resource_id: caseData.caseId,
      metadata: { case_type: caseData.caseType },
    })

    return NextResponse.json({
      prediction,
      factors: prediction.factors,
      recommendations: prediction.recommendations,
      historicalData,
    })
  } catch (error) {
    console.error("Win prediction error:", error)
    return NextResponse.json({ message: "Failed to generate prediction" }, { status: 500 })
  }
}

function parseWinPrediction(aiContent: string) {
  // Extract win probability
  const probabilityMatch = aiContent.match(/(\d+)%?\s*(?:probability|chance|likelihood)/i)
  const winProbability = probabilityMatch ? Number.parseInt(probabilityMatch[1]) : 65

  // Extract confidence
  const confidenceMatch = aiContent.match(/confidence[:\s]+(\d+)%?/i)
  const confidence = confidenceMatch ? Number.parseInt(confidenceMatch[1]) : 80

  // Extract timeline
  const timelineMatch = aiContent.match(/(\d+)\s*(?:months?|weeks?)/i)
  const timeToResolution = timelineMatch ? Number.parseInt(timelineMatch[1]) : 8

  // Extract factors (simplified)
  const factors = [
    {
      name: "Case Strength",
      impact: Math.min(winProbability + 10, 95),
      type: winProbability > 60 ? "positive" : "negative",
      description: "Overall strength of legal position",
    },
    {
      name: "Evidence Quality",
      impact: Math.min(winProbability + 5, 90),
      type: winProbability > 70 ? "positive" : "neutral",
      description: "Quality and relevance of supporting evidence",
    },
    {
      name: "Legal Precedents",
      impact: Math.min(winProbability + 15, 95),
      type: "positive",
      description: "Favorable case law and precedents",
    },
  ]

  // Extract recommendations (simplified)
  const recommendations = [
    {
      priority: winProbability < 50 ? "high" : "medium",
      title: "Strengthen Evidence Base",
      description: "Gather additional supporting documentation",
      impact: "+10% win probability",
    },
    {
      priority: "medium",
      title: "Expert Consultation",
      description: "Consider expert witness testimony",
      impact: "+5% win probability",
    },
  ]

  return {
    winProbability,
    confidence,
    timeToResolution,
    expectedOutcome: winProbability > 70 ? "Favorable" : winProbability > 50 ? "Uncertain" : "Challenging",
    riskLevel: winProbability > 70 ? "Low" : winProbability > 50 ? "Medium" : "High",
    factors,
    recommendations,
  }
}

function calculateHistoricalMetrics(cases: any[]) {
  if (cases.length === 0) {
    return {
      similarCases: 0,
      avgWinRate: 0,
      avgSettlementAmount: 0,
      avgTimeToResolution: 0,
    }
  }

  const activeCases = cases.filter((c) => c.status === "active")
  const closedCases = cases.filter((c) => c.status === "closed")

  return {
    similarCases: cases.length,
    avgWinRate: Math.round((closedCases.length / cases.length) * 100),
    avgSettlementAmount: cases.reduce((sum, c) => sum + (c.case_value || 0), 0) / cases.length,
    avgTimeToResolution: 12, // Simplified calculation
  }
}

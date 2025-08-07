import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import { generateLegalArgument } from "@/lib/openai"
import { getJudgeHistory } from "@/lib/ecourt"

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

    const { caseId, judgeId, caseType, facts } = await request.json()

    if (!caseId || !caseType || !facts) {
      return NextResponse.json({ message: "Case ID, type, and facts are required" }, { status: 400 })
    }

    // Get judge history if available
    let judgeAnalysis = null
    if (judgeId) {
      try {
        judgeAnalysis = await getJudgeHistory(judgeId)
      } catch (error) {
        console.error("Failed to get judge history:", error)
      }
    }

    // Generate AI arguments
    const prompt = `Generate legal arguments for the following case:

Case Type: ${caseType}
Facts: ${facts}
${judgeAnalysis ? `Judge Analysis: ${JSON.stringify(judgeAnalysis)}` : ""}

Please provide:
1. 3-5 strong legal arguments
2. Supporting evidence for each argument
3. Relevant case precedents
4. Potential counterarguments
5. Success probability for each argument

Format the response as a structured JSON with the following format:
{
  "arguments": [
    {
      "mainPoint": "string",
      "category": "string",
      "strength": "high|medium|low",
      "successRate": number,
      "evidence": ["string"],
      "precedents": ["string"],
      "counterarguments": "string"
    }
  ]
}`

    const aiResponse = await generateLegalArgument(prompt)

    // Attempt to parse the AI response as JSON
    let parsedArguments;
    try {
      parsedArguments = JSON.parse(aiResponse.content);
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // If JSON parsing fails, create a structured response
      parsedArguments = {
        arguments: [
          {
            mainPoint: aiResponse.content,
            category: "General",
            strength: "medium",
            successRate: 70,
            evidence: ["AI-generated analysis"],
            precedents: ["To be researched"],
            counterarguments: "Requires further analysis",
          },
        ],
      };
    }

    // Save AI prediction to database
    await supabase.from("ai_predictions").insert({
      case_id: caseId,
      user_id: decoded.userId,
      prediction_type: "argument_generation",
      input_data: { caseType, facts, judgeId },
      prediction_result: parsedArguments,
      confidence_score: 85, // Default confidence
    })

    // Log usage analytics
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "ai_arguments_generated",
      resource_type: "case",
      resource_id: caseId,
      metadata: { judge_id: judgeId, case_type: caseType },
    })

    return NextResponse.json(parsedArguments)
  } catch (error) {
    console.error("AI argument generation error:", error)
    return NextResponse.json({ message: "Failed to generate arguments" }, { status: 500 })
  }
}

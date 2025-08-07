import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    try {
      const decoded = verifyJWT(token)
      if (decoded.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    const { data: templates, error } = await supabase
      .from("templates")
      .select("*")
      .order("created_at", { ascending: false })
    if (error) {
      throw error
    }
    return NextResponse.json({ templates })
  } catch (error) {
    console.error("Templates fetch error:", error)
    return NextResponse.json({ message: "Failed to fetch templates" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    let decoded;
    try {
      decoded = verifyJWT(token)
      if (decoded.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    const templateData = await request.json()
    // Extract placeholders from content
    const placeholderRegex = /\{\{([^}]+)\}\}/g
    const placeholders: string[] = []
    let match
    while ((match = placeholderRegex.exec(templateData.content)) !== null) {
      if (!placeholders.includes(`{{${match[1]}}}`)) {
        placeholders.push(`{{${match[1]}}}`)
      }
    }
    // Ensure required fields are present
    if (!templateData.name || !templateData.category || !templateData.content) {
      return NextResponse.json({ 
        message: "Missing required fields: name, category, and content are required" 
      }, { status: 400 })
    }
    // Insert template with RLS bypass using RPC
    const { data, error } = await supabase.rpc('create_template', {
      p_name: templateData.name,
      p_description: templateData.description || '',
      p_category: templateData.category,
      p_content: templateData.content,
      p_placeholders: placeholders,
      p_required_documents: templateData.requiredDocuments || [],
      p_language: templateData.language || 'english',
      p_created_by: decoded.userId
    })
    if (error) {
      console.error("Template creation error:", error)
      throw error
    }
    // Fetch the created template
    const { data: template, error: fetchError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", data)
      .single()
    if (fetchError) {
      console.error("Template fetch error:", fetchError)
      throw fetchError
    }
    // Log template creation
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "template_created",
      resource_type: "template",
      resource_id: template.id,
      metadata: { template_name: template.name, category: template.category },
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (error) {
    console.error("Template creation error:", error)
    return NextResponse.json({ message: "Failed to create template" }, { status: 500 })
  }
}

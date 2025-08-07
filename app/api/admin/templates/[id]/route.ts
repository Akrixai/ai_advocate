import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { error } = await supabase.from("templates").delete().eq("id", params.id)

    if (error) {
      throw error
    }

    // Log template deletion
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "template_deleted",
      resource_type: "template",
      resource_id: params.id,
    })

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Template deletion error:", error)
    return NextResponse.json({ message: "Failed to delete template" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const templateData = await request.json()

    // Extract placeholders from content
    const placeholderRegex = /\{\{([^}]+)\}\}/g
    const placeholders = []
    let match
    while ((match = placeholderRegex.exec(templateData.content)) !== null) {
      if (!placeholders.includes(`{{${match[1]}}}`)) {
        placeholders.push(`{{${match[1]}}}`)
      }
    }

    const { data: template, error } = await supabase
      .from("templates")
      .update({
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        content: templateData.content,
        placeholders,
        required_documents: templateData.requiredDocuments,
        language: templateData.language,
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Log template update
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "template_updated",
      resource_type: "template",
      resource_id: params.id,
      metadata: { template_name: template.name },
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error("Template update error:", error)
    return NextResponse.json({ message: "Failed to update template" }, { status: 500 })
  }
}

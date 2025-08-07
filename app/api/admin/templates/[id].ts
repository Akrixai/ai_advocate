import { NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verify admin access
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    let decoded
    try {
      decoded = verifyJWT(token)
      if (decoded.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }
    const { id } = params
    const { error } = await supabase.from("templates").delete().eq("id", id)
    if (error) {
      throw error
    }
    return NextResponse.json({ message: "Template deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Template delete error:", error)
    return NextResponse.json({ message: "Failed to delete template" }, { status: 500 })
  }
}

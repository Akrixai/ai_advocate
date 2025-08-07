import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Fetch only active templates for all users
    const { data: templates, error } = await supabase
      .from("templates")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ templates })
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch templates" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/auth/jwt"

// PUT /api/admin/settings/[key] - Update a specific setting
export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { key } = params

    // Verify admin access
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    
    let payload;
    try {
      payload = await verifyJWT(token)
      
      // Verify admin access
      if (payload.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Parse request body
    const { value } = await request.json()
    if (!value) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Check if setting exists
    const { data: existingSetting, error: fetchError } = await supabase
      .from("system_settings")
      .select("*")
      .eq("key", key)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      console.error(`Error fetching setting ${key}:`, fetchError)
      return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 })
    }

    let result

    if (!existingSetting) {
      // Create new setting if it doesn't exist
      const { data, error } = await supabase
        .from("system_settings")
        .insert({
          key,
          value,
          description: `${key} configuration`,
          updated_by: payload.sub,
        })
        .select()

      if (error) {
        console.error(`Error creating setting ${key}:`, error)
        return NextResponse.json({ error: "Failed to create setting" }, { status: 500 })
      }

      result = data
    } else {
      // Update existing setting
      const { data, error } = await supabase
        .from("system_settings")
        .update({
          value,
          updated_by: payload.sub,
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)
        .select()

      if (error) {
        console.error(`Error updating setting ${key}:`, error)
        return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json({ setting: result[0] })
  } catch (error) {
    console.error(`Error in settings [${params.key}] PUT route:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET /api/admin/settings/[key] - Get a specific setting
export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const { key } = params

    // Verify admin access
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    
    let payload;
    try {
      payload = await verifyJWT(token)
      
      // Verify admin access
      if (payload.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Fetch setting
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("key", key)
      .single()

    if (error) {
      console.error(`Error fetching setting ${key}:`, error)
      return NextResponse.json({ error: "Failed to fetch setting" }, { status: 500 })
    }

    return NextResponse.json({ setting: data })
  } catch (error) {
    console.error(`Error in settings [${params.key}] GET route:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
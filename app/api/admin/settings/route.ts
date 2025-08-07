import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { verifyJWT } from "@/lib/auth/jwt"

// GET /api/admin/settings - Get all system settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    
    let decoded;
    try {
      decoded = await verifyJWT(token)
      
      // Verify admin access
       if (decoded.userType !== "admin") {
         return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
       }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Fetch all settings
    const { data: settings, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("key")

    if (error) {
      console.error("Error fetching settings:", error)
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error in settings GET route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/admin/settings - Update multiple settings at once
export async function PUT(request: NextRequest) {
  try {
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
    const { settings } = await request.json()
    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Update each setting
    const updatePromises = settings.map(async (setting) => {
      const { data, error } = await supabase
        .from("system_settings")
        .update({
          value: setting.value,
          updated_by: payload.userId,
          updated_at: new Date().toISOString(),
        })
        .eq("key", setting.key)
        .select()

      if (error) {
        console.error(`Error updating setting ${setting.key}:`, error)
        throw error
      }

      return data
    })

    // Wait for all updates to complete
    await Promise.all(updatePromises)

    // Fetch updated settings
    const { data: updatedSettings, error } = await supabase
      .from("system_settings")
      .select("*")
      .order("key")

    if (error) {
      console.error("Error fetching updated settings:", error)
      return NextResponse.json({ error: "Failed to fetch updated settings" }, { status: 500 })
    }

    return NextResponse.json({ settings: updatedSettings })
  } catch (error) {
    console.error("Error in settings PUT route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
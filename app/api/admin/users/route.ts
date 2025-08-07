import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"

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
      
      // Verify admin access
      if (decoded.userType !== "admin") {
        return NextResponse.json({ message: "Unauthorized - Admin access required" }, { status: 403 })
      }
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get("page") || "1")
    const limit = parseInt(url.searchParams.get("limit") || "10")
    const search = url.searchParams.get("search") || ""
    const userType = url.searchParams.get("userType") || ""
    const status = url.searchParams.get("status") || ""
    
    // Calculate offset
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from("users")
      .select("id, first_name, last_name, email, phone, bar_council_id, user_type, is_active, created_at, last_login", { count: "exact" })
    
    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,bar_council_id.ilike.%${search}%`)
    }
    
    if (userType) {
      query = query.eq("user_type", userType)
    }
    
    if (status === "active") {
      query = query.eq("is_active", true)
    } else if (status === "inactive") {
      query = query.eq("is_active", false)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })
    
    // Execute query
    const { data: users, count, error } = await query
    
    if (error) {
      throw error
    }

    // Get subscription data for users
    const { data: subscriptions } = await supabase
      .from("subscriptions")
      .select("user_id, plan_name, status, current_period_end")
      .in("user_id", users?.map(user => user.id) || [])
      .eq("status", "active")
    
    // Combine user data with subscription info
    const usersWithSubscriptions = users?.map(user => {
      const subscription = subscriptions?.find(sub => sub.user_id === user.id)
      return {
        ...user,
        subscription: subscription ? {
          plan: subscription.plan_name,
          status: subscription.status,
          expiresAt: subscription.current_period_end
        } : null
      }
    })

    return NextResponse.json({
      users: usersWithSubscriptions || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error("Admin users API error:", error)
    return NextResponse.json({ message: "Failed to fetch users data" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
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

    // Get user data from request body
    const { userId, isActive } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }
    
    // Update user status
    const { error } = await supabase
      .from("users")
      .update({ is_active: isActive })
      .eq("id", userId)
    
    if (error) {
      throw error
    }
    
    // Log action
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: isActive ? "user_activated" : "user_deactivated",
      resource_type: "user",
      resource_id: userId,
    })

    return NextResponse.json({ message: `User ${isActive ? "activated" : "deactivated"} successfully` })
  } catch (error) {
    console.error("Admin user update error:", error)
    return NextResponse.json({ message: "Failed to update user status" }, { status: 500 })
  }
}
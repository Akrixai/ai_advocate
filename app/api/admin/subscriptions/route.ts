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
    const status = url.searchParams.get("status") || ""
    const plan = url.searchParams.get("plan") || ""
    
    // Calculate offset
    const offset = (page - 1) * limit

    // Build query for subscriptions with user details
    let query = supabase
      .from("subscriptions")
      .select(
        `
        id, 
        user_id, 
        plan_name, 
        amount, 
        status, 
        razorpay_subscription_id, 
        current_period_start, 
        current_period_end, 
        created_at, 
        updated_at,
        users!subscriptions_user_id_fkey(id, first_name, last_name, email, phone, bar_council_id)
        `,
        { count: "exact" }
      )
    
    // Apply filters
    if (search) {
      query = query.or(`users.first_name.ilike.%${search}%,users.last_name.ilike.%${search}%,users.email.ilike.%${search}%,razorpay_subscription_id.ilike.%${search}%`)
    }
    
    if (status) {
      query = query.eq("status", status)
    }
    
    if (plan) {
      query = query.eq("plan_name", plan)
    }
    
    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", { ascending: false })
    
    // Execute query
    const { data: subscriptions, count, error } = await query
    
    if (error) {
      throw error
    }

    // Get available plans
    const { data: plans } = await supabase
      .from("subscriptions")
      .select("plan_name")
      .order("plan_name")
      .limit(100)
    
    // Extract unique plan names
    const uniquePlans = [...new Set(plans?.map(p => p.plan_name))]

    // Format subscription data
    const formattedSubscriptions = subscriptions?.map(subscription => ({
      id: subscription.id,
      userId: subscription.user_id,
      userName: `${subscription.users.first_name} ${subscription.users.last_name}`,
      userEmail: subscription.users.email,
      userPhone: subscription.users.phone,
      barCouncilId: subscription.users.bar_council_id,
      plan: subscription.plan_name,
      amount: subscription.amount,
      status: subscription.status,
      razorpayId: subscription.razorpay_subscription_id,
      startDate: subscription.current_period_start,
      endDate: subscription.current_period_end,
      createdAt: subscription.created_at
    }))

    return NextResponse.json({
      subscriptions: formattedSubscriptions || [],
      plans: uniquePlans || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })
  } catch (error) {
    console.error("Admin subscriptions API error:", error)
    return NextResponse.json({ message: "Failed to fetch subscriptions data" }, { status: 500 })
  }
}
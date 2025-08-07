import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { createClient } from "@supabase/supabase-js"
import { generateJWT } from "@/lib/auth/jwt"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json()

    // Validate input
    if (!email || !password || !userType) {
      return NextResponse.json({ message: "Email, password, and user type are required" }, { status: 400 })
    }

    // Find user in database
    console.log(`Attempting to find user with email: ${email} and type: ${userType}`)
    
    // Use RPC to bypass RLS policies
    const { data: users, error } = await supabase.rpc('get_user_by_email_and_type', {
      p_email: email,
      p_user_type: userType
    })
    
    const user = users && users.length > 0 ? users[0] : null
    
    if (error) {
      console.error("Database error:", error)
    }
    
    if (!user) {
      console.log("No user found with the provided credentials")
    }

    if (error || !user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    console.log(`Attempting to verify password for user: ${user.email}`)
    try {
      const isValidPassword = await bcrypt.compare(password, user.password_hash)
      console.log(`Password verification result: ${isValidPassword}`)
      
      if (!isValidPassword) {
        return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
      }
    } catch (error) {
      console.error("Password verification error:", error)
      return NextResponse.json({ message: "Error verifying credentials" }, { status: 500 })
    }

    // Generate JWT token
    console.log(`Generating token for user: ${user.email} with ID: ${user.id}`)
    let token;
    try {
      token = generateJWT({
        userId: user.id,
        email: user.email,
        userType: user.user_type,
      })
      console.log('Token generated successfully')
    } catch (error) {
      console.error('Token generation error:', error)
      return NextResponse.json({ message: "Error generating authentication token" }, { status: 500 })
    }

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      userType: user.user_type,
      avatar: user.avatar_url,
    }

    return NextResponse.json({
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      barCouncilId,
      specialization,
      experience,
      userType = "lawyer",
    } = await request.json()

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone || !barCouncilId) {
      return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: passwordHash,
        phone,
        bar_council_id: barCouncilId,
        specialization,
        experience,
        user_type: userType,
        is_active: true,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ message: "Failed to create user account" }, { status: 500 })
    }

    return NextResponse.json({ message: "User registered successfully", userId: newUser.id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

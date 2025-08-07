import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { templateId, signature, userId } = await req.json()
    if (!templateId || !signature || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }
    // Store signature as base64 string in Supabase
    const { error } = await supabase
      .from("document_signatures")
      .insert({ template_id: templateId, user_id: userId, signature })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (e) {
    const message = typeof e === "object" && e && "message" in e ? (e as any).message : String(e)
    return NextResponse.json({ error: message || "Unknown error" }, { status: 500 })
  }
}

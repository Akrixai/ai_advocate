import { NextRequest, NextResponse } from "next/server"
import { processImageWithOCR } from "@/lib/ocr"

export const runtime = "edge"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 })
    }
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const ocrResult = await processImageWithOCR(buffer)
    return NextResponse.json({ ocrResult })
  } catch (error) {
    console.error("OCR processing error:", error)
    return NextResponse.json({ message: "Failed to process document" }, { status: 500 })
  }
}

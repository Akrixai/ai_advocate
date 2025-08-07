import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import { processImageWithOCR } from "@/lib/ocr"
import { generateDocumentFromTemplate } from "@/lib/openai"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.split(" ")[1]
    
    if (!token) {
      return NextResponse.json({ message: "Authentication required" }, { status: 401 })
    }
    
    let decoded;
    try {
      decoded = verifyJWT(token)
    } catch (error) {
      console.error("JWT verification error:", error)
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    const templateId = formData.get("template") as string
    const language = (formData.get("language") as string) || "english"

    if (!files.length || !templateId) {
      return NextResponse.json({ message: "Files and template are required" }, { status: 400 })
    }

    // Get template from database
    const { data: template, error: templateError } = await supabase
      .from("templates")
      .select("*")
      .eq("id", templateId)
      .single()

    if (templateError || !template) {
      return NextResponse.json({ message: "Template not found" }, { status: 404 })
    }

    // Process files with OCR and store in Supabase Storage
    const extractedData: Record<string, string> = {}
    const processedFiles = []
    const fileUrls = []

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const fileId = uuidv4()
      const fileName = `${decoded.userId}/${fileId}-${file.name}`

      try {
        // Upload file to Supabase Storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('documents')
          .upload(fileName, buffer, {
            contentType: file.type,
            cacheControl: '3600',
          })

        if (storageError) {
          throw new Error(`File upload failed: ${storageError.message}`)
        }

        // Get public URL for the file
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        fileUrls.push(publicUrl)

        // Process with OCR
        const ocrResult = await processImageWithOCR(buffer)
        Object.assign(extractedData, ocrResult.extractedData)

        processedFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          path: fileName,
          url: publicUrl,
          extractedText: ocrResult.text,
          confidence: ocrResult.confidence,
        })
      } catch (error) {
        console.error(`Processing failed for ${file.name}:`, error)
      }
    }

    // Generate document from template
    const generatedContent = await generateDocumentFromTemplate(template.content, extractedData, language)

    // Save document to database
    const { data: document, error: docError } = await supabase
      .from("documents")
      .insert({
        user_id: decoded.userId,
        template_id: templateId,
        template_name: template.name,
        original_files: processedFiles,
        extracted_data: extractedData,
        generated_content: generatedContent,
        file_url: fileUrls.length > 0 ? fileUrls[0] : null,
        file_type: files.length > 0 ? files[0].type : null,
        language,
        status: "completed",
      })
      .select()
      .single()

    if (docError) {
      throw docError
    }

    // Log usage analytics
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "document_generated",
      resource_type: "document",
      resource_id: document.id,
      metadata: {
        template_id: templateId,
        template_name: template.name,
        files_processed: files.length,
        language,
      },
    })

    return NextResponse.json({
      extractedData,
      generatedDocument: generatedContent,
      documentId: document.id,
      processedFiles,
      fileUrls,
    })
  } catch (error) {
    console.error("Document processing error:", error)
    return NextResponse.json({ message: "Failed to process document", error: error.message }, { status: 500 })
  }
}

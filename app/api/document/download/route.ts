import { type NextRequest, NextResponse } from "next/server"
import { verifyJWT } from "@/lib/auth/jwt"
import { supabase } from "@/lib/supabase"
import PDFDocument from "pdfkit"
import { Document, Packer, Paragraph, TextRun } from "docx"

export async function POST(request: NextRequest) {
  try {
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

    const { documentId, format, signature } = await request.json()

    if (!documentId || !format) {
      return NextResponse.json({ message: "Document ID and format are required" }, { status: 400 })
    }

    // Get document from database
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("user_id", decoded.userId)
      .single()

    if (error || !document) {
      return NextResponse.json({ message: "Document not found" }, { status: 404 })
    }

    let fileBuffer: Buffer
    let contentType: string
    let filename: string

    if (format === "pdf") {
      fileBuffer = await generatePDF(document.generated_content, signature)
      contentType = "application/pdf"
      filename = `${document.template_name}_${document.id}.pdf`
    } else if (format === "docx") {
      fileBuffer = await generateDOCX(document.generated_content)
      contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      filename = `${document.template_name}_${document.id}.docx`
    } else {
      return NextResponse.json({ message: "Unsupported format" }, { status: 400 })
    }

    // Update document with signature if provided
    if (signature) {
      await supabase.from("documents").update({ signature_data: signature }).eq("id", documentId)
    }

    // Log download analytics
    await supabase.from("usage_analytics").insert({
      user_id: decoded.userId,
      action: "document_downloaded",
      resource_type: "document",
      resource_id: documentId,
      metadata: { format, has_signature: !!signature },
    })

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Document download error:", error)
    return NextResponse.json({ message: "Failed to download document" }, { status: 500 })
  }
}

async function generatePDF(content: string, signature?: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument()
      const buffers: Buffer[] = []

      doc.on("data", buffers.push.bind(buffers))
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(buffers)
        resolve(pdfBuffer)
      })

      // Add content
      doc.fontSize(12).text(content, {
        align: "left",
        lineGap: 5,
      })

      // Add signature if provided
      if (signature) {
        doc.moveDown(2)
        doc.text("Digital Signature:", { underline: true })
        doc.moveDown(1)
        // In a real implementation, you would decode and add the signature image
        doc.text("[Digital Signature Applied]")
      }

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

async function generateDOCX(content: string): Promise<Buffer> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content.split("\n").map(
          (line) =>
            new Paragraph({
              children: [new TextRun(line)],
            }),
        ),
      },
    ],
  })

  return await Packer.toBuffer(doc)
}

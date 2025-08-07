import { createWorker } from "tesseract.js"
import { OCRResult } from "./ocr"

export async function processDocumentWithTesseract(imageBuffer: Buffer): Promise<OCRResult> {
  const worker = await createWorker("eng")

  try {
    const {
      data: { text, confidence },
    } = await worker.recognize(imageBuffer)

    // Extract specific data patterns
    const extractedData = extractDataFromText(text)

    return {
      text,
      confidence,
      extractedData,
    }
  } finally {
    await worker.terminate()
  }
}

// Helper function to extract structured data from OCR text
function extractDataFromText(text: string): Record<string, string> {
  const extractedData: Record<string, string> = {}

  // Extract name patterns (e.g., "Name: John Doe" or "NAME: JOHN DOE")
  const nameMatch = text.match(/(?:Name|NAME)\s*:?\s*([^\n\r]+)/)
  if (nameMatch && nameMatch[1]) {
    extractedData.name = nameMatch[1].trim()
  }

  // Extract address patterns
  const addressMatch = text.match(/(?:Address|ADDRESS)\s*:?\s*([^\n\r]+(?:[\n\r]+[^\n\r]+){0,3})/)
  if (addressMatch && addressMatch[1]) {
    extractedData.address = addressMatch[1].trim().replace(/\s+/g, " ")
  }

  // Extract date patterns (various formats)
  const dateMatch = text.match(/(?:Date|DATE)\s*:?\s*([0-9]{1,2}[\/-][0-9]{1,2}[\/-][0-9]{2,4}|[0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+[0-9]{2,4})/i)
  if (dateMatch && dateMatch[1]) {
    extractedData.date = dateMatch[1].trim()
  }

  // Extract ID numbers (Aadhaar, PAN, etc.)
  const aadhaarMatch = text.match(/(?:Aadhaar|AADHAAR|UID)\s*:?\s*([0-9\s]{12,14})/)
  if (aadhaarMatch && aadhaarMatch[1]) {
    extractedData.aadhaar = aadhaarMatch[1].replace(/\s+/g, "")
  }

  const panMatch = text.match(/(?:PAN|Pan)\s*:?\s*([A-Z0-9]{10})/)
  if (panMatch && panMatch[1]) {
    extractedData.pan = panMatch[1]
  }

  // Extract case numbers
  const caseMatch = text.match(/(?:Case\s+No|CASE\s+NO|Case\s+Number|CASE\s+NUMBER)\s*:?\s*([A-Z0-9\s\/\-]+)/i)
  if (caseMatch && caseMatch[1]) {
    extractedData.case_number = caseMatch[1].trim()
  }

  // Extract court name
  const courtMatch = text.match(/(?:Court|COURT)\s*:?\s*([^\n\r]+)/)
  if (courtMatch && courtMatch[1]) {
    extractedData.court = courtMatch[1].trim()
  }

  // Extract amounts/values
  const amountMatch = text.match(/(?:Amount|AMOUNT|Rs\.?|INR)\s*:?\s*([0-9,\.]+)/)
  if (amountMatch && amountMatch[1]) {
    extractedData.amount = amountMatch[1].trim()
  }

  return extractedData
}
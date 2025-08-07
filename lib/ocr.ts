import { createWorker } from "tesseract.js"

export interface OCRResult {
  text: string
  confidence: number
  extractedData: Record<string, string>
}

export async function processImageWithOCR(imageBuffer: Buffer): Promise<OCRResult> {
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

function extractDataFromText(text: string): Record<string, string> {
  const data: Record<string, string> = {}

  // Aadhaar number pattern
  const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b/)
  if (aadhaarMatch) {
    data.aadhaar_number = aadhaarMatch[0].replace(/\s/g, "")
  }

  // PAN number pattern
  const panMatch = text.match(/\b[A-Z]{5}\d{4}[A-Z]\b/)
  if (panMatch) {
    data.pan_number = panMatch[0]
  }

  // Name extraction (basic pattern)
  const nameMatch = text.match(/Name[:\s]+([A-Z\s]+)/i)
  if (nameMatch) {
    data.name = nameMatch[1].trim()
  }

  // Date of birth pattern
  const dobMatch = text.match(/(\d{2}[/-]\d{2}[/-]\d{4})/g)
  if (dobMatch) {
    data.date_of_birth = dobMatch[0]
  }

  // Address extraction (basic pattern)
  const addressMatch = text.match(/Address[:\s]+([A-Za-z0-9\s,.-]+)/i)
  if (addressMatch) {
    data.address = addressMatch[1].trim()
  }

  return data
}

// Alternative OCR using Google Vision API
// export async function processImageWithGoogleVision(imageBuffer: Buffer): Promise<OCRResult> {
//   const vision = require("@google-cloud/vision")
//   const client = new vision.ImageAnnotatorClient()

//   try {
//     const [result] = await client.textDetection({
//       image: { content: imageBuffer },
//     })

//     const detections = result.textAnnotations
//     const text = detections[0]?.description || ""
//     const confidence = 0.9 // Google Vision doesn't provide confidence for text detection

//     const extractedData = extractDataFromText(text)

//     return {
//       text,
//       confidence,
//       extractedData,
//     }
//   } catch (error) {
//     throw new Error(`Google Vision OCR failed: ${error}`)
//   }
// }

// // AWS Textract OCR
// export async function processImageWithTextract(imageBuffer: Buffer): Promise<OCRResult> {
//   const AWS = require("aws-sdk")
//   const textract = new AWS.Textract({
//     region: process.env.AWS_REGION,
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   })

//   try {
//     const params = {
//       Document: {
//         Bytes: imageBuffer,
//       },
//       FeatureTypes: ["TABLES", "FORMS"],
//     }

//     const result = await textract.analyzeDocument(params).promise()
//     let text = ""
//     let confidence = 0

//     result.Blocks.forEach((block: any) => {
//       if (block.BlockType === "LINE") {
//         text += block.Text + "\n"
//         confidence += block.Confidence
//       }
//     })

//     confidence = confidence / result.Blocks.filter((b: any) => b.BlockType === "LINE").length

//     const extractedData = extractDataFromText(text)

//     return {
//       text,
//       confidence: confidence / 100,
//       extractedData,
//     }
//   } catch (error) {
//     throw new Error(`AWS Textract OCR failed: ${error}`)
//   }
// }

import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export async function generateLegalArgument(prompt: string, context?: any): Promise<AIResponse> {
  try {
    const systemPrompt = `You are an expert legal AI assistant specializing in Indian law. 
    Provide well-structured, legally sound arguments with relevant case citations and precedents.
    Always maintain professional legal language and cite relevant sections of law where applicable.`

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: Number.parseInt(process.env.OPENAI_MAX_TOKENS || "2000"),
      temperature: 0.7,
    })

    return {
      content: completion.choices[0]?.message?.content || "",
      usage: completion.usage,
    }
  } catch (error) {
    throw new Error(`OpenAI API error: ${error}`)
  }
}

export async function predictCaseOutcome(caseData: any): Promise<AIResponse> {
  const prompt = `Analyze the following case data and predict the likely outcome:
  
  Case Type: ${caseData.caseType}
  Facts: ${caseData.facts}
  Judge: ${caseData.judge}
  Court: ${caseData.court}
  Case Value: ${caseData.caseValue}
  
  Provide:
  1. Win probability percentage
  2. Key factors affecting the outcome
  3. Risk analysis
  4. Recommendations for improving chances
  5. Expected timeline for resolution`

  return generateLegalArgument(prompt, caseData)
}

export async function generateDocumentFromTemplate(
  template: string,
  extractedData: Record<string, string>,
  language = "english",
): Promise<string> {
  let processedTemplate = template

  // Replace placeholders with extracted data
  Object.entries(extractedData).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, "g"), value)
  })

  // If translation is needed
  if (language !== "english") {
    const translatedContent = await translateText(processedTemplate, language)
    return translatedContent
  }

  return processedTemplate
}

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following legal document to ${targetLanguage}. 
  Maintain legal terminology and formal structure:
  
  ${text}`

  const response = await generateLegalArgument(prompt)
  return response.content
}

export async function checkCompliance(documentText: string): Promise<any> {
  const prompt = `Review the following legal document for compliance with Indian legal standards:
  
  ${documentText}
  
  Provide:
  1. Compliance score (0-100)
  2. List of issues found
  3. Suggestions for improvement
  4. Missing mandatory clauses
  5. Legal risks identified`

  const response = await generateLegalArgument(prompt)

  // Parse the response to extract structured data
  try {
    const content = response.content
    const score = extractScore(content)
    const issues = extractIssues(content)
    const suggestions = extractSuggestions(content)

    return {
      score,
      issues,
      suggestions,
      rawAnalysis: content,
    }
  } catch (error) {
    return {
      score: 0,
      issues: ["Failed to analyze document"],
      suggestions: ["Please review document manually"],
      rawAnalysis: response.content,
    }
  }
}

function extractScore(text: string): number {
  const scoreMatch = text.match(/(\d+)%?\s*(?:score|compliance)/i)
  return scoreMatch ? Number.parseInt(scoreMatch[1]) : 0
}

function extractIssues(text: string): string[] {
  const issuesSection = text.match(/issues?[:\s]+(.*?)(?=suggestions?|$)/is)
  if (!issuesSection) return []

  return issuesSection[1]
    .split(/\d+\.|\n-|\n•/)
    .map((issue) => issue.trim())
    .filter((issue) => issue.length > 0)
}

function extractSuggestions(text: string): string[] {
  const suggestionsSection = text.match(/suggestions?[:\s]+(.*?)$/is)
  if (!suggestionsSection) return []

  return suggestionsSection[1]
    .split(/\d+\.|\n-|\n•/)
    .map((suggestion) => suggestion.trim())
    .filter((suggestion) => suggestion.length > 0)
}

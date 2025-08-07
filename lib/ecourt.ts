interface ECourtCase {
  caseNumber: string
  title: string
  court: string
  judge: string
  nextHearing: string
  status: string
  stage: string
  filingDate: string
}

export async function fetchCasesFromECourt(lawyerId: string): Promise<ECourtCase[]> {
  try {
    const response = await fetch(`${process.env.ECOURT_API_BASE_URL}/cases`, {
      headers: {
        Authorization: `Bearer ${process.env.ECOURT_API_KEY}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        lawyer_id: lawyerId,
        status: "active",
      }),
    })

    if (!response.ok) {
      throw new Error(`eCourt API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.cases || []
  } catch (error) {
    console.error("eCourt API error:", error)
    // Return mock data for development
    return [
      {
        caseNumber: "CC/123/2024",
        title: "Property Dispute - ABC vs XYZ",
        court: "District Court, Delhi",
        judge: "Hon. Justice Sharma",
        nextHearing: "2024-02-15T10:00:00Z",
        status: "active",
        stage: "Evidence",
        filingDate: "2023-08-15",
      },
      {
        caseNumber: "CS/456/2024",
        title: "Contract Breach - Company A vs Company B",
        court: "High Court, Mumbai",
        judge: "Hon. Justice Patel",
        nextHearing: "2024-02-20T14:30:00Z",
        status: "active",
        stage: "Arguments",
        filingDate: "2023-06-20",
      },
    ]
  }
}

export async function syncCaseData(caseId: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.ECOURT_API_BASE_URL}/cases/${caseId}`, {
      headers: {
        Authorization: `Bearer ${process.env.ECOURT_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`eCourt API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("eCourt sync error:", error)
    throw error
  }
}

export async function getJudgeHistory(judgeId: string): Promise<any> {
  try {
    const response = await fetch(`${process.env.ECOURT_API_BASE_URL}/judges/${judgeId}/history`, {
      headers: {
        Authorization: `Bearer ${process.env.ECOURT_API_KEY}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`eCourt API error: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Judge history API error:", error)
    // Return mock data
    return {
      totalCases: 156,
      favorableRate: 68,
      avgHearingTime: 45,
      tendencies: {
        evidenceBased: 92,
        precedentCitations: 85,
        proceduralCompliance: 95,
        settlementPreference: 72,
      },
      insights: [
        {
          type: "strength",
          title: "Evidence Focus",
          description: "Highly values documentary evidence and expert testimony",
        },
        {
          type: "caution",
          title: "Procedural Strictness",
          description: "Less patient with lengthy procedural arguments",
        },
      ],
    }
  }
}

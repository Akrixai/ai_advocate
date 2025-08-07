"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  RefreshCw,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Gavel,
  Search,
  Download,
  Mic,
  MicOff,
} from "lucide-react"
import { LawyerLayout } from "@/components/layouts/lawyer-layout"
import { useToast } from "@/hooks/use-toast"

export default function ECourtIntegrationPage() {
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [draftText, setDraftText] = useState("")
  const [complianceCheck, setComplianceCheck] = useState<any>(null)
  const [citations, setCitations] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    fetchCaseData()
  }, [])

  const fetchCaseData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ecourt/cases", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()

      if (response.ok) {
        setCases(data.cases)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch case data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const syncCourtData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ecourt/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        await fetchCaseData()
        toast({
          title: "Success",
          description: "Court data synchronized successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync court data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    // Implement speech recognition
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event: any) => {
        let transcript = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript
        }
        setDraftText(transcript)
      }

      recognition.start()
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const checkCompliance = async () => {
    try {
      const response = await fetch("/api/ai/compliance-check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: draftText }),
      })

      const data = await response.json()
      if (response.ok) {
        setComplianceCheck(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check compliance",
        variant: "destructive",
      })
    }
  }

  const getCitations = async () => {
    try {
      const response = await fetch("/api/ai/citations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          caseId: selectedCase?.id,
          text: draftText,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setCitations(data.citations)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get citations",
        variant: "destructive",
      })
    }
  }

  return (
    <LawyerLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">eCourt Integration</h1>
            <p className="text-muted-foreground">Real-time court data sync with AI legal co-pilot</p>
          </div>
          <Button onClick={syncCourtData} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Sync Court Data
          </Button>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases">My Cases</TabsTrigger>
            <TabsTrigger value="drafting">AI Drafting</TabsTrigger>
            <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
            <TabsTrigger value="citations">Citations</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cases List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Cases</CardTitle>
                    <CardDescription>Your cases synced from eCourt system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {cases.length > 0 ? (
                        cases.map((caseItem: any, index) => (
                          <div
                            key={index}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedCase?.id === caseItem.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                            }`}
                            onClick={() => setSelectedCase(caseItem)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{caseItem.title}</h3>
                              <Badge variant={caseItem.status === "active" ? "default" : "secondary"}>
                                {caseItem.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-3 w-3" />
                                Next: {caseItem.nextHearing}
                              </div>
                              <div className="flex items-center">
                                <Gavel className="mr-1 h-3 w-3" />
                                {caseItem.judge}
                              </div>
                              <div className="flex items-center">
                                <User className="mr-1 h-3 w-3" />
                                {caseItem.client}
                              </div>
                              <div className="flex items-center">
                                <FileText className="mr-1 h-3 w-3" />
                                Stage: {caseItem.stage}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No cases found. Click sync to fetch your cases.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Case Details */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Case Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedCase ? (
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Case Number</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.caseNumber}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Court</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.court}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Judge</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.judge}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Next Hearing</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.nextHearing}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Case Type</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.type}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Current Stage</Label>
                          <p className="text-sm text-muted-foreground">{selectedCase.stage}</p>
                        </div>
                        <Button className="w-full" size="sm">
                          <FileText className="mr-2 h-4 w-4" />
                          View Case File
                        </Button>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">Select a case to view details</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="drafting" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Speech to Text */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Draft Generator</CardTitle>
                  <CardDescription>Speak or type to generate legal drafts with AI assistance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "default"}
                      size="sm"
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-4 w-4" />
                          Start Recording
                        </>
                      )}
                    </Button>
                    {isRecording && (
                      <Badge variant="destructive" className="animate-pulse">
                        Recording...
                      </Badge>
                    )}
                  </div>

                  <Textarea
                    placeholder="Start speaking or type your draft here..."
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    rows={15}
                    className="resize-none"
                  />

                  <div className="flex space-x-2">
                    <Button onClick={checkCompliance} size="sm" variant="outline">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Check Compliance
                    </Button>
                    <Button onClick={getCitations} size="sm" variant="outline">
                      <Search className="mr-2 h-4 w-4" />
                      Get Citations
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>Real-time suggestions and improvements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-900">Suggestion</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Consider adding more specific legal precedents to strengthen your argument.
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                        <span className="font-medium text-yellow-900">Warning</span>
                      </div>
                      <p className="text-sm text-yellow-800">
                        The cited case law may have been overruled. Please verify current status.
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                        <span className="font-medium text-green-900">Compliance</span>
                      </div>
                      <p className="text-sm text-green-800">Document format meets court requirements.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Checker</CardTitle>
                <CardDescription>AI-powered compliance verification for your legal documents</CardDescription>
              </CardHeader>
              <CardContent>
                {complianceCheck ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">{complianceCheck.score}%</p>
                              <p className="text-sm text-muted-foreground">Compliance Score</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">{complianceCheck.issues?.length || 0}</p>
                              <p className="text-sm text-muted-foreground">Issues Found</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-purple-600">
                                {complianceCheck.suggestions?.length || 0}
                              </p>
                              <p className="text-sm text-muted-foreground">Suggestions</p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {complianceCheck.issues && complianceCheck.issues.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Issues to Address</h3>
                        <div className="space-y-2">
                          {complianceCheck.issues.map((issue: any, index: number) => (
                            <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-start">
                                <AlertCircle className="h-4 w-4 text-red-600 mr-2 mt-0.5" />
                                <div>
                                  <p className="font-medium text-red-900">{issue.title}</p>
                                  <p className="text-sm text-red-800">{issue.description}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">No compliance check performed yet. Generate a draft first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="citations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Legal Citations & Precedents</CardTitle>
                <CardDescription>AI-suggested relevant case laws and citations</CardDescription>
              </CardHeader>
              <CardContent>
                {citations.length > 0 ? (
                  <div className="space-y-4">
                    {citations.map((citation: any, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{citation.title}</h3>
                          <Badge variant={citation.status === "active" ? "default" : "secondary"}>
                            {citation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {citation.court} | {citation.year}
                        </p>
                        <p className="text-sm mb-3">{citation.summary}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Relevance: {citation.relevance}%</Badge>
                            {citation.overruled && <Badge variant="destructive">Overruled</Badge>}
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">
                      No citations found yet. Generate a draft and click "Get Citations".
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LawyerLayout>
  )
}

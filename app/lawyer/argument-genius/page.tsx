"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  Brain,
  Gavel,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RefreshCw,
  FileText,
  User,
  Calendar,
  Target,
} from "lucide-react"
import { LawyerLayout } from "@/components/layouts/lawyer-layout"
import { useToast } from "@/hooks/use-toast"

export default function ArgumentGeniusPage() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [judgeAnalysis, setJudgeAnalysis] = useState<any>(null)
  const [aiArguments, setAiArguments] = useState([])
  const [simulationActive, setSimulationActive] = useState(false)
  const [simulationFeedback, setSimulationFeedback] = useState("")
  const [userArgument, setUserArgument] = useState("")
  const [riskAnalysis, setRiskAnalysis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    if (selectedCase) {
      fetchJudgeAnalysis()
      generateAiArguments()
      analyzeRisks()
    }
  }, [selectedCase])

  const fetchJudgeAnalysis = async () => {
    try {
      const response = await fetch(`/api/ai/judge-analysis/${selectedCase.judgeId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setJudgeAnalysis(data)
      }
    } catch (error) {
      console.error("Error fetching judge analysis:", error)
    }
  }

  const generateAiArguments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/generate-arguments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          judgeId: selectedCase.judgeId,
          caseType: selectedCase.type,
          facts: selectedCase.facts,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setAiArguments(data.arguments)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate arguments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const analyzeRisks = async () => {
    try {
      const response = await fetch("/api/ai/risk-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          judgeId: selectedCase.judgeId,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setRiskAnalysis(data)
      }
    } catch (error) {
      console.error("Error analyzing risks:", error)
    }
  }

  const startSimulation = async () => {
    setSimulationActive(true)
    try {
      const response = await fetch("/api/ai/argument-simulation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          argument: userArgument,
          judgeId: selectedCase.judgeId,
          caseType: selectedCase.type,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setSimulationFeedback(data.feedback)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start simulation",
        variant: "destructive",
      })
    } finally {
      setSimulationActive(false)
    }
  }

  // Mock cases for demonstration
  const mockCases = [
    {
      id: 1,
      title: "Property Dispute - ABC vs XYZ",
      judgeId: "judge_001",
      judgeName: "Hon. Justice Sharma",
      type: "Civil",
      facts: "Property ownership dispute involving land records",
      nextHearing: "2024-02-15",
      court: "District Court",
    },
    {
      id: 2,
      title: "Contract Breach - Company A vs Company B",
      judgeId: "judge_002",
      judgeName: "Hon. Justice Patel",
      type: "Commercial",
      facts: "Breach of service agreement contract",
      nextHearing: "2024-02-20",
      court: "High Court",
    },
  ]

  return (
    <LawyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Argument Genius</h1>
          <p className="text-muted-foreground">
            AI-powered argument generation based on judge analysis and case patterns
          </p>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="cases">Select Case</TabsTrigger>
            <TabsTrigger value="judge">Judge Analysis</TabsTrigger>
            <TabsTrigger value="arguments">AI Arguments</TabsTrigger>
            <TabsTrigger value="simulation">Practice Simulator</TabsTrigger>
            <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Case for Argument Analysis</CardTitle>
                <CardDescription>Choose a case to generate AI-powered arguments and analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockCases.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCase?.id === caseItem.id ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{caseItem.title}</h3>
                        <Badge>{caseItem.type}</Badge>
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Gavel className="mr-2 h-3 w-3" />
                          {caseItem.judgeName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-3 w-3" />
                          Next: {caseItem.nextHearing}
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-3 w-3" />
                          {caseItem.court}
                        </div>
                      </div>
                      <p className="text-sm mt-2">{caseItem.facts}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="judge" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Judge Analysis</CardTitle>
                <CardDescription>AI analysis of judge's historical patterns and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                {judgeAnalysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">{judgeAnalysis.totalCases || 156}</p>
                              <p className="text-sm text-muted-foreground">Total Cases Analyzed</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">{judgeAnalysis.favorableRate || 68}%</p>
                              <p className="text-sm text-muted-foreground">Favorable Rate</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-purple-600">
                                {judgeAnalysis.avgHearingTime || 45} min
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Hearing Time</p>
                            </div>
                            <User className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Judicial Tendencies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Evidence-based arguments</span>
                                <span>92%</span>
                              </div>
                              <Progress value={92} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Precedent citations</span>
                                <span>85%</span>
                              </div>
                              <Progress value={85} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Procedural compliance</span>
                                <span>95%</span>
                              </div>
                              <Progress value={95} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Settlement preference</span>
                                <span>72%</span>
                              </div>
                              <Progress value={72} />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Key Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center mb-1">
                                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                <span className="font-medium text-green-900">Strength</span>
                              </div>
                              <p className="text-sm text-green-800">
                                Highly values documentary evidence and expert testimony
                              </p>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center mb-1">
                                <Target className="h-4 w-4 text-blue-600 mr-2" />
                                <span className="font-medium text-blue-900">Focus Area</span>
                              </div>
                              <p className="text-sm text-blue-800">
                                Prefers concise arguments with clear legal precedents
                              </p>
                            </div>

                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <div className="flex items-center mb-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                                <span className="font-medium text-yellow-900">Caution</span>
                              </div>
                              <p className="text-sm text-yellow-800">Less patient with lengthy procedural arguments</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Select a case to view judge analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="arguments" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">AI-Generated Arguments</h2>
                <p className="text-muted-foreground">Tailored arguments based on judge analysis and case facts</p>
              </div>
              <Button onClick={generateAiArguments} disabled={!selectedCase || isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Regenerate
              </Button>
            </div>

            {aiArguments.length > 0 ? (
              <div className="space-y-4">
                {aiArguments.map((argument: any, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Argument #{index + 1}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              argument.strength === "high"
                                ? "default"
                                : argument.strength === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {argument.strength} strength
                          </Badge>
                          <Badge variant="outline">{argument.successRate}% success rate</Badge>
                        </div>
                      </div>
                      <CardDescription>{argument.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label className="font-medium">Main Argument</Label>
                          <p className="text-sm mt-1">{argument.mainPoint}</p>
                        </div>

                        <div>
                          <Label className="font-medium">Supporting Evidence</Label>
                          <ul className="text-sm mt-1 space-y-1">
                            {argument.evidence?.map((item: string, i: number) => (
                              <li key={i} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <Label className="font-medium">Relevant Precedents</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {argument.precedents?.map((precedent: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {precedent}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="font-medium">Potential Counterarguments</Label>
                          <p className="text-sm mt-1 text-muted-foreground">{argument.counterarguments}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    {selectedCase ? 'Click "Generate Arguments" to create AI-powered arguments' : "Select a case first"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Argument Practice</CardTitle>
                  <CardDescription>Practice your arguments with AI judge simulation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="argument">Your Argument</Label>
                    <Textarea
                      id="argument"
                      placeholder="Enter your argument here..."
                      value={userArgument}
                      onChange={(e) => setUserArgument(e.target.value)}
                      rows={8}
                    />
                  </div>

                  <Button onClick={startSimulation} disabled={!userArgument || simulationActive} className="w-full">
                    {simulationActive ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Simulation
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>AI Judge Feedback</CardTitle>
                  <CardDescription>Simulated judge response and suggestions</CardDescription>
                </CardHeader>
                <CardContent>
                  {simulationFeedback ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Judge's Response</h4>
                        <p className="text-sm text-blue-800">{simulationFeedback}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">8.5/10</p>
                          <p className="text-sm text-muted-foreground">Argument Strength</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">75%</p>
                          <p className="text-sm text-muted-foreground">Success Probability</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gavel className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-muted-foreground">
                        Enter your argument and start simulation to get AI feedback
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Analysis</CardTitle>
                <CardDescription>AI-identified risks and mitigation strategies for your case</CardDescription>
              </CardHeader>
              <CardContent>
                {riskAnalysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-red-600">{riskAnalysis.riskScore || 35}%</p>
                              <p className="text-sm text-muted-foreground">Overall Risk Level</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-orange-600">{riskAnalysis.criticalRisks || 2}</p>
                              <p className="text-sm text-muted-foreground">Critical Risks</p>
                            </div>
                            <AlertTriangle className="h-8 w-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {riskAnalysis.mitigationStrategies || 5}
                              </p>
                              <p className="text-sm text-muted-foreground">Mitigation Strategies</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Identified Risks</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                              <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-red-900">High Risk: Insufficient Evidence</h4>
                                <p className="text-sm text-red-800 mt-1">
                                  Current evidence may not be sufficient to prove ownership claims. Judge historically
                                  requires strong documentary evidence.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-yellow-900">Medium Risk: Procedural Gaps</h4>
                                <p className="text-sm text-yellow-800 mt-1">
                                  Some procedural requirements may not be fully met. This judge is strict about
                                  procedural compliance.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold mb-3">Mitigation Strategies</h3>
                        <div className="space-y-3">
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-green-900">Strengthen Evidence Base</h4>
                                <p className="text-sm text-green-800 mt-1">
                                  Obtain additional documentary evidence, expert testimony, and witness statements to
                                  support ownership claims.
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-900">Address Procedural Requirements</h4>
                                <p className="text-sm text-blue-800 mt-1">
                                  File necessary procedural applications and ensure all court requirements are met
                                  before the hearing.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Select a case to view risk analysis</p>
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

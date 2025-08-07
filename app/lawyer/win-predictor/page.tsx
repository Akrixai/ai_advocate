"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Calendar,
  Gavel,
  FileText,
  Users,
} from "lucide-react"
import { LawyerLayout } from "@/components/layouts/lawyer-layout"
import { useToast } from "@/hooks/use-toast"

export default function WinPredictorPage() {
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [prediction, setPrediction] = useState<any>(null)
  const [factors, setFactors] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [historicalData, setHistoricalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  // Mock cases for demonstration
  const mockCases = [
    {
      id: 1,
      title: "Property Dispute - ABC vs XYZ",
      type: "Civil",
      stage: "Evidence",
      judge: "Hon. Justice Sharma",
      court: "District Court",
      filedDate: "2023-08-15",
      nextHearing: "2024-02-15",
      facts: "Property ownership dispute involving land records and inheritance claims",
      clientType: "Individual",
      opposingParty: "Individual",
      caseValue: 5000000,
    },
    {
      id: 2,
      title: "Contract Breach - Company A vs Company B",
      type: "Commercial",
      stage: "Arguments",
      judge: "Hon. Justice Patel",
      court: "High Court",
      filedDate: "2023-06-20",
      nextHearing: "2024-02-20",
      facts: "Breach of service agreement contract with damages claim",
      clientType: "Corporate",
      opposingParty: "Corporate",
      caseValue: 15000000,
    },
  ]

  useEffect(() => {
    if (selectedCase) {
      generatePrediction()
    }
  }, [selectedCase])

  const generatePrediction = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/ai/win-prediction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          caseId: selectedCase.id,
          caseType: selectedCase.type,
          stage: selectedCase.stage,
          judge: selectedCase.judge,
          facts: selectedCase.facts,
          caseValue: selectedCase.caseValue,
        }),
      })

      const data = await response.json()
      if (response.ok) {
        setPrediction(data.prediction)
        setFactors(data.factors)
        setRecommendations(data.recommendations)
        setHistoricalData(data.historicalData)
      } else {
        // Mock data for demonstration
        setPrediction({
          winProbability: 72,
          confidence: 85,
          timeToResolution: 8,
          expectedOutcome: "Favorable Settlement",
          riskLevel: "Medium",
        })

        setFactors([
          {
            name: "Judge History",
            impact: 85,
            type: "positive",
            description: "Judge has 78% favorable rate for similar cases",
          },
          {
            name: "Case Precedents",
            impact: 92,
            type: "positive",
            description: "Strong precedents support your position",
          },
          {
            name: "Evidence Quality",
            impact: 68,
            type: "neutral",
            description: "Evidence is adequate but could be stronger",
          },
          {
            name: "Opposing Counsel",
            impact: 45,
            type: "negative",
            description: "Experienced opposing counsel with good track record",
          },
          {
            name: "Case Complexity",
            impact: 55,
            type: "negative",
            description: "Complex property laws may create challenges",
          },
        ])

        setRecommendations([
          {
            priority: "high",
            title: "Strengthen Evidence Base",
            description: "Gather additional documentary evidence to support ownership claims",
            impact: "+15% win probability",
          },
          {
            priority: "medium",
            title: "Expert Witness",
            description: "Consider hiring a property valuation expert",
            impact: "+8% win probability",
          },
          {
            priority: "medium",
            title: "Settlement Negotiation",
            description: "Explore settlement options given current position",
            impact: "Faster resolution",
          },
        ])

        setHistoricalData({
          similarCases: 156,
          avgWinRate: 68,
          avgSettlementAmount: 3200000,
          avgTimeToResolution: 14,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate prediction",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-green-600"
    if (probability >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getProbabilityBg = (probability: number) => {
    if (probability >= 70) return "bg-green-50 border-green-200"
    if (probability >= 50) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <LawyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Win Predictor</h1>
          <p className="text-muted-foreground">
            AI-powered case outcome prediction with risk analysis and optimization strategies
          </p>
        </div>

        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cases">Select Case</TabsTrigger>
            <TabsTrigger value="prediction">Win Prediction</TabsTrigger>
            <TabsTrigger value="factors">Success Factors</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Case for Prediction Analysis</CardTitle>
                <CardDescription>Choose a case to analyze win probability and success factors</CardDescription>
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
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{caseItem.title}</h3>
                        <Badge variant={caseItem.type === "Civil" ? "default" : "secondary"}>{caseItem.type}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center">
                          <Gavel className="mr-2 h-3 w-3" />
                          {caseItem.judge}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-3 w-3" />
                          {caseItem.nextHearing}
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-3 w-3" />
                          Stage: {caseItem.stage}
                        </div>
                        <div className="flex items-center">
                          <Users className="mr-2 h-3 w-3" />₹{(caseItem.caseValue / 100000).toFixed(1)}L
                        </div>
                      </div>

                      <p className="text-sm">{caseItem.facts}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prediction" className="space-y-6">
            {prediction ? (
              <>
                {/* Main Prediction Card */}
                <Card className={`${getProbabilityBg(prediction.winProbability)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Win Prediction Analysis</span>
                      <Badge
                        variant={
                          prediction.riskLevel === "Low"
                            ? "default"
                            : prediction.riskLevel === "Medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {prediction.riskLevel} Risk
                      </Badge>
                    </CardTitle>
                    <CardDescription>AI analysis based on case facts, judge history, and similar cases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className={`text-4xl font-bold ${getProbabilityColor(prediction.winProbability)} mb-2`}>
                          {prediction.winProbability}%
                        </div>
                        <p className="text-sm text-muted-foreground">Win Probability</p>
                        <Progress value={prediction.winProbability} className="mt-2" />
                      </div>

                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600 mb-2">{prediction.confidence}%</div>
                        <p className="text-sm text-muted-foreground">Confidence Level</p>
                        <Progress value={prediction.confidence} className="mt-2" />
                      </div>

                      <div className="text-center">
                        <div className="text-4xl font-bold text-purple-600 mb-2">{prediction.timeToResolution}</div>
                        <p className="text-sm text-muted-foreground">Months to Resolution</p>
                      </div>

                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-700 mb-2">{prediction.expectedOutcome}</div>
                        <p className="text-sm text-muted-foreground">Expected Outcome</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Historical Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Historical Comparison</CardTitle>
                    <CardDescription>How your case compares to similar cases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">{historicalData?.similarCases || 0}</p>
                              <p className="text-sm text-muted-foreground">Similar Cases</p>
                            </div>
                            <BarChart3 className="h-8 w-8 text-blue-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-green-600">{historicalData?.avgWinRate || 0}%</p>
                              <p className="text-sm text-muted-foreground">Avg Win Rate</p>
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
                                ₹{((historicalData?.avgSettlementAmount || 0) / 100000).toFixed(1)}L
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Settlement</p>
                            </div>
                            <PieChart className="h-8 w-8 text-purple-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-2xl font-bold text-orange-600">
                                {historicalData?.avgTimeToResolution || 0}
                              </p>
                              <p className="text-sm text-muted-foreground">Avg Months</p>
                            </div>
                            <Calendar className="h-8 w-8 text-orange-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-muted-foreground">
                    {selectedCase ? "Generating prediction..." : "Select a case to view win prediction"}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="factors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Success Factors Analysis</CardTitle>
                <CardDescription>Key factors influencing your case outcome</CardDescription>
              </CardHeader>
              <CardContent>
                {factors.length > 0 ? (
                  <div className="space-y-4">
                    {factors.map((factor: any, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold flex items-center">
                            {factor.type === "positive" && <TrendingUp className="h-4 w-4 text-green-600 mr-2" />}
                            {factor.type === "negative" && <TrendingDown className="h-4 w-4 text-red-600 mr-2" />}
                            {factor.type === "neutral" && <Target className="h-4 w-4 text-yellow-600 mr-2" />}
                            {factor.name}
                          </h3>
                          <Badge
                            variant={
                              factor.type === "positive"
                                ? "default"
                                : factor.type === "negative"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {factor.impact}% impact
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{factor.description}</p>
                        <Progress
                          value={factor.impact}
                          className={`h-2 ${
                            factor.type === "positive"
                              ? "[&>div]:bg-green-500"
                              : factor.type === "negative"
                                ? "[&>div]:bg-red-500"
                                : "[&>div]:bg-yellow-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Select a case to view success factors analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>Actionable strategies to improve your case outcome</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-4">
                    {recommendations.map((rec: any, index) => (
                      <div
                        key={index}
                        className={`p-4 border rounded-lg ${
                          rec.priority === "high"
                            ? "border-red-200 bg-red-50"
                            : rec.priority === "medium"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-green-200 bg-green-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold flex items-center">
                            {rec.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />}
                            {rec.priority === "medium" && <Target className="h-4 w-4 text-yellow-600 mr-2" />}
                            {rec.priority === "low" && <CheckCircle className="h-4 w-4 text-green-600 mr-2" />}
                            {rec.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant={
                                rec.priority === "high"
                                  ? "destructive"
                                  : rec.priority === "medium"
                                    ? "secondary"
                                    : "default"
                              }
                            >
                              {rec.priority} priority
                            </Badge>
                            <Badge variant="outline">{rec.impact}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-muted-foreground">Select a case to view AI recommendations</p>
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

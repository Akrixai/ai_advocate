"use client"

import type React from "react"
// ...existing code...

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Scan, Download, Eye, Edit, X, Loader2, FileImage } from "lucide-react"
import { LawyerLayout } from "@/components/layouts/lawyer-layout"
import { useToast } from "@/hooks/use-toast"

export default function DocumentAutomationPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [extractedData, setExtractedData] = useState<any>({})
  const [isSavingData, setIsSavingData] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [generatedDocument, setGeneratedDocument] = useState("")
  // Helper to merge template with data
  function mergeTemplateWithData(template: string, data: Record<string, any>) {
    return template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (match, key) => {
      return data[key] !== undefined && data[key] !== null ? data[key] : match
    })
  }
  const [signaturePad, setSignaturePad] = useState("")
  const [isDrawing, setIsDrawing] = useState(false)
  const [isSavingSignature, setIsSavingSignature] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Signature pad drawing logic
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    let drawing = false
    let lastX = 0
    let lastY = 0
    const getPos = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (e instanceof TouchEvent) {
        return {
          x: e.touches[0].clientX - rect.left,
          y: e.touches[0].clientY - rect.top,
        }
      } else {
        return {
          x: (e as MouseEvent).clientX - rect.left,
          y: (e as MouseEvent).clientY - rect.top,
        }
      }
    }
    const startDraw = (e: MouseEvent | TouchEvent) => {
      drawing = true
      setIsDrawing(true)
      const pos = getPos(e)
      lastX = pos.x
      lastY = pos.y
    }
    const draw = (e: MouseEvent | TouchEvent) => {
      if (!drawing) return
      e.preventDefault()
      const pos = getPos(e)
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.strokeStyle = "#111"
      ctx.beginPath()
      ctx.moveTo(lastX, lastY)
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
      lastX = pos.x
      lastY = pos.y
    }
    const endDraw = () => {
      drawing = false
      setIsDrawing(false)
      // Save signature as base64
      setSignaturePad(canvas.toDataURL("image/png"))
    }
    // Mouse events
    canvas.addEventListener("mousedown", startDraw)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", endDraw)
    canvas.addEventListener("mouseleave", endDraw)
    // Touch events
    canvas.addEventListener("touchstart", startDraw)
    canvas.addEventListener("touchmove", draw)
    canvas.addEventListener("touchend", endDraw)
    return () => {
      canvas.removeEventListener("mousedown", startDraw)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", endDraw)
      canvas.removeEventListener("mouseleave", endDraw)
      canvas.removeEventListener("touchstart", startDraw)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", endDraw)
    }
  }, [])

  // Save signature to Supabase
  const saveSignature = async () => {
    if (!signaturePad || !selectedTemplate) {
      toast({ title: "No signature or template selected" })
      return
    }
    setIsSavingSignature(true)
    try {
      const userId = localStorage.getItem("user_id")
      const response = await fetch("/api/document/save-signature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          signature: signaturePad,
          userId,
        }),
      })
      if (!response.ok) throw new Error("Failed to save signature")
      toast({ title: "Signature saved" })
    } catch (e) {
      toast({ title: "Error", description: "Failed to save signature", variant: "destructive" })
    } finally {
      setIsSavingSignature(false)
    }
  }
  const [templates, setTemplates] = useState<any[]>([])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const processingSteps = [
    "Uploading documents",
    "OCR processing",
    "Data extraction",
    "Template merging",
    "Document generation",
  ]

  // Fetch templates from public endpoint (all users can see active templates)
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        const data = await response.json()
        setTemplates(data.templates || [])
      } catch (e) {
        setTemplates([])
      }
    }
    fetchTemplates()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const saveReviewedData = async () => {
    setIsSavingData(true)
    try {
      const response = await fetch("/api/document/save-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate,
          data: extractedData,
        }),
      })
      if (!response.ok) throw new Error("Failed to save data")
      toast({ title: "Data saved" })
    } catch (e) {
      toast({ title: "Error", description: "Failed to save data", variant: "destructive" })
    } finally {
      setIsSavingData(false)
    }
  }

  const processDocuments = async () => {
    if (!selectedTemplate || uploadedFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please select a template and upload documents",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProcessingStep(0)

    try {
      for (let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i)
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
      // Prepare FormData with all files and template
      const formData = new FormData()
      uploadedFiles.forEach((file) => {
        formData.append("files", file)
      })
      formData.append("template", selectedTemplate)
      // Optionally add language if needed
      // formData.append("language", "english")

      const response = await fetch("/api/document/process", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        toast({
          title: "Error",
          description: data.message || "Failed to process documents",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }
      // If OCR returns no data, allow manual input
      if (!data.ocrResult || Object.keys(data.ocrResult).length === 0) {
        setExtractedData({})
        toast({
          title: "Manual Input Required",
          description: "No data extracted. Please enter details manually.",
        })
      } else {
        setExtractedData(data.ocrResult)
      }

      // Generate document if template and data available
      const templateObj = templates.find((t) => t.id === selectedTemplate)
      if (templateObj && data.ocrResult) {
        setGeneratedDocument(mergeTemplateWithData(templateObj.content, data.ocrResult))
      }

      toast({
        title: "Success",
        description: "Documents processed and extracted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process documents",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadDocument = async (format: "pdf" | "docx") => {
    try {
      const response = await fetch("/api/document/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          documentId: generatedDocument,
          format,
          signature: signaturePad,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `document.${format}`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download document",
        variant: "destructive",
      })
    }
  }

  return (
    <LawyerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Smart Document Automation</h1>
          <p className="text-muted-foreground">
            Upload documents, extract data with AI, and generate legal documents automatically
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload & Process</TabsTrigger>
            <TabsTrigger value="review">Review Data</TabsTrigger>
            <TabsTrigger value="generate">Generate Document</TabsTrigger>
            <TabsTrigger value="sign">Sign & Export</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Document Template</CardTitle>
                  <CardDescription>Choose the type of legal document you want to generate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div>
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">{template.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Document Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Upload Documents</CardTitle>
                  <CardDescription>
                    Upload Aadhaar, PAN cards, property papers, and other required documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <Label>Uploaded Files</Label>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <FileImage className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={processDocuments}
                    className="w-full"
                    disabled={isProcessing || !selectedTemplate || uploadedFiles.length === 0}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Scan className="mr-2 h-4 w-4" />
                        Process Documents
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle>Processing Documents</CardTitle>
                  <CardDescription>AI is analyzing your documents and extracting data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={((processingStep + 1) / processingSteps.length) * 100} />
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{processingSteps[processingStep]}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="review" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Extracted Data</CardTitle>
                <CardDescription>Verify, edit, or manually enter the data extracted from your documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Always show at least a few common fields for manual input */}
                  {[
                    "name",
                    "aadhaar_number",
                    "pan_number",
                    "date_of_birth",
                    "address",
                  ].map((key) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      <Input
                        id={key}
                        value={extractedData[key] || ""}
                        onChange={(e) =>
                          setExtractedData((prev: any) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                  {/* Show any additional extracted fields */}
                  {Object.entries(extractedData)
                    .filter(([key]) => !["name", "aadhaar_number", "pan_number", "date_of_birth", "address"].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key}>
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                        <Input
                          id={key}
                          value={value as string}
                          onChange={(e) =>
                            setExtractedData((prev: any) => ({
                              ...prev,
                              [key]: e.target.value,
                            }))
                          }
                        />
                      </div>
                    ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={saveReviewedData} disabled={isSavingData}>
                    {isSavingData ? "Saving..." : "Save Data"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Generated Document</CardTitle>
                <CardDescription>Preview and edit your generated legal document</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedDocument ? (
                  <div className="space-y-4">
                    <Textarea
                      value={generatedDocument}
                      onChange={(e) => setGeneratedDocument(e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setGeneratedDocument(mergeTemplateWithData(templates.find((t) => t.id === selectedTemplate)?.content || "", extractedData))}>
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No document generated yet. Please process documents first.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sign" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Digital Signature */}
              <Card>
                <CardHeader>
                  <CardTitle>Digital Signature</CardTitle>
                  <CardDescription>Sign your document digitally</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border-2 border-gray-300 rounded-lg p-4 h-40 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={160}
                      className="w-full h-full cursor-crosshair"
                      style={{ background: "#f9fafb" }}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const canvas = canvasRef.current
                        if (canvas) {
                          const ctx = canvas.getContext("2d")
                          ctx?.clearRect(0, 0, canvas.width, canvas.height)
                          setSignaturePad("")
                        }
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={saveSignature}
                      disabled={isSavingSignature || !signaturePad}
                    >
                      {isSavingSignature ? "Saving..." : "Save Signature"}
                    </Button>
                  </div>
                  {signaturePad && (
                    <div className="mt-2">
                      <img src={signaturePad} alt="Signature Preview" className="max-h-32 border" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Document</CardTitle>
                  <CardDescription>Download your completed legal document</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Button onClick={() => downloadDocument("pdf")} className="w-full" disabled={!generatedDocument}>
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                    <Button
                      onClick={() => downloadDocument("docx")}
                      variant="outline"
                      className="w-full"
                      disabled={!generatedDocument}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download as Word
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Document Details</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Template: {templates.find((t) => t.id === selectedTemplate)?.name}</p>
                      <p>Generated: {new Date().toLocaleDateString()}</p>
                      <p>Status: Ready for download</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </LawyerLayout>
  )
}

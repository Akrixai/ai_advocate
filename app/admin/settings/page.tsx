"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, RefreshCw } from "lucide-react"

interface SettingItem {
  id: string
  key: string
  value: any
  description: string
  updated_at: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      } else {
        // Mock data for initial development
        setSettings([
          {
            id: "cb77ea1a-1c5a-4a81-abec-b9b426bb8aed",
            key: "ocr_service",
            value: {
              api_key: "",
              enabled: true,
              provider: "tesseract",
            },
            description: "OCR service configuration",
            updated_at: new Date().toISOString(),
          },
          {
            id: "d998e0fe-2bbb-4dc1-a111-36c7a61c3314",
            key: "ai_service",
            value: {
              model: "gpt-4",
              enabled: true,
              provider: "openai",
            },
            description: "AI service configuration",
            updated_at: new Date().toISOString(),
          },
          {
            id: "97205ba9-d3ae-4b11-9493-ff2724916ab8",
            key: "ecourt_api",
            value: {
              api_key: "",
              enabled: false,
              base_url: "",
            },
            description: "eCourt API configuration",
            updated_at: new Date().toISOString(),
          },
          {
            id: "dc4a43e8-4ea8-4567-b993-e356500c16a7",
            key: "payment_gateway",
            value: {
              key_id: "",
              enabled: false,
              provider: "razorpay",
              key_secret: "",
            },
            description: "Payment gateway configuration",
            updated_at: new Date().toISOString(),
          },
          {
            id: "d24be0cb-df2d-4dca-bfb7-3b6f41f74432",
            key: "email_service",
            value: {
              host: "",
              port: 587,
              enabled: false,
              provider: "smtp",
            },
            description: "Email service configuration",
            updated_at: new Date().toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: any) => {
    // Update local state first for immediate feedback
    setSettings((prev) =>
      prev.map((setting) => (setting.key === key ? { ...setting, value } : setting)),
    )

    // Then send to server
    try {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ value }),
      })

      if (!response.ok) {
        throw new Error("Failed to update setting")
      }

      toast({
        title: "Success",
        description: `${key.replace("_", " ")} settings updated successfully`,
      })
    } catch (error) {
      console.error(`Error updating ${key} settings:`, error)
      toast({
        title: "Error",
        description: `Failed to update ${key.replace("_", " ")} settings`,
        variant: "destructive",
      })

      // Revert local state on error
      fetchSettings()
    }
  }

  const saveAllSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ settings }),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      toast({
        title: "Success",
        description: "All settings saved successfully",
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSettingValue = (key: string, field: string, value: any) => {
    setSettings((prev) =>
      prev.map((setting) => {
        if (setting.key === key) {
          return {
            ...setting,
            value: {
              ...setting.value,
              [field]: value,
            },
          }
        }
        return setting
      }),
    )
  }

  const findSetting = (key: string) => settings.find((s) => s.key === key)?.value || {}

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Configure system-wide settings and integrations</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={fetchSettings}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={saveAllSettings} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save All Changes
            </Button>
          </div>
        </div>

        <Tabs defaultValue="ocr" className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="ocr">OCR Service</TabsTrigger>
            <TabsTrigger value="ai">AI Service</TabsTrigger>
            <TabsTrigger value="ecourt">eCourt API</TabsTrigger>
            <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
            <TabsTrigger value="email">Email Service</TabsTrigger>
          </TabsList>

          {/* OCR Service Settings */}
          <TabsContent value="ocr">
            <Card>
              <CardHeader>
                <CardTitle>OCR Service Configuration</CardTitle>
                <CardDescription>
                  Configure the Optical Character Recognition service for document processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable OCR Service</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off document text extraction</p>
                  </div>
                  <Switch
                    checked={findSetting("ocr_service").enabled}
                    onCheckedChange={(checked) => updateSettingValue("ocr_service", "enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="ocr-provider">OCR Provider</Label>
                  <Select
                    value={findSetting("ocr_service").provider}
                    onValueChange={(value) => updateSettingValue("ocr_service", "provider", value)}
                  >
                    <SelectTrigger id="ocr-provider">
                      <SelectValue placeholder="Select OCR provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tesseract">Tesseract (Local)</SelectItem>
                      <SelectItem value="google-vision">Google Vision API</SelectItem>
                      <SelectItem value="aws-textract">AWS Textract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {findSetting("ocr_service").provider !== "tesseract" && (
                  <div className="space-y-2">
                    <Label htmlFor="ocr-api-key">API Key</Label>
                    <Input
                      id="ocr-api-key"
                      type="password"
                      value={findSetting("ocr_service").api_key}
                      onChange={(e) => updateSettingValue("ocr_service", "api_key", e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>
                )}

                <div className="pt-4">
                  <Button
                    onClick={() => updateSetting("ocr_service", findSetting("ocr_service"))}
                    className="w-full md:w-auto"
                  >
                    Save OCR Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Service Settings */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle>AI Service Configuration</CardTitle>
                <CardDescription>Configure the AI service for document generation and analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable AI Service</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off AI-powered features</p>
                  </div>
                  <Switch
                    checked={findSetting("ai_service").enabled}
                    onCheckedChange={(checked) => updateSettingValue("ai_service", "enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="ai-provider">AI Provider</Label>
                  <Select
                    value={findSetting("ai_service").provider}
                    onValueChange={(value) => updateSettingValue("ai_service", "provider", value)}
                  >
                    <SelectTrigger id="ai-provider">
                      <SelectValue placeholder="Select AI provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="azure-openai">Azure OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select
                    value={findSetting("ai_service").model}
                    onValueChange={(value) => updateSettingValue("ai_service", "model", value)}
                  >
                    <SelectTrigger id="ai-model">
                      <SelectValue placeholder="Select AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ai-api-key">API Key</Label>
                  <Input
                    id="ai-api-key"
                    type="password"
                    value={findSetting("ai_service").api_key || ""}
                    onChange={(e) => updateSettingValue("ai_service", "api_key", e.target.value)}
                    placeholder="Enter API key"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => updateSetting("ai_service", findSetting("ai_service"))}
                    className="w-full md:w-auto"
                  >
                    Save AI Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* eCourt API Settings */}
          <TabsContent value="ecourt">
            <Card>
              <CardHeader>
                <CardTitle>eCourt API Configuration</CardTitle>
                <CardDescription>Configure the eCourt API for case synchronization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable eCourt Integration</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off eCourt case synchronization</p>
                  </div>
                  <Switch
                    checked={findSetting("ecourt_api").enabled}
                    onCheckedChange={(checked) => updateSettingValue("ecourt_api", "enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="ecourt-base-url">Base URL</Label>
                  <Input
                    id="ecourt-base-url"
                    value={findSetting("ecourt_api").base_url || ""}
                    onChange={(e) => updateSettingValue("ecourt_api", "base_url", e.target.value)}
                    placeholder="Enter eCourt API base URL"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ecourt-api-key">API Key</Label>
                  <Input
                    id="ecourt-api-key"
                    type="password"
                    value={findSetting("ecourt_api").api_key || ""}
                    onChange={(e) => updateSettingValue("ecourt_api", "api_key", e.target.value)}
                    placeholder="Enter API key"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => updateSetting("ecourt_api", findSetting("ecourt_api"))}
                    className="w-full md:w-auto"
                  >
                    Save eCourt Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Gateway Settings */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateway Configuration</CardTitle>
                <CardDescription>Configure the payment gateway for subscription management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Payment Gateway</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off payment processing</p>
                  </div>
                  <Switch
                    checked={findSetting("payment_gateway").enabled}
                    onCheckedChange={(checked) => updateSettingValue("payment_gateway", "enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="payment-provider">Payment Provider</Label>
                  <Select
                    value={findSetting("payment_gateway").provider}
                    onValueChange={(value) => updateSettingValue("payment_gateway", "provider", value)}
                  >
                    <SelectTrigger id="payment-provider">
                      <SelectValue placeholder="Select payment provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-key-id">Key ID / Public Key</Label>
                  <Input
                    id="payment-key-id"
                    value={findSetting("payment_gateway").key_id || ""}
                    onChange={(e) => updateSettingValue("payment_gateway", "key_id", e.target.value)}
                    placeholder="Enter key ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-key-secret">Key Secret / Private Key</Label>
                  <Input
                    id="payment-key-secret"
                    type="password"
                    value={findSetting("payment_gateway").key_secret || ""}
                    onChange={(e) => updateSettingValue("payment_gateway", "key_secret", e.target.value)}
                    placeholder="Enter key secret"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => updateSetting("payment_gateway", findSetting("payment_gateway"))}
                    className="w-full md:w-auto"
                  >
                    Save Payment Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Service Settings */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Service Configuration</CardTitle>
                <CardDescription>Configure the email service for notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Email Service</Label>
                    <p className="text-sm text-muted-foreground">Turn on/off email notifications</p>
                  </div>
                  <Switch
                    checked={findSetting("email_service").enabled}
                    onCheckedChange={(checked) => updateSettingValue("email_service", "enabled", checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="email-provider">Email Provider</Label>
                  <Select
                    value={findSetting("email_service").provider}
                    onValueChange={(value) => updateSettingValue("email_service", "provider", value)}
                  >
                    <SelectTrigger id="email-provider">
                      <SelectValue placeholder="Select email provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-host">SMTP Host</Label>
                  <Input
                    id="email-host"
                    value={findSetting("email_service").host || ""}
                    onChange={(e) => updateSettingValue("email_service", "host", e.target.value)}
                    placeholder="Enter SMTP host"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-port">SMTP Port</Label>
                  <Input
                    id="email-port"
                    type="number"
                    value={findSetting("email_service").port || 587}
                    onChange={(e) => updateSettingValue("email_service", "port", parseInt(e.target.value))}
                    placeholder="Enter SMTP port"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-username">Username</Label>
                  <Input
                    id="email-username"
                    value={findSetting("email_service").username || ""}
                    onChange={(e) => updateSettingValue("email_service", "username", e.target.value)}
                    placeholder="Enter username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-password">Password</Label>
                  <Input
                    id="email-password"
                    type="password"
                    value={findSetting("email_service").password || ""}
                    onChange={(e) => updateSettingValue("email_service", "password", e.target.value)}
                    placeholder="Enter password"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={() => updateSetting("email_service", findSetting("email_service"))}
                    className="w-full md:w-auto"
                  >
                    Save Email Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
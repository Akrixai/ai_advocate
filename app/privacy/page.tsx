import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, Shield, Lock, Eye, Database, Users } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Scale className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Advocate AI Pro</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your privacy is our priority. Learn how we collect, use, and protect your personal information.
          </p>
          <p className="text-sm text-gray-500">Last updated: January 15, 2024</p>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-6 w-6 text-blue-600 mr-2" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  Advocate AI Pro ("we," "our," or "us") is committed to protecting your privacy and ensuring the
                  security of your personal information. This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our legal technology platform and services.
                </p>
                <p>
                  By using our services, you consent to the collection and use of information in accordance with this
                  policy. We comply with all applicable Indian data protection laws, including the Information
                  Technology Act, 2000, and the Personal Data Protection Bill.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-6 w-6 text-green-600 mr-2" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Name, email address, phone number</li>
                    <li>Bar Council ID and professional credentials</li>
                    <li>Billing and payment information</li>
                    <li>Profile information and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Professional Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Legal specialization and experience</li>
                    <li>Case information and legal documents</li>
                    <li>Court and client details</li>
                    <li>Usage patterns and preferences</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Usage analytics and performance data</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-purple-600 mr-2" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Service Provision</h4>
                      <p className="text-gray-600">
                        To provide, maintain, and improve our legal technology services and features
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Communication</h4>
                      <p className="text-gray-600">
                        To send you service updates, security alerts, and administrative messages
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Personalization</h4>
                      <p className="text-gray-600">
                        To customize your experience and provide relevant content and recommendations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Analytics</h4>
                      <p className="text-gray-600">
                        To analyze usage patterns and improve our services and user experience
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-semibold">Legal Compliance</h4>
                      <p className="text-gray-600">
                        To comply with legal obligations and protect our rights and interests
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-6 w-6 text-red-600 mr-2" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We implement industry-standard security measures to protect your personal information against
                  unauthorized access, alteration, disclosure, or destruction:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Technical Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>256-bit SSL encryption</li>
                      <li>Multi-factor authentication</li>
                      <li>Regular security audits</li>
                      <li>Secure data centers</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Administrative Safeguards</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                      <li>Access controls and permissions</li>
                      <li>Employee training programs</li>
                      <li>Data handling procedures</li>
                      <li>Incident response protocols</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle>Information Sharing and Disclosure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share information in
                  the following circumstances:
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-900">Service Providers</h4>
                    <p className="text-blue-800 text-sm">
                      With trusted third-party service providers who assist in operating our platform, subject to strict
                      confidentiality agreements
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-900">Legal Requirements</h4>
                    <p className="text-green-800 text-sm">
                      When required by law, court order, or government regulation, or to protect our rights and safety
                    </p>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900">Business Transfers</h4>
                    <p className="text-purple-800 text-sm">
                      In connection with a merger, acquisition, or sale of assets, with appropriate notice to users
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>You have the following rights regarding your personal information:</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Access and Portability</h4>
                    <p className="text-gray-600 text-sm">
                      Request access to your personal data and receive a copy in a portable format
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Correction</h4>
                    <p className="text-gray-600 text-sm">
                      Update or correct inaccurate or incomplete personal information
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Deletion</h4>
                    <p className="text-gray-600 text-sm">
                      Request deletion of your personal data, subject to legal requirements
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Restriction</h4>
                    <p className="text-gray-600 text-sm">
                      Limit how we process your personal information in certain circumstances
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm">
                    To exercise these rights, please contact us at <strong>privacy@advocateaipro.com</strong> or through
                    your account settings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cookies */}
            <Card>
              <CardHeader>
                <CardTitle>Cookies and Tracking Technologies</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>We use cookies and similar technologies to enhance your experience:</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">Essential Cookies</h4>
                    <p className="text-gray-600 text-sm">Required for basic functionality and security</p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Performance Cookies</h4>
                    <p className="text-gray-600 text-sm">
                      Help us understand how you use our services to improve performance
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold">Functional Cookies</h4>
                    <p className="text-gray-600 text-sm">Remember your preferences and personalize your experience</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600">
                  You can control cookies through your browser settings, but disabling certain cookies may affect
                  functionality.
                </p>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> privacy@advocateaipro.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 98765 43210
                  </p>
                  <p>
                    <strong>Address:</strong> 123 Legal Tech Hub, Cyber City, Gurgaon, Haryana 122002, India
                  </p>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Data Protection Officer:</strong> For specific privacy concerns, you can reach our Data
                    Protection Officer at dpo@advocateaipro.com
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Policy Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal
                  requirements. We will notify you of any material changes by posting the updated policy on our website
                  and sending you an email notification.
                </p>
                <p className="mt-4 text-sm text-gray-600">
                  Your continued use of our services after any changes indicates your acceptance of the updated Privacy
                  Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Scale className="h-6 w-6" />
                <span className="text-xl font-bold">Advocate AI Pro</span>
              </div>
              <p className="text-gray-400">AI-powered legal platform for modern legal professionals</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-white">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-white">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/training" className="hover:text-white">
                    Training
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-white">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Advocate AI Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

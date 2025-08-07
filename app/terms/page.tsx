import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Scale, FileText, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
          <FileText className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Please read these terms carefully before using Advocate AI Pro. By using our services, you agree to be bound
            by these terms.
          </p>
          <p className="text-sm text-gray-500">Last updated: January 15, 2024</p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="space-y-12">
            {/* Acceptance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p>
                  By accessing and using Advocate AI Pro ("the Service"), you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to abide by the above, please do not use this
                  service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our legal technology platform and services
                  operated by Advocate AI Pro Private Limited ("we," "us," or "our"). These Terms apply to all visitors,
                  users, and others who access or use the Service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Advocate AI Pro provides an AI-powered legal technology platform that includes but is not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Smart document automation and generation</li>
                  <li>eCourt integration and case management</li>
                  <li>AI-powered legal argument generation</li>
                  <li>Case outcome prediction and risk analysis</li>
                  <li>Legal research and citation tools</li>
                  <li>Template management and customization</li>
                </ul>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Important:</strong> Our services are designed to assist legal professionals and should not
                    replace professional legal judgment or advice.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card>
              <CardHeader>
                <CardTitle>User Accounts and Registration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Requirements</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>You must be a qualified legal professional with a valid Bar Council registration</li>
                    <li>You must provide accurate, current, and complete information during registration</li>
                    <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                    <li>You must notify us immediately of any unauthorized use of your account</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Responsibilities</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>You are responsible for all activities that occur under your account</li>
                    <li>You must keep your contact information up to date</li>
                    <li>You may not share your account with others or create multiple accounts</li>
                    <li>We reserve the right to suspend or terminate accounts that violate these terms</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Acceptable Use */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600 mr-2" />
                  Acceptable Use Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  You agree to use our services only for lawful purposes and in accordance with these Terms. You agree
                  NOT to:
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Prohibited Activities</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Use the service for any illegal or unauthorized purpose</li>
                      <li>Violate any laws in your jurisdiction</li>
                      <li>Transmit any harmful or malicious code</li>
                      <li>Attempt to gain unauthorized access to our systems</li>
                      <li>Interfere with or disrupt the service</li>
                      <li>Use automated systems to access the service</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Content Restrictions</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      <li>Upload false, misleading, or fraudulent content</li>
                      <li>Infringe on intellectual property rights</li>
                      <li>Share confidential client information inappropriately</li>
                      <li>Post defamatory or harassing content</li>
                      <li>Distribute spam or unsolicited communications</li>
                      <li>Reverse engineer or copy our software</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscription and Payment */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription and Payment Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Subscription Plans</h3>
                  <p className="text-gray-600 mb-4">
                    We offer various subscription plans with different features and usage limits. Current pricing and
                    plan details are available on our website.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Terms</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Subscription fees are billed in advance on a monthly or annual basis</li>
                    <li>All fees are non-refundable except as required by law</li>
                    <li>We may change our fees with 30 days' notice</li>
                    <li>Failed payments may result in service suspension</li>
                    <li>You are responsible for all applicable taxes</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cancellation</h3>
                  <p className="text-gray-600">
                    You may cancel your subscription at any time through your account settings. Cancellation will be
                    effective at the end of your current billing period.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card>
              <CardHeader>
                <CardTitle>Intellectual Property Rights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Our Rights</h3>
                  <p className="text-gray-600">
                    The Service and its original content, features, and functionality are and will remain the exclusive
                    property of Advocate AI Pro and its licensors. The Service is protected by copyright, trademark, and
                    other laws.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Rights</h3>
                  <p className="text-gray-600">
                    You retain ownership of any content you upload or create using our services. However, you grant us a
                    license to use, store, and process your content to provide our services.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">License to Use</h3>
                  <p className="text-gray-600">
                    We grant you a limited, non-exclusive, non-transferable license to use our services in accordance
                    with these Terms.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Privacy and Data */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy and Data Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your
                  information when you use our Service.
                </p>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Data Security Commitment</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-green-800">
                    <li>We use industry-standard encryption and security measures</li>
                    <li>Your data is stored in secure, compliant data centers</li>
                    <li>We comply with all applicable Indian data protection laws</li>
                    <li>We never sell or share your personal data with third parties</li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600">
                  By using our services, you also agree to our Privacy Policy, which is incorporated into these Terms by
                  reference.
                </p>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                  Disclaimers and Limitations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-2">Important Legal Disclaimer</h4>
                  <p className="text-sm text-red-800">
                    Advocate AI Pro is a technology platform that assists legal professionals. It does not provide legal
                    advice, and its outputs should not be considered as legal opinions or recommendations. Users must
                    exercise professional judgment and verify all information independently.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>We strive for 99.9% uptime but cannot guarantee uninterrupted service</li>
                    <li>We may perform maintenance that temporarily affects service availability</li>
                    <li>We are not liable for any losses due to service interruptions</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">AI-Generated Content</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>AI-generated content is for assistance only and may contain errors</li>
                    <li>Users must review and verify all AI-generated content</li>
                    <li>We are not responsible for the accuracy of AI predictions or suggestions</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle>Limitation of Liability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  To the maximum extent permitted by applicable law, in no event shall Advocate AI Pro, its affiliates,
                  officers, directors, employees, agents, or licensors be liable for any indirect, incidental, special,
                  consequential, or punitive damages.
                </p>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Liability Cap</h4>
                  <p className="text-sm text-yellow-800">
                    Our total liability to you for all damages shall not exceed the amount you paid us in the 12 months
                    preceding the claim.
                  </p>
                </div>

                <p className="text-sm text-gray-600">
                  Some jurisdictions do not allow the exclusion of certain warranties or the limitation of liability for
                  consequential damages, so the above limitations may not apply to you.
                </p>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card>
              <CardHeader>
                <CardTitle>Termination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by You</h3>
                  <p className="text-gray-600">
                    You may terminate your account at any time by contacting us or using the account settings. Upon
                    termination, your right to use the Service will cease immediately.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by Us</h3>
                  <p className="text-gray-600">
                    We may terminate or suspend your account immediately, without prior notice, for conduct that we
                    believe violates these Terms or is harmful to other users, us, or third parties.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Effect of Termination</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Your access to the Service will be immediately revoked</li>
                    <li>We may delete your account and data after a reasonable period</li>
                    <li>You may request a copy of your data before termination</li>
                    <li>Provisions that should survive termination will remain in effect</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card>
              <CardHeader>
                <CardTitle>Governing Law and Jurisdiction</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  These Terms shall be interpreted and governed by the laws of India. Any disputes arising from these
                  Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts in New
                  Delhi, India.
                </p>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Dispute Resolution</h3>
                  <p className="text-gray-600">
                    We encourage you to contact us first to resolve any disputes. If we cannot resolve a dispute through
                    direct communication, we agree to attempt resolution through mediation before pursuing litigation.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We reserve the right to modify or replace these Terms at any time. If a revision is material, we will
                  try to provide at least 30 days' notice prior to any new terms taking effect.
                </p>
                <p className="mt-4">
                  Your continued use of the Service after any changes to these Terms constitutes acceptance of those
                  changes.
                </p>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                  <p className="text-sm text-blue-800">
                    <strong>Stay Updated:</strong> We recommend reviewing these Terms periodically. The "Last updated"
                    date at the top indicates when changes were made.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">If you have any questions about these Terms of Service, please contact us:</p>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> legal@advocateaipro.com
                  </p>
                  <p>
                    <strong>Phone:</strong> +91 98765 43210
                  </p>
                  <p>
                    <strong>Address:</strong> Advocate AI Pro Private Limited
                    <br />
                    123 Legal Tech Hub, Cyber City
                    <br />
                    Gurgaon, Haryana 122002, India
                  </p>
                </div>

                <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
                  <p className="text-sm">
                    <strong>Business Hours:</strong> Monday to Friday, 9:00 AM to 6:00 PM IST
                    <br />
                    <strong>Response Time:</strong> We aim to respond to all inquiries within 48 hours
                  </p>
                </div>
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

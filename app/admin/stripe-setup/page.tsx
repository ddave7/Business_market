"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export default function StripeSetupPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testStripeConnection = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/test-stripe-connection")
      const data = await response.json()
      setTestResult(data)
    } catch (err) {
      setError("Failed to test Stripe connection")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    testStripeConnection()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Stripe Setup Guide</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Stripe Connection Status</CardTitle>
            <CardDescription>Check if your Stripe keys are properly configured</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Testing Stripe connection...</p>
            ) : error ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : testResult ? (
              <div className="space-y-4">
                {testResult.success ? (
                  <Alert className="bg-green-50 border-green-200">
                    <AlertTitle className="text-green-800">Success</AlertTitle>
                    <AlertDescription className="text-green-700">
                      Your Stripe connection is working correctly!
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <AlertTitle>Connection Failed</AlertTitle>
                    <AlertDescription>
                      {testResult.error}: {testResult.details}
                      {testResult.helpMessage && <p className="mt-2">{testResult.helpMessage}</p>}
                    </AlertDescription>
                  </Alert>
                )}

                {testResult.keyStatus && (
                  <div className="mt-4 space-y-2">
                    <h3 className="font-medium">API Key Status:</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Secret Key:</p>
                        <p className={testResult.keyStatus.secretKey.valid ? "text-green-600" : "text-red-600"}>
                          {testResult.keyStatus.secretKey.valid ? "Valid" : "Invalid or Missing"}
                        </p>
                        <p className="text-sm text-gray-500">{testResult.keyStatus.secretKey.preview}</p>
                      </div>
                      <div>
                        <p className="font-medium">Publishable Key:</p>
                        <p className={testResult.keyStatus.publishableKey.valid ? "text-green-600" : "text-red-600"}>
                          {testResult.keyStatus.publishableKey.valid ? "Valid" : "Invalid or Missing"}
                        </p>
                        <p className="text-sm text-gray-500">{testResult.keyStatus.publishableKey.preview}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button onClick={testStripeConnection} disabled={isLoading}>
              {isLoading ? "Testing..." : "Test Connection Again"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to Set Up Stripe</CardTitle>
            <CardDescription>Follow these steps to configure Stripe for your application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-lg mb-2">1. Create a Stripe Account</h3>
              <p className="text-gray-700 mb-2">
                If you don't already have a Stripe account, sign up at{" "}
                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  stripe.com
                </a>
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-lg mb-2">2. Get Your API Keys</h3>
              <p className="text-gray-700 mb-2">
                Once logged in to your Stripe Dashboard, go to Developers → API keys to find your keys.
              </p>
              <p className="text-gray-700 mb-2">
                You'll need both the <span className="font-medium">Publishable key</span> and the{" "}
                <span className="font-medium">Secret key</span>.
              </p>
              <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                <AlertTitle className="text-yellow-800">Important</AlertTitle>
                <AlertDescription className="text-yellow-700">
                  For testing, use the keys that start with <code className="bg-yellow-100 px-1 rounded">pk_test_</code>{" "}
                  and <code className="bg-yellow-100 px-1 rounded">sk_test_</code>. Only switch to live keys when you're
                  ready to accept real payments.
                </AlertDescription>
              </Alert>
            </div>

            <Separator />

            <div>
              <h3 className="font-medium text-lg mb-2">3. Set Environment Variables</h3>
              <p className="text-gray-700 mb-2">Add these environment variables to your project:</p>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm my-2">
                <p>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key</p>
                <p>STRIPE_SECRET_KEY=sk_test_your_secret_key</p>
              </div>
              <p className="text-gray-700">
                For Vercel deployment, add these in your project settings under Environment Variables.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

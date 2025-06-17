"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function TestStripePage() {
  const [publishableKey, setPublishableKey] = useState<string | null>(null)
  const [secretKeyStatus, setSecretKeyStatus] = useState<"checking" | "valid" | "invalid" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Check publishable key
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    setPublishableKey(key || null)

    // Check secret key via API
    async function checkSecretKey() {
      try {
        const response = await fetch("/api/test-stripe")
        const data = await response.json()

        if (data.success) {
          setSecretKeyStatus("valid")
        } else {
          setSecretKeyStatus("invalid")
          setErrorMessage(data.error || "Unknown error")
        }
      } catch (error) {
        setSecretKeyStatus("error")
        setErrorMessage("Failed to connect to API")
      }
    }

    checkSecretKey()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Stripe Configuration Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Publishable Key</CardTitle>
        </CardHeader>
        <CardContent>
          {publishableKey ? (
            <Alert>
              <AlertDescription className="text-green-600">
                Publishable key is configured: {publishableKey.substring(0, 8)}...
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>
                Publishable key is missing. Please add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your environment variables.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Secret Key</CardTitle>
        </CardHeader>
        <CardContent>
          {secretKeyStatus === "checking" && <p>Checking secret key...</p>}

          {secretKeyStatus === "valid" && (
            <Alert>
              <AlertDescription className="text-green-600">Secret key is valid and working correctly.</AlertDescription>
            </Alert>
          )}

          {secretKeyStatus === "invalid" && (
            <Alert variant="destructive">
              <AlertDescription>Secret key is invalid: {errorMessage}</AlertDescription>
            </Alert>
          )}

          {secretKeyStatus === "error" && (
            <Alert variant="destructive">
              <AlertDescription>Error checking secret key: {errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

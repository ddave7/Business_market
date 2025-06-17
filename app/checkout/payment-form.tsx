"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CreditCard, Wallet, Building } from "lucide-react"
import StripePaymentElement from "../components/StripePaymentElement"

interface PaymentFormProps {
  initialValues: any
  onSubmit: (data: any) => void
  onBack: () => void
  total: number
}

export default function PaymentForm({ initialValues, onSubmit, onBack, total }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("credit_card")
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
    setPaymentError(null)
  }

  const handlePaymentSuccess = (paymentId: string) => {
    setPaymentIntentId(paymentId)

    // Submit the form with payment details
    onSubmit({
      paymentMethod,
      paymentIntentId: paymentId,
      paymentStatus: "succeeded",
    })
  }

  const handlePaymentError = (error: string) => {
    setPaymentError(error)
    setIsProcessing(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "paypal" || paymentMethod === "bank_transfer") {
      // For non-credit card methods, just proceed to the next step
      onSubmit({
        paymentMethod,
        paymentStatus: "pending",
      })
    }
    // For credit card, the StripePaymentElement handles submission
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="text-base">Payment Method</Label>
        <RadioGroup
          value={paymentMethod}
          onValueChange={handlePaymentMethodChange}
          className="flex flex-col space-y-2 mt-2"
        >
          <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-gray-50 [&:has(:checked)]:border-primary">
            <RadioGroupItem value="credit_card" id="credit_card" />
            <Label htmlFor="credit_card" className="flex items-center cursor-pointer">
              <CreditCard className="h-5 w-5 mr-2 text-primary" />
              Credit Card
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-gray-50 [&:has(:checked)]:border-primary">
            <RadioGroupItem value="paypal" id="paypal" />
            <Label htmlFor="paypal" className="flex items-center cursor-pointer">
              <Wallet className="h-5 w-5 mr-2 text-blue-500" />
              PayPal
            </Label>
          </div>

          <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 [&:has(:checked)]:bg-gray-50 [&:has(:checked)]:border-primary">
            <RadioGroupItem value="bank_transfer" id="bank_transfer" />
            <Label htmlFor="bank_transfer" className="flex items-center cursor-pointer">
              <Building className="h-5 w-5 mr-2 text-green-600" />
              Bank Transfer
            </Label>
          </div>
        </RadioGroup>
      </div>

      {paymentMethod === "credit_card" && (
        <div className="space-y-4 pt-4">
          <StripePaymentElement
            amount={total}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
          />
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-muted-foreground">
            You will be redirected to PayPal to complete your payment after reviewing your order.
          </p>
        </div>
      )}

      {paymentMethod === "bank_transfer" && (
        <div className="p-4 bg-gray-50 rounded-md">
          <p className="text-sm text-muted-foreground">
            Bank transfer details will be provided after you place your order.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Back to Shipping
        </Button>

        {paymentMethod !== "credit_card" && <Button type="submit">Continue to Review</Button>}
      </div>
    </form>
  )
}

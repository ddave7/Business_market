"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Japan",
  "China",
  "India",
  "Brazil",
  "Mexico",
  "Spain",
  "Italy",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Singapore",
  "South Korea",
  "New Zealand",
  "Ireland",
  // Add more countries as needed
]

interface ShippingFormProps {
  initialValues: {
    fullName: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  onSubmit: (data: any) => void
}

export default function ShippingForm({ initialValues, onSubmit }: ShippingFormProps) {
  const [formData, setFormData] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleStateChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      state: value,
    }))

    // Clear error when field is edited
    if (errors.state) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.state
        return newErrors
      })
    }
  }

  const handleCountryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      country: value,
      // Reset state if changing from US to another country
      state: value !== "United States" ? "" : prev.state,
    }))

    // Clear error when field is edited
    if (errors.country) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.country
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required"
    }

    // Only require state for US addresses
    if (formData.country === "United States" && !formData.state) {
      newErrors.state = "State is required"
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required"
    } else if (formData.country === "United States" && !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      newErrors.postalCode = "Invalid postal code format"
    }

    if (!formData.country) {
      newErrors.country = "Country is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && <p className="text-sm text-red-500 mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className={errors.address ? "border-red-500" : ""}
        />
        {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? "border-red-500" : ""}
          />
          {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
        </div>

        <div>
          <Label htmlFor="state">{formData.country === "United States" ? "State" : "Province/Region"}</Label>
          {formData.country === "United States" ? (
            <Select value={formData.state} onValueChange={handleStateChange}>
              <SelectTrigger id="state" className={errors.state ? "border-red-500" : ""}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={errors.state ? "border-red-500" : ""}
              placeholder="Province/Region (if applicable)"
            />
          )}
          {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="postalCode">{formData.country === "United States" ? "Zip Code" : "Postal Code"}</Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className={errors.postalCode ? "border-red-500" : ""}
          />
          {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Select value={formData.country} onValueChange={handleCountryChange}>
            <SelectTrigger id="country" className={errors.country ? "border-red-500" : ""}>
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country}</p>}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full">
          Continue to Payment
        </Button>
      </div>
    </form>
  )
}

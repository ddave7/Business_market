"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Import the LoadingOverlay at the top of the file
import LoadingOverlay from "@/app/components/LoadingOverlay"
import DollarTransferAnimation from "@/app/components/DollarTransferAnimation"

const categories = ["Electronics", "Clothing", "Food & Beverages", "Home & Garden", "Office Supplies", "Other"]

export default function AddProductPage() {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
  })

  // Check authentication status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include",
          cache: "no-store",
        })
        const data = await res.json()

        if (!data.authenticated) {
          router.push("/login?from=/products/add")
          return
        }

        setIsAuthenticated(true)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login?from=/products/add")
      }
    }

    checkAuth()
  }, [router])

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleImageUpload(event) {
    if (!event.target.files || event.target.files.length === 0) return

    const file = event.target.files[0]

    try {
      setUploadProgress(0)
      setError("")
      setDiagnosticInfo(null)

      console.log("Starting image upload")

      // Convert file to base64
      const reader = new FileReader()

      reader.onloadstart = () => {
        setUploadProgress(10)
      }

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100 * 0.5) // 50% for reading
          setUploadProgress(percentComplete)
        }
      }

      reader.onload = async (e) => {
        try {
          setUploadProgress(50) // 50% complete after reading

          // Get base64 data
          const base64Data = e.target?.result?.toString().split(",")[1]

          if (!base64Data) {
            throw new Error("Failed to convert image to base64")
          }

          // Send base64 data to server
          const response = await fetch("/api/upload-base64", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              base64Data,
              fileType: file.type,
              fileName: file.name,
            }),
            credentials: "include",
          })

          setUploadProgress(90) // 90% complete after sending

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Upload failed with status: ${response.status}`)
          }

          const data = await response.json()
          setImageUrl(data.fileUrl)
          setUploadProgress(100)
          console.log("Upload successful:", data)
        } catch (error) {
          console.error("Error processing or uploading image:", error)
          setError(error instanceof Error ? error.message : "Error uploading image")
          setUploadProgress(0)
        }
      }

      reader.onerror = () => {
        console.error("Error reading file")
        setError("Error reading file")
        setUploadProgress(0)
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Upload error:", error)
      setError(error instanceof Error ? error.message : "Error uploading image")
      setUploadProgress(0)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setLoading(true)
    setDiagnosticInfo(null)

    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.stock || !category) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    // Validate numeric fields
    if (isNaN(Number.parseFloat(formData.price)) || Number.parseFloat(formData.price) < 0) {
      setError("Price must be a valid positive number")
      setLoading(false)
      return
    }

    if (isNaN(Number.parseInt(formData.stock)) || Number.parseInt(formData.stock) < 0) {
      setError("Stock must be a valid positive number")
      setLoading(false)
      return
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: category,
      stock: Number.parseInt(formData.stock),
      imageUrl: imageUrl || "/placeholder.svg?height=400&width=400",
    }

    try {
      console.log("Submitting product data:", productData)

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
        credentials: "include",
      })

      console.log("Response status:", res.status)

      // Check if response is JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("Non-JSON response:", text.substring(0, 200))

        setDiagnosticInfo({
          status: res.status,
          statusText: res.statusText,
          contentType: contentType,
          responseText: text.substring(0, 500),
        })

        throw new Error(`Server returned non-JSON response with status: ${res.status}`)
      }

      const data = await res.json()

      if (!res.ok) {
        console.error("Product creation error:", data)
        throw new Error(data.error || "Error adding product")
      }

      console.log("Product created successfully:", data)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setError(error instanceof Error ? error.message : "Error adding product")
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="p-8 text-center">
        <DollarTransferAnimation message="Checking authentication..." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {diagnosticInfo && (
        <div className="bg-gray-100 p-4 rounded-md text-sm mb-4">
          <h3 className="font-bold mb-2">Diagnostic Information:</h3>
          <pre className="whitespace-pre-wrap overflow-auto max-h-40">{JSON.stringify(diagnosticInfo, null, 2)}</pre>
        </div>
      )}

      <LoadingOverlay isLoading={loading} message="Adding your product...">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form content remains the same */}
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <Label>Category</Label>
            <Select required value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="image">Product Image</Label>
            <Input id="image" name="image" type="file" accept="image/*" onChange={handleImageUpload} />
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-4 flex flex-col items-center">
                <DollarTransferAnimation size="small" message={`Uploading: ${uploadProgress}%`} />
              </div>
            )}
            {imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-green-600 mb-2">Image uploaded successfully!</p>
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Product preview"
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          <Button type="submit" className="w-full">
            Add Product
          </Button>
        </form>
      </LoadingOverlay>
    </div>
  )
}

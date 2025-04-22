"use client"

import type React from "react"

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

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  })

  useEffect(() => {
    async function fetchProduct() {
      try {
        setError("")
        const res = await fetch(`/api/products/${params.id}`)

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: `HTTP error: ${res.status}` }))
          throw new Error(errorData.error || "Error fetching product")
        }

        const data = await res.json()
        setProduct(data)
        setImageUrl(data.imageUrl)

        // Initialize form data
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          stock: data.stock.toString(),
        })
      } catch (error) {
        console.error("Error fetching product:", error)
        setError(error instanceof Error ? error.message : "Error fetching product")
      }
    }
    fetchProduct()
  }, [params.id])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
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
            const errorData = await response.json().catch(() => ({ error: `HTTP error: ${response.status}` }))
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)
    setDiagnosticInfo(null)

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number.parseFloat(formData.price),
      category: formData.category,
      stock: Number.parseInt(formData.stock),
      imageUrl: imageUrl,
    }

    try {
      console.log("Sending update request with data:", productData)

      const res = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      console.log("Update response status:", res.status)

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

      // Parse JSON response
      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Failed to parse server response")
      }

      if (!res.ok) {
        console.error("Update error:", data)
        throw new Error(data.error || "Error updating product")
      }

      console.log("Product updated successfully:", data)
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error in handleSubmit:", error)
      setError(error instanceof Error ? error.message : "Error updating product")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      setError("")
      setDiagnosticInfo(null)

      const res = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
      })

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

      // Parse JSON response
      let data
      try {
        data = await res.json()
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError)
        throw new Error("Failed to parse server response")
      }

      if (!res.ok) {
        console.error("Delete error:", data)
        throw new Error(data.error || "Error deleting product")
      }

      console.log("Product deleted successfully")
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error in handleDelete:", error)
      setError(error instanceof Error ? error.message : "Error deleting product")
    }
  }

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto p-8 flex justify-center">
        <DollarTransferAnimation message="Loading product details..." />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

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

      <LoadingOverlay isLoading={loading} message="Updating your product...">
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
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            >
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
                  className="mt-2 max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button type="submit" disabled={loading}>
              Update Product
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Product
            </Button>
          </div>
        </form>
      </LoadingOverlay>
    </div>
  )
}

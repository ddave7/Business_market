import { Suspense } from "react"
import ProductsContent from "./products-content"
import ProductsLoading from "./loading"

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsContent />
    </Suspense>
  )
}

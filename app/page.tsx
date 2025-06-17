import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import ProductSearch from "./components/ProductSearch"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-white">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-blue-900">Welcome to Commercial Marketplace</h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-700">
          Connect with businesses, buy and sell products in a secure and efficient platform
        </p>

        {/* Add search component */}
        <div className="mb-8 max-w-lg mx-auto">
          <ProductSearch placeholder="Search for products..." />
        </div>

        <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
          <Link href="/register">
            <Button size="lg" className="w-full md:w-auto">
              Register Your Business
            </Button>
          </Link>
          <Link href="/products">
            <Button size="lg" variant="outline" className="w-full md:w-auto">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <Image src="/icon-connect.svg" alt="Connect" width={64} height={64} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Connect</h2>
          <p className="text-gray-600">Network with businesses from around the world</p>
        </div>
        <div className="text-center">
          <Image src="/icon-trade.svg" alt="Trade" width={64} height={64} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Trade</h2>
          <p className="text-gray-600">Buy and sell products with ease and security</p>
        </div>
        <div className="text-center">
          <Image src="/icon-grow.svg" alt="Grow" width={64} height={64} className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Grow</h2>
          <p className="text-gray-600">Expand your business reach and increase profits</p>
        </div>
      </div>
    </div>
  )
}

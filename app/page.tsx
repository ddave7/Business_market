import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import ProductSearch from "./components/ProductSearch"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/10 to-background">
      <div className="text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">Welcome to Commercial Marketplace</h1>
        <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
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
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
            <Image src="/icon-connect.png" alt="Connect" width={32} height={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Connect</h2>
          <p className="text-muted-foreground">Network with businesses from around the world</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
            <Image src="/icon-trade.png" alt="Trade" width={32} height={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Trade</h2>
          <p className="text-muted-foreground">Buy and sell products with ease and security</p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full">
            <Image src="/icon-grow.png" alt="Grow" width={32} height={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Grow</h2>
          <p className="text-muted-foreground">Expand your business reach and increase profits</p>
        </div>
      </div>
    </div>
  )
}

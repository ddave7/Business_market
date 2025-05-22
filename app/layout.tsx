import "./globals.css"
import { Inter } from "next/font/google"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { CartProvider } from "./contexts/CartContext"
import { Suspense } from "react"
import GlobalLoading from "./components/GlobalLoading"
import type React from "react"
import DollarTransferAnimation from "./components/DollarTransferAnimation"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Commercial Marketplace",
  description: "A platform for businesses to sell and purchase products",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} flex flex-col min-h-screen bg-background`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <CartProvider>
              <div className="flex flex-col min-h-screen">
                <Suspense fallback={<div className="h-16 bg-background shadow-md"></div>}>
                  <Header />
                </Suspense>
                <main className="flex-grow container mx-auto px-4 py-8">
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-[50vh]">
                        <DollarTransferAnimation message="Loading..." />
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                </main>
                <Footer />
              </div>
              <GlobalLoading />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

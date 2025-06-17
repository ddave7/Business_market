import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm text-gray-600">
              Commercial Marketplace is a platform connecting businesses for seamless product exchange and growth
              opportunities.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm text-gray-600 hover:text-gray-900">
                  Register Business
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-sm text-gray-600">Email: support@commercialmarketplace.com</p>
            <p className="text-sm text-gray-600">Phone: (123) 456-7890</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">&copy; 2025 Commercial Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

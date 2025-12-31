import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ScanBarcode, Home, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Funny 404 Animation */}
      <div className="mb-8 relative">
        <div className="text-9xl font-bold text-gray-200 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <ScanBarcode className="w-24 h-24 text-gray-400 animate-pulse" />
        </div>
      </div>

      {/* Funny Messages */}
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
        Oops! Barcode Not Found! 📦
      </h1>
      
      <div className="max-w-md space-y-3 mb-8">
        <p className="text-lg text-gray-600">
          We scanned everywhere, but this page doesn&apos;t exist in our database!
        </p>
        <p className="text-base text-gray-500 italic">
          🔍 Error Code: <span className="font-mono font-semibold">PAGE_NOT_IN_INVENTORY</span>
        </p>
        <p className="text-base text-gray-500">
          Looks like this product was discontinued... or never existed in the first place! 🤷‍♂️
        </p>
      </div>

      {/* Funny Suggestions */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 mb-8 max-w-md">
        <p className="text-sm font-semibold text-yellow-800 mb-2">💡 Troubleshooting Tips:</p>
        <ul className="text-sm text-yellow-700 text-left space-y-1">
          <li>✓ Try holding the URL steady for 2-3 seconds</li>
          <li>✓ Make sure your browser has good WiFi lighting</li>
          <li>✓ Check if the page is damaged or expired</li>
          <li>✓ Have you tried turning it off and on again?</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/">
          <Button className="flex items-center gap-2 cursor-pointer">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}


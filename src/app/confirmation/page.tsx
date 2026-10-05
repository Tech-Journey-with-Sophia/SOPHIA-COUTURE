'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { CheckCircle2 } from 'lucide-react'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order')

  return (
    <div className="max-w-md mx-auto mt-20 p-8 text-center bg-white border border-gray-100 rounded-xl shadow-sm">
      <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
      <p className="text-gray-600 mb-6">
        Thank you for your purchase. Your order has been placed successfully and a confirmation email has been sent.
      </p>
      {orderNumber && (
        <div className="bg-gray-50 p-4 rounded-md mb-8">
          <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
          <p className="font-mono font-bold text-lg text-gray-900">{orderNumber}</p>
        </div>
      )}
      <Link href="/orders" className="bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition inline-block">
        View Order History
      </Link>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="mt-20 text-center">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  )
}

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const revalidate = 0

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Order History</h1>
      
      {!orders || orders.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/" className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map(order => (
            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                  <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Total</p>
                  <p className="font-medium text-gray-900">${order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Status</p>
                  <p className="font-medium text-gray-900">{order.status}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 uppercase tracking-wider mb-1">Order #</p>
                  <p className="font-mono font-medium text-gray-900">{order.order_number}</p>
                </div>
              </div>
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-4">Items</h4>
                <ul className="divide-y divide-gray-100">
                  {order.order_items?.map((item: any) => (
                    <li key={item.id} className="py-3 flex justify-between">
                      <div className="flex gap-4">
                        <span className="text-gray-500">{item.quantity}x</span>
                        <Link href={`/products/${item.product_id}`} className="font-medium text-blue-600 hover:underline">
                          {item.product_name}
                        </Link>
                      </div>
                      <span className="text-gray-900">${item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { sendOrderConfirmation } from '@/utils/mailgun'
import { z } from 'zod'

const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postal_code: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1, 'Cart is empty')
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = checkoutSchema.parse(body)

    // Fetch trusted products
    const productIds = parsed.items.map(i => i.product_id)
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true)

    if (productError || !products || products.length !== productIds.length) {
      return NextResponse.json({ error: 'Invalid or unavailable products in cart' }, { status: 400 })
    }

    let subtotal = 0
    const orderItems = []

    for (const item of parsed.items) {
      const product = products.find(p => p.id === item.product_id)!
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json({ error: `Not enough stock for ${product.name}` }, { status: 400 })
      }
      
      const itemSubtotal = product.price * item.quantity
      subtotal += itemSubtotal
      
      orderItems.push({
        product_id: product.id,
        product_name: product.name,
        unit_price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      })
    }

    const total = subtotal // Add taxes/shipping here if needed in future

    // Generate random order number
    const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 10).toUpperCase()

    // Insert Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        subtotal,
        total,
        customer_name: parsed.name,
        customer_email: parsed.email,
        phone: parsed.phone,
        address: parsed.address,
        city: parsed.city,
        state: parsed.state,
        postal_code: parsed.postal_code,
        country: parsed.country,
        status: 'Confirmed'
      })
      .select()
      .single()

    if (orderError) {
      throw orderError
    }

    // Insert Order Items
    const itemsToInsert = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      throw itemsError
    }

    // Attempt email delivery
    try {
      await sendOrderConfirmation(order, itemsToInsert)
    } catch (e) {
      console.error('Mailgun delivery failed, but order was saved.', e)
      // Do not fail the checkout if email fails, as architecture doc says
    }

    return NextResponse.json({ order_number: order.order_number, success: true })

  } catch (err: any) {
    if (err && typeof err === 'object' && 'errors' in err && Array.isArray(err.errors)) {
      return NextResponse.json({ error: err.errors[0]?.message || 'Validation error' }, { status: 400 })
    }
    console.error('Checkout error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const newProducts = [
  {
    name: 'Adeola Two-piece',
    slug: 'adeola-two-piece',
    description: 'An elegant and comfortable two-piece set, perfect for any occasion.',
    price: 55.00,
    stock_quantity: 50,
    category: 'Sets',
    image_url: '/products/Adeola Two-piece.jpeg',
    is_active: true
  },
  {
    name: 'Amanda Set',
    slug: 'amanda-set',
    description: 'A stylish and versatile set for your daily wardrobe.',
    price: 50.00,
    stock_quantity: 50,
    category: 'Sets',
    image_url: '/products/Amanda Set.jpeg',
    is_active: true
  },
  {
    name: 'Nkechi Two-piece',
    slug: 'nkechi-two-piece',
    description: 'Premium quality two-piece with a flawless silhouette.',
    price: 60.00,
    stock_quantity: 50,
    category: 'Sets',
    image_url: '/products/Nkechi Two-piece.jpeg',
    is_active: true
  },
  {
    name: 'Stella dress',
    slug: 'stella-dress',
    description: 'A timeless dress crafted from breathable fabrics.',
    price: 75.00,
    stock_quantity: 40,
    category: 'Dresses',
    image_url: '/products/Stella dress.jpeg',
    is_active: true
  },
  {
    name: 'Nkiruka Two-piece',
    slug: 'nkiruka-two-piece',
    description: 'Modern two-piece designed for effortless style.',
    price: 65.00,
    stock_quantity: 60,
    category: 'Sets',
    image_url: '/products/Nkiruka Two-piece.jpeg',
    is_active: true
  },
  {
    name: 'Sophia Skirt',
    slug: 'sophia-skirt',
    description: 'A chic skirt that pairs beautifully with your favorite tops.',
    price: 40.00,
    stock_quantity: 80,
    category: 'Bottoms',
    image_url: '/products/Sophia Skirt.jpeg',
    is_active: true
  }
]

async function run() {
  console.log('Connecting to Supabase...')
  
  // Clean up order_items and orders first to prevent foreign key constraint errors
  console.log('Deleting test orders to clear constraints...')
  await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('Deleting existing products...')
  const { error: delError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  
  if (delError) {
    console.error('Failed to delete products:', delError)
    return
  }

  console.log('Inserting new products...')
  const { error: insertError } = await supabase.from('products').insert(newProducts)
  
  if (insertError) {
    console.error('Failed to insert products:', insertError)
    return
  }
  
  console.log('Successfully replaced products!')
}

run()

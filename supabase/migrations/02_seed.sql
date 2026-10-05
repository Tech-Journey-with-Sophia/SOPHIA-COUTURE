-- Seed products
INSERT INTO products (name, slug, description, price, image_url, category, stock_quantity, is_active)
VALUES
  (
    'Premium Wireless Headphones',
    'premium-wireless-headphones',
    'High-quality noise-canceling wireless headphones with 30-hour battery life.',
    299.99,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
    'Electronics',
    50,
    true
  ),
  (
    'Minimalist Desk Lamp',
    'minimalist-desk-lamp',
    'Modern LED desk lamp with adjustable brightness and color temperature.',
    45.50,
    'https://images.unsplash.com/photo-1534073828943-f801091bb18c?q=80&w=600&auto=format&fit=crop',
    'Home',
    100,
    true
  ),
  (
    'Mechanical Keyboard',
    'mechanical-keyboard',
    'Tenkeyless mechanical keyboard with tactile switches and RGB backlighting.',
    129.99,
    'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop',
    'Electronics',
    25,
    true
  ),
  (
    'Ceramic Coffee Mug',
    'ceramic-coffee-mug',
    'Hand-crafted ceramic coffee mug, microwave and dishwasher safe.',
    18.00,
    'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=600&auto=format&fit=crop',
    'Kitchen',
    200,
    true
  ),
  (
    'Inactive Product',
    'inactive-product',
    'This product is no longer available.',
    9.99,
    '',
    'Misc',
    0,
    false
  );

export async function sendOrderConfirmation(order: any, items: any[]) {
  const apiKey = process.env.MAILGUN_API_KEY!;
  const domain = process.env.MAILGUN_DOMAIN!;
  const from = process.env.MAILGUN_FROM!;
  const baseUrl = process.env.MAILGUN_API_BASE_URL || 'https://api.mailgun.net';
  
  if (!apiKey || !domain || !from) {
    console.warn("Mailgun credentials missing. Skipping email.");
    return;
  }

  const url = `${baseUrl}/v3/${domain}/messages`;
  const auth = Buffer.from(`api:${apiKey}`).toString('base64');
  
  const itemsText = items.map(i => `${i.quantity}x ${i.product_name} - $${i.subtotal}`).join('\n');
  const itemsHtml = items.map(i => `<li>${i.quantity}x ${i.product_name} - $${i.subtotal}</li>`).join('');

  const body = new URLSearchParams({
    from: from,
    to: order.customer_email,
    subject: `Order Confirmation #${order.order_number}`,
    text: `Hello ${order.customer_name},\n\nThank you for your order!\n\nOrder #${order.order_number}\n\nItems:\n${itemsText}\n\nTotal: $${order.total}\n\nWe will ship it to:\n${order.address}, ${order.city}, ${order.state} ${order.postal_code || ''}, ${order.country}\n\nThanks,\nExciting Shop`,
    html: `<p>Hello ${order.customer_name},</p><p>Thank you for your order!</p><p><strong>Order #${order.order_number}</strong></p><ul>${itemsHtml}</ul><p><strong>Total: $${order.total}</strong></p><p>We will ship it to:<br>${order.address}<br>${order.city}, ${order.state} ${order.postal_code || ''}<br>${order.country}</p><p>Thanks,<br>Exciting Shop</p>`
  });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Mailgun Error:', errorText);
    throw new Error('Failed to send confirmation email');
  }
}

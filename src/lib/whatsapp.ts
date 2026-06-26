/** Phone number in international format without + or spaces */
export const WA_NUMBER = '918498837027'

/** Build a wa.me deep-link. Works on mobile (native app) and desktop (web.whatsapp.com). */
export function waUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WA_CATALOGUE_MSG =
  'Hi Yuvarani Silks, I would like to view your latest saree and jewellery catalogue.'

export function waProductMsg(
  title: string,
  price: string,
  url: string,
  imageUrl?: string,
  productId?: string,
): string {
  return (
    `Hi Yuvarani Silks,\n\n` +
    `I am interested in this product:\n\n` +
    `Product: ${title}\n` +
    (productId ? `Product ID: ${productId}\n` : '') +
    `Price: ${price}\n` +
    `Product Link: ${url}\n` +
    (imageUrl ? `Image: ${imageUrl}\n` : '') +
    `\nPlease provide more details.`
  )
}

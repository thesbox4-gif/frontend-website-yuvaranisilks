/** Phone number in international format without + or spaces */
export const WA_NUMBER = '918498837027'

/** Build a wa.me deep-link. Works on mobile (native app) and desktop (web.whatsapp.com). */
export function waUrl(message: string): string {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WA_CATALOGUE_MSG =
  'Hi Yuvarani Silks, I would like to view your latest saree and jewellery catalogue.'

export function waProductMsg(title: string, price: string, url: string): string {
  return (
    `Hi Yuvarani Silks! 🙏\n\n` +
    `I'm interested in:\n*${title}*\nPrice: ${price}\n\n` +
    `Product link: ${url}\n\n` +
    `Could you please share more details and availability?`
  )
}

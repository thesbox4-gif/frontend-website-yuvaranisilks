import type { Banner } from '@/types'

export const MOCK_BANNERS: Banner[] = [
  {
    id: 'mock-banner-1',
    title: 'The Kanjivaram Legacy',
    subtitle: 'Handcrafted Silk Sarees',
    description:
      'Timeless weaves dipped in pure gold zari, directly from heritage looms. Crafted for the modern bride who treasures tradition.',
    cta_text: 'Explore Sarees',
    cta_href: '/products?type=saree',
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&auto=format&fit=crop',
    display_order: 1,
    active: true,
  },
  {
    id: 'mock-banner-2',
    title: 'Heritage Banarasi',
    subtitle: 'Pure Silk & Zari Brocades',
    description:
      'Luxurious textures and royal motifs, hand-woven in the heart of Varanasi. Embodying grace, heritage, and pure elegance.',
    cta_text: 'Shop Banarasi',
    cta_href: '/products?type=saree',
    image_url: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=1920&auto=format&fit=crop',
    display_order: 2,
    active: true,
  },
  {
    id: 'mock-banner-3',
    title: 'Temple Jewellery',
    subtitle: '22k Gold Antique Masterpieces',
    description:
      'Exquisite craftsmanship inspired by divine motifs. Hand-carved necklaces, jhumkas, and bangles designed to be passed down generations.',
    cta_text: 'Shop Jewellery',
    cta_href: '/products?type=jewellery',
    image_url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1920&auto=format&fit=crop',
    display_order: 3,
    active: true,
  },
  {
    id: 'mock-banner-4',
    title: 'Traditional Splendor',
    subtitle: 'Exclusive Collection Since 1992',
    description:
      'Step into a world of pure silk and traditional Indian artistry. Handpicked collections celebrating the spirit of Indian weaves.',
    cta_text: 'Browse All Products',
    cta_href: '/products',
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1920&auto=format&fit=crop',
    display_order: 4,
    active: true,
  },
]

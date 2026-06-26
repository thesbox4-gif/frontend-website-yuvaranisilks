export type ProductType = 'saree' | 'jewellery'
export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface ProductImage {
  url: string
  is_primary: boolean
  color?: string
  alt_text?: string
  display_order?: number
}

export interface Variant {
  id?: string
  color: string
  size: string
  quantity: number
  sold_count?: number
  sku: string
  image_url?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  image_url?: string
  description?: string
  parent_id?: string | null
  display_order?: number
  active?: boolean
}

export interface Product {
  id: string
  title: string
  description?: string
  type: ProductType
  base_price: number
  discount_pct: number
  coupon_code?: string
  coupon_disc?: number
  published: boolean
  created_at: string
  category?: Category
  images: ProductImage[]
  variants: Variant[]

  // Saree-specific attributes
  fabric?: string
  color?: string
  occasion?: string
  blouse_included?: boolean

  // Jewellery-specific attributes
  material?: string
  weight?: string
  jewellery_type?: string
}

export interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  product: {
    id: string
    title: string
    images: ProductImage[]
  }
  variant: {
    id: string
    color: string
    size: string
    sku: string
  }
}

export interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  discount_amount: number
  coupon_applied?: string
  refund_status?: 'requested' | 'completed' | null
  refund_reason?: string | null
  shiprocket_awb?: string
  shiprocket_courier_name?: string
  tracking_url?: string
  shipment_status?: string
  expected_delivery_date?: string
  created_at: string
  updated_at: string
  address?: {
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
  }
  order_items: OrderItem[]
}

// ─── Banner ──────────────────────────────────────────────────────────────────

export interface Banner {
  id: string
  title: string
  subtitle: string
  description: string
  cta_text: string
  cta_href: string
  image_url: string
  display_order: number
  active: boolean
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export type HomepageSectionType =
  | 'new_arrivals'
  | 'trending'
  | 'best_sellers'
  | 'promo_banner'
  | 'featured_categories'
  | 'featured_sarees'
  | 'featured_jewellery'
  | 'wedding_collection'

export interface HomepageSection {
  id: string
  type: HomepageSectionType
  title: string
  subtitle?: string
  /** For product sections: specific product IDs chosen by admin */
  product_ids?: string[]
  /** For promo_banner sections: image URL */
  banner_image_url?: string
  /** For promo_banner sections: link when clicked */
  banner_link?: string
  /** For featured_categories: category IDs to highlight */
  category_ids?: string[]
  /** Override new-arrivals window in days. Backend-configurable; defaults to NEW_ARRIVALS_DAYS (30). */
  new_arrivals_days?: number
  active: boolean
  display_order: number
}

export interface HomepageSettings {
  sections: HomepageSection[]
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_orders: number
  total_revenue: number
  total_products: number
  total_customers: number
  orders_today: number
  revenue_today: number
  pending_orders: number
  low_stock_products: number
}

export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  created_at: string
  total_orders?: number
  total_spent?: number
}

export interface UploadResponse {
  url: string
  filename: string
}

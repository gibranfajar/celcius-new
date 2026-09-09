// Types mirroring the JSON shape returned by clcs-backend's `App\Http\Resources\Api\*`
// classes (see clcs-backend/app/Http/Resources/Api). Keep these in sync with the
// backend resources whenever a field is added, renamed, or removed there.

export interface Paginated<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
  };
}

export interface ApiCollection<T> {
  data: T[];
}

export interface ApiResource<T> {
  data: T;
}

export type ProductType = "men" | "women";
export type DiscountType = "percent" | "nominal";
export type MasterCategory = "apparel" | "accessories" | "footwear";

export interface ProductImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface ProductSize {
  id: number;
  size: string;
  stock: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  slug: string;
  color: {
    id: number;
    name: string;
    code: string;
  };
  thumbnail_url: string;
  total_stock: number;
  images: ProductImage[];
  sizes: ProductSize[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  master_category: MasterCategory;
}

export interface CollectionImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface Collection {
  id: number;
  name: string;
  slug: string;
  type: string;
  thumbnail_url: string;
  images: CollectionImage[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  article: string;
  type: ProductType;
  price: number;
  discount_type: DiscountType | null;
  discount_value: number | null;
  final_price: number;
  thumbnail_url: string;
  total_stock: number;
  description?: string;
  sizechart?: string;
  weight?: number;
  categories?: Category[];
  collections?: Collection[];
  product_cares?: ProductCare[];
  variants?: ProductVariant[];
}

export interface Banner {
  id: number;
  title: string;
  image_url: string;
  page: string;
  position: string;
  display: "desktop" | "tablet" | "mobile" | null;
  sort_order: number;
  collection?: Collection | null;
  lookbook?: Lookbook | null;
}

export interface LookbookImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface Lookbook {
  id: number;
  title: string;
  slug: string;
  description: string;
  type: string;
  thumbnail_url: string;
  images: LookbookImage[];
}

export interface NewsImage {
  id: number;
  url: string;
  sort_order: number;
}

export interface News {
  id: number;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  images: NewsImage[];
  created_at: string;
}

export interface ProductCare {
  id: number;
  material: string;
  care_instructions: string;
  image_url: string;
  image_detail_url: string;
}

export interface About {
  content: string;
  image_url: string;
}

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface LocationOperationalHour {
  day_of_week: DayOfWeek;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

export interface Location {
  id: number;
  store_code: string;
  store_name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  maps_url: string | null;
  phone_number: string | null;
  type: string;
  operational_hours: LocationOperationalHour[];
}

export type PageKey =
  | "privacy_policy"
  | "return_exchange"
  | "terms_conditions"
  | "shipping_delivery"
  | "size_guide"
  | "warranty_policy"
  | "contact_us";

export interface Page {
  key: PageKey;
  title: string;
  content: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
}

export interface UserAddress {
  id: number;
  receiver_name: string;
  phone_number: string;
  province_id: number;
  province: string;
  city_id: number;
  city: string;
  district_id: number;
  district: string;
  subdistrict_id: number;
  subdistrict: string;
  postal_code: string;
  address: string;
  is_primary: boolean;
}

export interface UserVoucher {
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount: number | null;
  min_purchase: number;
  is_used: boolean;
  expired_at: string | null;
}

export type OrderStatus =
  | "unpaid"
  | "paid"
  | "processing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "pending"
  | "settlement"
  | "expire"
  | "cancel"
  | "deny"
  | "refund";

export interface OrderItem {
  product_article: string;
  product_name: string;
  variant_color_name: string;
  size_name: string;
  normal_price: number;
  discount_amount: number;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface OrderShipment {
  courier_code: string;
  courier_service: string;
  waybill_number: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

export interface OrderPayment {
  payment_method: string;
  payment_channel: string | null;
  status: PaymentStatus;
  paid_at: string | null;
}

export interface OrderHistory {
  status: string;
  description: string;
  created_at: string;
}

export interface Order {
  order_id: number;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  voucher_code: string | null;
  shipping_cost: number;
  grand_total: number;
  shipping_receiver_name: string;
  shipping_email: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_province: string;
  shipping_city: string;
  shipping_district: string;
  shipping_postal_code: string;
  canceled_at: string | null;
  canceled_reason: string | null;
  created_at: string;
  items: OrderItem[];
  shipment: OrderShipment | null;
  payment: OrderPayment | null;
  histories: OrderHistory[];
}

export interface AuthResponse {
  user: User;
  token: string;
  voucher?: UserVoucher;
}

export interface CheckoutResponse {
  order_number: string;
  subtotal: number;
  discount_amount: number;
  grand_total: number;
  snap_token: string;
  redirect_url: string;
}

export interface ShippingArea {
  id: number;
  name: string;
  zip_code?: string;
}

export interface ShippingRate {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export type Product = {
  category: string;
  description: string;
  discounted_price: number | null;
  distributor_info: string;
  model: string;
  name: string;
  origin: string | null;
  power_usage: string | null;
  price: number;
  product_id: number;
  quantity_in_stock: number;
  roast_level: string | null;
  serial_number: string;
  warranty_status: string;
  image_url: string | null;
  rating: number;
  cost: number | null;
  wishlist_id: number | null;
};

export type CartProduct = Product & { quantity: number }

export interface Restaurant {
  id: string;
  name: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  restaurantId?: string;
}

export interface Order {
  id: string;
  orderId: string;
  restaurants: Restaurant[];
  items: OrderItem[];
  totalAmount: number;
  deliveryAgent: string;
  paymentStatus: 'cash' | 'account' | 'pending';
  date: Date;
  createdAt: Date;
}

export interface FilterOptions {
  date?: Date;
  restaurantName?: string;
  deliveryAgent?: string;
  paymentStatus?: string;
}

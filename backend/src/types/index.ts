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
  updatedAt?: Date;
}

export interface CreateOrderRequest extends Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {}

export interface UpdateOrderRequest extends Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>> {}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  timestamp: string;
}

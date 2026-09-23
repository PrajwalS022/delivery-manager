import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Order } from '../types';
import { localStorageService } from './localStorageService';

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TIMEOUT = 10000; // 10 seconds timeout

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

// Helper to make API calls with timeout
const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Convert API order response to frontend Order type
const mapApiOrderToFrontend = (apiOrder: any): Order => ({
  id: apiOrder.id,
  orderId: apiOrder.orderId,
  restaurants: apiOrder.restaurants,
  items: apiOrder.items,
  totalAmount: apiOrder.totalAmount,
  deliveryAgent: apiOrder.deliveryAgent,
  paymentStatus: apiOrder.paymentStatus,
  date: new Date(apiOrder.date),
  createdAt: new Date(apiOrder.createdAt),
});

// Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    console.log('getAllOrders: Starting...');

    // Try backend API first
    try {
      console.log('getAllOrders: Attempting backend API fetch...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/orders?pageSize=1000`);

      if (response.ok) {
        const result: PaginatedResponse<any> = await response.json();
        if (result.success && result.data) {
          console.log('✓ Backend API: Successfully fetched', result.data.length, 'orders');
          // Save to localStorage for offline support
          const orders = result.data.map(mapApiOrderToFrontend);
          orders.forEach(order => localStorageService.saveOrder(order));
          return orders;
        }
      } else {
        console.warn('getAllOrders: Backend API error, status:', response.status);
      }
    } catch (apiErr) {
      console.warn('getAllOrders: Backend API fetch failed:', apiErr instanceof Error ? apiErr.message : String(apiErr));
    }

    // Fallback to Supabase if configured
    if (isSupabaseConfigured()) {
      console.log('getAllOrders: Attempting Supabase fetch...');

      try {
        const { data, error, status } = await supabase
          .from('orders')
          .select('*')
          .order('createdAt', { ascending: false });

        console.log('getAllOrders: Supabase response status:', status);

        if (error) {
          console.warn('getAllOrders: Supabase error:', error.message);
        } else if (data && data.length > 0) {
          console.log('✓ Supabase: Successfully fetched', data.length, 'orders');
          return data.map((order: any) => ({
            ...order,
            date: new Date(order.date),
            createdAt: new Date(order.createdAt),
            restaurants: typeof order.restaurants === 'string' ? JSON.parse(order.restaurants) : order.restaurants,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items,
          }));
        }
      } catch (supErr) {
        console.warn('getAllOrders: Supabase fetch failed:', supErr instanceof Error ? supErr.message : String(supErr));
      }
    }

    // Final fallback to localStorage
    console.log('getAllOrders: Using localStorage fallback...');
    const orders = localStorageService.getAllOrders();

    if (orders.length > 0) {
      console.log('✓ LocalStorage: Retrieved', orders.length, 'orders');
      return orders;
    }

    console.log('⚠ No orders found');
    return [];
  } catch (error) {
    console.error('getAllOrders: Exception caught:', error);
    try {
      const orders = localStorageService.getAllOrders();
      console.log('getAllOrders: Retrieved', orders.length, 'from localStorage (error fallback)');
      return orders;
    } catch {
      return [];
    }
  }
};

// Create new order
export const createOrder = async (order: Omit<Order, 'id' | 'createdAt'>): Promise<Order | null> => {
  try {
    console.log('createOrder: Starting...');

    // Try backend API first
    try {
      console.log('createOrder: Attempting backend API...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const result: ApiResponse<any> = await response.json();
        if (result.success && result.data) {
          console.log('✓ Backend API: Order created successfully');
          const newOrder = mapApiOrderToFrontend(result.data);
          // Save to localStorage as well
          localStorageService.saveOrder(newOrder);
          return newOrder;
        }
      } else {
        console.warn('createOrder: Backend API error, status:', response.status);
        const error = await response.json();
        console.warn('createOrder: Backend error details:', error);
      }
    } catch (apiErr) {
      console.warn('createOrder: Backend API failed:', apiErr instanceof Error ? apiErr.message : String(apiErr));
    }

    // Fallback: Save locally and try Supabase
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    localStorageService.saveOrder(newOrder);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .insert([{
            id: newOrder.id,
            orderId: newOrder.orderId,
            restaurants: JSON.stringify(newOrder.restaurants),
            items: JSON.stringify(newOrder.items),
            totalAmount: newOrder.totalAmount,
            deliveryAgent: newOrder.deliveryAgent,
            paymentStatus: newOrder.paymentStatus,
            date: newOrder.date.toISOString(),
            createdAt: newOrder.createdAt.toISOString(),
          }])
          .select();

        if (error) {
          console.warn('createOrder: Supabase sync failed:', error.message);
        } else {
          console.log('✓ createOrder: Synced to Supabase');
        }
      } catch (supErr) {
        console.warn('createOrder: Supabase sync exception:', supErr instanceof Error ? supErr.message : String(supErr));
      }
    }

    return newOrder;
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id: string, order: Omit<Order, 'id' | 'createdAt'>): Promise<Order | null> => {
  try {
    console.log('updateOrder: Starting for order:', id);

    // Try backend API first
    try {
      console.log('updateOrder: Attempting backend API...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const result: ApiResponse<any> = await response.json();
        if (result.success && result.data) {
          console.log('✓ Backend API: Order updated successfully');
          const updatedOrder = mapApiOrderToFrontend(result.data);
          // Save to localStorage as well
          localStorageService.saveOrder(updatedOrder);
          return updatedOrder;
        }
      } else {
        console.warn('updateOrder: Backend API error, status:', response.status);
      }
    } catch (apiErr) {
      console.warn('updateOrder: Backend API failed:', apiErr instanceof Error ? apiErr.message : String(apiErr));
    }

    // Fallback: Update locally
    const updated: Order = {
      ...order,
      id,
      createdAt: new Date(),
    };

    localStorageService.saveOrder(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .update({
            orderId: order.orderId,
            restaurants: JSON.stringify(order.restaurants),
            items: JSON.stringify(order.items),
            totalAmount: order.totalAmount,
            deliveryAgent: order.deliveryAgent,
            paymentStatus: order.paymentStatus,
            date: order.date.toISOString(),
          })
          .eq('id', id);

        console.log('✓ updateOrder: Synced to Supabase');
      } catch (supErr) {
        console.warn('updateOrder: Supabase sync failed:', supErr instanceof Error ? supErr.message : String(supErr));
      }
    }

    return updated;
  } catch (error) {
    console.error('Error in updateOrder:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (id: string): Promise<boolean> => {
  try {
    console.log('deleteOrder: Starting for order:', id);

    // Try backend API first
    try {
      console.log('deleteOrder: Attempting backend API...');
      const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✓ Backend API: Order deleted successfully');
        // Delete from localStorage as well
        localStorageService.deleteOrder(id);
        return true;
      } else {
        console.warn('deleteOrder: Backend API error, status:', response.status);
      }
    } catch (apiErr) {
      console.warn('deleteOrder: Backend API failed:', apiErr instanceof Error ? apiErr.message : String(apiErr));
    }

    // Fallback: Delete locally
    localStorageService.deleteOrder(id);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('orders')
          .delete()
          .eq('id', id);

        console.log('✓ deleteOrder: Synced deletion to Supabase');
      } catch (supErr) {
        console.warn('deleteOrder: Supabase sync failed:', supErr instanceof Error ? supErr.message : String(supErr));
      }
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOrder:', error);
    throw error;
  }
};

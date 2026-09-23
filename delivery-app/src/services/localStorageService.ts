import { Order } from '../types';

const LOCAL_STORAGE_KEY = 'delivery_orders';

/**
 * Emergency local storage service
 * Use this when Supabase is unreachable
 * All data is stored in browser's localStorage
 */

export const localStorageService = {
  /**
   * Get all orders from localStorage
   */
  getAllOrders: (): Order[] => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!stored) return [];
      
      const orders = JSON.parse(stored);
      console.log('[LocalStorage] Retrieved', orders.length, 'orders');
      
      // Ensure dates are Date objects
      return orders.map((order: any) => ({
        ...order,
        date: new Date(order.date),
        createdAt: new Date(order.createdAt),
      }));
    } catch (err) {
      console.error('[LocalStorage] Error reading orders:', err);
      return [];
    }
  },

  /**
   * Save an order to localStorage
   */
  saveOrder: (order: Order): void => {
    try {
      const orders = localStorageService.getAllOrders();
      
      // Check if order already exists
      const existingIndex = orders.findIndex(o => o.id === order.id);
      
      if (existingIndex >= 0) {
        orders[existingIndex] = order;
        console.log('[LocalStorage] Updated order', order.id);
      } else {
        orders.push(order);
        console.log('[LocalStorage] Added new order', order.id);
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
      console.log('[LocalStorage] Saved', orders.length, 'orders total');
    } catch (err) {
      console.error('[LocalStorage] Error saving order:', err);
      throw err;
    }
  },

  /**
   * Delete an order from localStorage
   */
  deleteOrder: (id: string): void => {
    try {
      const orders = localStorageService.getAllOrders();
      const filtered = orders.filter(o => o.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
      console.log('[LocalStorage] Deleted order', id, '- Now', filtered.length, 'orders');
    } catch (err) {
      console.error('[LocalStorage] Error deleting order:', err);
      throw err;
    }
  },

  /**
   * Export all orders as JSON
   */
  exportOrders: (): string => {
    const orders = localStorageService.getAllOrders();
    return JSON.stringify(orders, null, 2);
  },

  /**
   * Import orders from JSON
   */
  importOrders: (jsonStr: string): Order[] => {
    try {
      const orders = JSON.parse(jsonStr);
      
      if (!Array.isArray(orders)) {
        throw new Error('Invalid format: expected array of orders');
      }
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
      console.log('[LocalStorage] Imported', orders.length, 'orders');
      return orders;
    } catch (err) {
      console.error('[LocalStorage] Error importing orders:', err);
      throw err;
    }
  },

  /**
   * Get storage size info
   */
  getStorageInfo: () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    const sizeInKB = stored ? (new Blob([stored]).size / 1024).toFixed(2) : '0';
    const orders = localStorageService.getAllOrders();
    
    return {
      orderCount: orders.length,
      sizeKB: parseFloat(sizeInKB),
      lastUpdated: stored ? new Date(orders[0]?.createdAt).toLocaleString() : 'Never',
    };
  },

  /**
   * Clear all data (use with caution!)
   */
  clearAll: (): void => {
    if (confirm('⚠️ Are you SURE? This will permanently delete all local orders!')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      console.log('[LocalStorage] All data cleared');
    }
  },
};

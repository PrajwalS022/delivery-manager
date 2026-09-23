import { useState, useMemo, useEffect } from 'react';
import { Order, FilterOptions } from './types';
import OrderList from './components/OrderList';
import OrderForm from './components/OrderForm';
import FilterBar from './components/FilterBar';
import Dashboard from './components/Dashboard';
import ExportPanel from './components/ExportPanel';
import BottomNav from './components/BottomNav';
import { getAllOrders, createOrder, updateOrder, deleteOrder } from './services/orderService';
import './App.css';

type Tab = 'dashboard' | 'orders' | 'export' | 'filter';

function App() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('orders');

  // Load orders from database on mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log('App: Loading orders...');
        setIsLoading(true);
        const loadedOrders = await getAllOrders();
        console.log('App: Loaded', loadedOrders.length, 'orders');
        setOrders(loadedOrders);
        setError(null);
      } catch (err) {
        console.error('App: Error loading orders:', err);
        setError('Failed to load orders: ' + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();

    // Set up real-time sync - refresh orders every 5 seconds
    const syncInterval = setInterval(async () => {
      try {
        const loadedOrders = await getAllOrders();
        setOrders(loadedOrders);
      } catch (err) {
        console.warn('App: Background sync failed:', err);
      }
    }, 5000);

    return () => clearInterval(syncInterval);
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (filters.date) {
        const filterDate = new Date(filters.date);
        const orderDate = new Date(order.date);
        if (filterDate.toDateString() !== orderDate.toDateString()) {
          return false;
        }
      }
      if (filters.restaurantName) {
        const hasRestaurant = order.restaurants.some(r =>
          r.name.toLowerCase().includes(filters.restaurantName!.toLowerCase())
        );
        if (!hasRestaurant) return false;
      }
      if (filters.deliveryAgent && order.deliveryAgent !== filters.deliveryAgent) {
        return false;
      }
      if (filters.paymentStatus && order.paymentStatus !== filters.paymentStatus) {
        return false;
      }
      return true;
    });
  }, [orders, filters]);

  const groupedByDate = useMemo(() => {
    const grouped: { [key: string]: Order[] } = {};
    filteredOrders.forEach(order => {
      const dateKey = new Date(order.date).toLocaleDateString();
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(order);
    });
    return grouped;
  }, [filteredOrders]);

  const handleSaveOrder = async (order: Omit<Order, 'id' | 'createdAt'>) => {
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, order);
        setOrders(orders.map(o => o.id === editingOrder.id ? { ...order, id: editingOrder.id, createdAt: editingOrder.createdAt } : o));
      } else {
        const newOrder = await createOrder(order);
        if (newOrder) {
          setOrders([...orders, newOrder]);
        }
      }
      setShowForm(false);
      setEditingOrder(null);
    } catch (err) {
      console.error('Error saving order:', err);
      setError('Failed to save order');
    }
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await deleteOrder(id);
      setOrders(orders.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error deleting order:', err);
      setError('Failed to delete order');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📦 Delivery Manager</h1>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isLoading && (
        <div className="loading-banner">
          <span>Loading orders from cloud...</span>
        </div>
      )}

      <main className="app-main">
        {activeTab === 'dashboard' && <Dashboard orders={filteredOrders} />}
        
        {activeTab === 'orders' && (
          <div className="orders-section">
            <OrderList
              groupedByDate={groupedByDate}
              onEdit={handleEditOrder}
              onDelete={handleDeleteOrder}
            />
          </div>
        )}

        {activeTab === 'filter' && (
          <div className="filter-section">
            <FilterBar filters={filters} setFilters={setFilters} orders={orders} />
          </div>
        )}

        {activeTab === 'export' && (
          <div className="export-section">
            <ExportPanel orders={filteredOrders} selectedDate={filters.date} />
          </div>
        )}
      </main>

      {showForm && (
        <OrderForm
          order={editingOrder || undefined}
          onSave={handleSaveOrder}
          onClose={handleCloseForm}
        />
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onCreateClick={() => setShowForm(true)} />
    </div>
  );
}

export default App;

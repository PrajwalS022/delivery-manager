import { useState } from 'react';
import { Order, Restaurant, OrderItem } from '../types';
import '../styles/OrderForm.css';

interface OrderFormProps {
  order?: Order;
  onSave: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export default function OrderForm({ order, onSave, onClose }: OrderFormProps) {
  const [orderId, setOrderId] = useState(order?.orderId || '');
  const [restaurants, setRestaurants] = useState<Restaurant[]>(order?.restaurants || []);
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);
  const [totalAmount, setTotalAmount] = useState(order?.totalAmount || 0);
  const [deliveryAgent, setDeliveryAgent] = useState(order?.deliveryAgent || '');
  const [paymentStatus, setPaymentStatus] = useState<'cash' | 'account' | 'pending'>(order?.paymentStatus || 'pending');
  const [date, setDate] = useState(order?.date ? new Date(order.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);

  const [restaurantInput, setRestaurantInput] = useState('');
  const [itemInput, setItemInput] = useState({ name: '', quantity: 1 });
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('');

  const handleAddRestaurant = () => {
    if (restaurantInput.trim()) {
      const newRestaurant = { id: Date.now().toString(), name: restaurantInput };
      setRestaurants([...restaurants, newRestaurant]);
      setSelectedRestaurantId(newRestaurant.id);
      setRestaurantInput('');
    }
  };

  const handleRemoveRestaurant = (id: string) => {
    setRestaurants(restaurants.filter(r => r.id !== id));
  };

  const handleAddItem = () => {
    if (itemInput.name.trim() && itemInput.quantity > 0) {
      if (!selectedRestaurantId && restaurants.length > 0) {
        alert('Please select a restaurant first');
        return;
      }
      setItems([...items, { id: Date.now().toString(), ...itemInput, price: 0, restaurantId: selectedRestaurantId || restaurants[0]?.id }]);
      setItemInput({ name: '', quantity: 1 });
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculateTotal = () => {
    return totalAmount;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim() || restaurants.length === 0 || items.length === 0 || !deliveryAgent.trim() || totalAmount <= 0) {
      alert('Please fill all required fields and enter total bill amount');
      return;
    }

    onSave({
      orderId,
      restaurants,
      items,
      totalAmount,
      deliveryAgent,
      paymentStatus,
      date: new Date(date),
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{order ? 'Edit Order' : 'Create New Order'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <label>Order ID *</label>
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., ORD-2024-001"
              required
            />
          </div>

          <div className="form-section">
            <label>Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-section">
            <label>Restaurant Name *</label>
            <div className="input-group">
              <input
                type="text"
                value={restaurantInput}
                onChange={(e) => setRestaurantInput(e.target.value)}
                placeholder="Enter restaurant name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRestaurant())}
              />
              <button type="button" onClick={handleAddRestaurant} className="btn btn-secondary">
                Add
              </button>
            </div>
            <div className="tags-list">
              {restaurants.map(r => (
                <span
                  key={r.id}
                  className={`tag ${selectedRestaurantId === r.id ? 'active' : ''}`}
                  onClick={() => setSelectedRestaurantId(r.id)}
                >
                  {r.name}
                  <button type="button" onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRestaurant(r.id);
                  }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-section">
            <label>Items * {selectedRestaurantId && `(For ${restaurants.find(r => r.id === selectedRestaurantId)?.name})`}</label>
            {restaurants.length === 0 ? (
              <p className="form-hint">Add at least one restaurant first</p>
            ) : (
              <>
                <div className="item-inputs">
                  <input
                    type="text"
                    value={itemInput.name}
                    onChange={(e) => setItemInput({ ...itemInput, name: e.target.value })}
                    placeholder="Item name"
                  />
                  <input
                    type="number"
                    min="1"
                    value={itemInput.quantity}
                    onChange={(e) => setItemInput({ ...itemInput, quantity: parseInt(e.target.value) || 1 })}
                    placeholder="Qty"
                  />
                  <button type="button" onClick={handleAddItem} className="btn btn-secondary">
                    Add Item
                  </button>
                </div>
                {items.length > 0 && (
                  <div className="items-by-restaurant">
                    {restaurants.map((restaurant) => {
                      const restaurantItems = items.filter(item => item.restaurantId === restaurant.id);
                      return restaurantItems.length > 0 ? (
                        <div key={restaurant.id} className="restaurant-items-group">
                          <h4 className="restaurant-name">{restaurant.name}</h4>
                          <ul className="items-list">
                            {restaurantItems.map(item => (
                              <li key={item.id} className="item-entry">
                                <span className="item-name">{item.name}</span>
                                <span className="item-qty">x{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(item.id)}
                                  className="btn-remove-item"
                                >
                                  ✕
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-section">
            <label>Delivery Agent *</label>
            <input
              type="text"
              value={deliveryAgent}
              onChange={(e) => setDeliveryAgent(e.target.value)}
              placeholder="Agent name"
              required
            />
          </div>

          <div className="form-section">
            <label>Payment Status *</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as any)} required>
              <option value="pending">Pending</option>
              <option value="cash">Cash</option>
              <option value="account">Account</option>
            </select>
          </div>

          <div className="form-section total-section">
            <label>Total Bill Amount * (Required)</label>
            <div className="total-input-group">
              <span className="currency">₹</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={totalAmount}
                onChange={(e) => setTotalAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter total bill"
                className="total-input"
              />
            </div>
            <span className="total-hint">Enter the total amount for this entire order</span>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {order ? 'Update Order' : 'Save Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

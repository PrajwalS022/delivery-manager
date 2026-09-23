import { Order } from '../types';
import '../styles/OrderList.css';

interface OrderListProps {
  groupedByDate: { [key: string]: Order[] };
  onEdit: (order: Order) => void;
  onDelete: (id: string) => void;
}

export default function OrderList({ groupedByDate, onEdit, onDelete }: OrderListProps) {
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  if (sortedDates.length === 0) {
    return (
      <div className="empty-state">
        <p>No orders found. Create your first order to get started.</p>
      </div>
    );
  }

  return (
    <div className="orders-list">
      {sortedDates.map(date => (
        <div key={date} className="date-group">
          <h3 className="date-header">{date}</h3>
          <div className="orders-grid">
            {groupedByDate[date].map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h4>Order #{order.orderId}</h4>
                  <span className={`status-badge status-${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="order-detail">
                  <strong>Restaurants:</strong>
                  <div className="restaurants-list">
                    {order.restaurants.map(r => (
                      <span key={r.id} className="restaurant-tag">{r.name}</span>
                    ))}
                  </div>
                </div>

                <div className="order-detail">
                  <strong>Items ({order.items.length}):</strong>
                  <ul className="items-list">
                    {order.items.map(item => (
                      <li key={item.id}>
                        {item.name} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-detail">
                  <strong>Delivery Agent:</strong>
                  <p>{order.deliveryAgent}</p>
                </div>

                <div className="order-detail total">
                  <strong>Total Amount:</strong>
                  <span className="amount">₹{order.totalAmount.toFixed(2)}</span>
                </div>

                <div className="order-actions">
                  <button className="btn btn-secondary btn-sm" onClick={() => onEdit(order)}>
                    Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => {
                    if (window.confirm('Are you sure you want to delete this order?')) {
                      onDelete(order.id);
                    }
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

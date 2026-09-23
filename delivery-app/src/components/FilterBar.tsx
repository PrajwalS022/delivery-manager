import { Order, FilterOptions } from '../types';
import '../styles/FilterBar.css';

interface FilterBarProps {
  filters: FilterOptions;
  setFilters: (filters: FilterOptions) => void;
  orders: Order[];
}

export default function FilterBar({ filters, setFilters, orders }: FilterBarProps) {
  const uniqueRestaurants = [...new Set(orders.flatMap(o => o.restaurants.map(r => r.name)))];
  const uniqueAgents = [...new Set(orders.map(o => o.deliveryAgent))];

  const handleDateChange = (date: string) => {
    setFilters({ ...filters, date: date ? new Date(date) : undefined });
  };

  const handleRestaurantChange = (name: string) => {
    setFilters({ ...filters, restaurantName: name || undefined });
  };

  const handleAgentChange = (agent: string) => {
    setFilters({ ...filters, deliveryAgent: agent || undefined });
  };

  const handleStatusChange = (status: string) => {
    setFilters({ ...filters, paymentStatus: status || undefined });
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <div className="filter-bar">
      <div className="filter-controls">
        <div className="filter-group">
          <label>Date:</label>
          <input
            type="date"
            value={filters.date ? new Date(filters.date).toISOString().split('T')[0] : ''}
            onChange={(e) => handleDateChange(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Restaurant:</label>
          <select value={filters.restaurantName || ''} onChange={(e) => handleRestaurantChange(e.target.value)}>
            <option value="">All Restaurants</option>
            {uniqueRestaurants.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Delivery Agent:</label>
          <select value={filters.deliveryAgent || ''} onChange={(e) => handleAgentChange(e.target.value)}>
            <option value="">All Agents</option>
            {uniqueAgents.map(agent => (
              <option key={agent} value={agent}>{agent}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Payment Status:</label>
          <select value={filters.paymentStatus || ''} onChange={(e) => handleStatusChange(e.target.value)}>
            <option value="">All Status</option>
            <option value="cash">Cash</option>
            <option value="account">Account</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <button className="btn btn-secondary" onClick={handleClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
}

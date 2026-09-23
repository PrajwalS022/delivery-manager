import { useState, useMemo } from 'react';
import { Order } from '../types';
import '../styles/Dashboard.css';

interface DashboardProps {
  orders: Order[];
}

type TimePeriod = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

interface DateRange {
  from: Date;
  to: Date;
}

export default function Dashboard({ orders }: DashboardProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('today');
  const [customRange, setCustomRange] = useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  // Helper functions for date calculations
  const getToday = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getYesterday = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const getThisWeekStart = () => {
    const date = new Date();
    const day = date.getDay();
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // For Saturday to Friday: Saturday is 6, Friday is 5
    // If today is Saturday (6), start is today
    // If today is Sunday (0), start is yesterday (Saturday)
    // Otherwise, go back to last Saturday
    const daysSinceSaturday = day === 0 ? 1 : (day === 6 ? 0 : day + 1);
    const diff = date.getDate() - daysSinceSaturday;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const getThisWeekEnd = () => {
    const date = new Date();
    const day = date.getDay();
    // Calculate days until Friday (5)
    const daysUntilFriday = day === 0 ? 5 : (day <= 5 ? 5 - day : 12 - day);
    const diff = date.getDate() + daysUntilFriday;
    return new Date(date.getFullYear(), date.getMonth(), diff);
  };

  const getLastWeekStart = () => {
    const date = getThisWeekStart();
    date.setDate(date.getDate() - 7);
    return date;
  };

  const getLastWeekEnd = () => {
    const date = getThisWeekEnd();
    date.setDate(date.getDate() - 7);
    return date;
  };

  const getThisMonthStart = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getThisMonthEnd = () => {
    return new Date();
  };

  const getLastMonthStart = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() - 1, 1);
  };

  const getLastMonthEnd = () => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 0);
  };

  // Get date range based on selected period
  const getDateRange = (): DateRange => {
    switch (timePeriod) {
      case 'today':
        const today = getToday();
        return { from: today, to: today };
      case 'yesterday':
        const yesterday = getYesterday();
        return { from: yesterday, to: yesterday };
      case 'thisWeek':
        return {
          from: getThisWeekStart(),
          to: getThisWeekEnd(),
        };
      case 'lastWeek':
        return {
          from: getLastWeekStart(),
          to: getLastWeekEnd(),
        };
      case 'thisMonth':
        return {
          from: getThisMonthStart(),
          to: getThisMonthEnd(),
        };
      case 'lastMonth':
        return {
          from: getLastMonthStart(),
          to: getLastMonthEnd(),
        };
      case 'custom':
        return customRange;
      default:
        const defaultToday = getToday();
        return { from: defaultToday, to: defaultToday };
    }
  };

  // Filter orders based on date range
  const filteredOrdersByPeriod = useMemo(() => {
    const range = getDateRange();
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      const orderDateNorm = new Date(
        orderDate.getFullYear(),
        orderDate.getMonth(),
        orderDate.getDate()
      );
      return (
        orderDateNorm >= range.from && orderDateNorm <= range.to
      );
    });
  }, [orders, timePeriod, customRange]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalOrders = filteredOrdersByPeriod.length;
    const totalAmount = filteredOrdersByPeriod.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalCash = filteredOrdersByPeriod
      .filter(o => o.paymentStatus === 'cash')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalAccount = filteredOrdersByPeriod
      .filter(o => o.paymentStatus === 'account')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const totalPending = filteredOrdersByPeriod
      .filter(o => o.paymentStatus === 'pending')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders,
      totalAmount,
      totalCash,
      totalAccount,
      totalPending,
    };
  }, [filteredOrdersByPeriod]);

  const handleCustomDateChange = (field: 'from' | 'to', value: string) => {
    setCustomRange(prev => ({
      ...prev,
      [field]: new Date(value),
    }));
  };

  const formatDateRange = (): string => {
    const range = getDateRange();
    const from = range.from.toLocaleDateString();
    const to = range.to.toLocaleDateString();
    return from === to ? from : `${from} - ${to}`;
  };

  return (
    <div className="dashboard-container">
      {/* Period Selector */}
      <div className="dashboard-period-selector">
        <div className="period-buttons">
          <button
            className={`period-btn ${timePeriod === 'today' ? 'active' : ''}`}
            onClick={() => setTimePeriod('today')}
          >
            Today
          </button>
          <button
            className={`period-btn ${timePeriod === 'yesterday' ? 'active' : ''}`}
            onClick={() => setTimePeriod('yesterday')}
          >
            Yesterday
          </button>
          <button
            className={`period-btn ${timePeriod === 'thisWeek' ? 'active' : ''}`}
            onClick={() => setTimePeriod('thisWeek')}
          >
            This Week
          </button>
          <button
            className={`period-btn ${timePeriod === 'lastWeek' ? 'active' : ''}`}
            onClick={() => setTimePeriod('lastWeek')}
          >
            Last Week
          </button>
          <button
            className={`period-btn ${timePeriod === 'thisMonth' ? 'active' : ''}`}
            onClick={() => setTimePeriod('thisMonth')}
          >
            This Month
          </button>
          <button
            className={`period-btn ${timePeriod === 'lastMonth' ? 'active' : ''}`}
            onClick={() => setTimePeriod('lastMonth')}
          >
            Last Month
          </button>
          <button
            className={`period-btn ${timePeriod === 'custom' ? 'active' : ''}`}
            onClick={() => setTimePeriod('custom')}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Range Picker */}
        {timePeriod === 'custom' && (
          <div className="custom-date-range">
            <div className="date-input-group">
              <label>From:</label>
              <input
                type="date"
                value={customRange.from.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('from', e.target.value)}
              />
            </div>
            <div className="date-input-group">
              <label>To:</label>
              <input
                type="date"
                value={customRange.to.toISOString().split('T')[0]}
                onChange={(e) => handleCustomDateChange('to', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Date Range Display */}
        <div className="date-range-display">
          <span className="range-text">📅 {formatDateRange()}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="dashboard">
        <div className="dashboard-card">
          <h3>Total Orders</h3>
          <p className="dashboard-value">{metrics.totalOrders}</p>
          <span className="metric-label">Orders in period</span>
        </div>

        <div className="dashboard-card">
          <h3>Total Amount</h3>
          <p className="dashboard-value">₹{metrics.totalAmount.toFixed(2)}</p>
          <span className="metric-label">All payments</span>
        </div>

        <div className="dashboard-card cash">
          <h3>Total Cash</h3>
          <p className="dashboard-value">₹{metrics.totalCash.toFixed(2)}</p>
          <span className="metric-label">Cash payments</span>
        </div>

        <div className="dashboard-card account">
          <h3>Total Account</h3>
          <p className="dashboard-value">₹{metrics.totalAccount.toFixed(2)}</p>
          <span className="metric-label">Account payments</span>
        </div>

        <div className="dashboard-card pending">
          <h3>Total Pending</h3>
          <p className="dashboard-value">₹{metrics.totalPending.toFixed(2)}</p>
          <span className="metric-label">Pending payments</span>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="dashboard-summary">
        <div className="summary-item">
          <span className="summary-label">Average Order Value</span>
          <span className="summary-value">
            ₹{metrics.totalOrders > 0 ? (metrics.totalAmount / metrics.totalOrders).toFixed(2) : '0.00'}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Cash Percentage</span>
          <span className="summary-value">
            {metrics.totalAmount > 0 ? ((metrics.totalCash / metrics.totalAmount) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Account Percentage</span>
          <span className="summary-value">
            {metrics.totalAmount > 0 ? ((metrics.totalAccount / metrics.totalAmount) * 100).toFixed(1) : '0'}%
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Pending Percentage</span>
          <span className="summary-value">
            {metrics.totalAmount > 0 ? ((metrics.totalPending / metrics.totalAmount) * 100).toFixed(1) : '0'}%
          </span>
        </div>
      </div>
    </div>
  );
}

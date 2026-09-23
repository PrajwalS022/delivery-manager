import { useState } from 'react';
import { Order } from '../types';
import { generatePDF, printOrders } from '../utils/exportUtils';
import '../styles/ExportPanel.css';

interface ExportPanelProps {
  orders: Order[];
  selectedDate?: Date;
}

export default function ExportPanel({ orders, selectedDate }: ExportPanelProps) {
  const [selectedExportDate, setSelectedExportDate] = useState(
    selectedDate ? new Date(selectedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(false);

  const getOrdersForDate = () => {
    const filterDate = new Date(selectedExportDate);
    return orders.filter(order => {
      const orderDate = new Date(order.date);
      return filterDate.toDateString() === orderDate.toDateString();
    });
  };

  const ordersToExport = getOrdersForDate();

  const handleGeneratePDF = async () => {
    setIsLoading(true);
    try {
      await generatePDF(ordersToExport, new Date(selectedExportDate));
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    printOrders(ordersToExport, new Date(selectedExportDate));
  };

  return (
    <div className="export-panel">
      <div className="export-header">
        <h3>Export & Print Orders</h3>
        <p className="export-subtitle">Select a date to export or print orders</p>
      </div>

      <div className="export-content">
        <div className="export-date-section">
          <label>Select Date:</label>
          <input
            type="date"
            value={selectedExportDate}
            onChange={(e) => setSelectedExportDate(e.target.value)}
          />
        </div>

        <div className="export-info">
          <div className="info-item">
            <span className="info-label">Orders Found:</span>
            <span className="info-value">{ordersToExport.length}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Amount:</span>
            <span className="info-value">
              ₹{ordersToExport.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Cash:</span>
            <span className="info-value">
              ₹{ordersToExport.filter(o => o.paymentStatus === 'cash').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </span>
          </div>
          <div className="info-item">
            <span className="info-label">Account:</span>
            <span className="info-value">
              ₹{ordersToExport.filter(o => o.paymentStatus === 'account').reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="export-actions">
          <button
            className="btn btn-export-pdf"
            onClick={handleGeneratePDF}
            disabled={ordersToExport.length === 0 || isLoading}
          >
            {isLoading ? 'Generating PDF...' : '📄 Generate PDF'}
          </button>
          <button
            className="btn btn-export-print"
            onClick={handlePrint}
            disabled={ordersToExport.length === 0}
          >
            🖨️ Print
          </button>
        </div>

        {ordersToExport.length === 0 && (
          <div className="export-empty">
            <p>No orders found for the selected date.</p>
          </div>
        )}
      </div>
    </div>
  );
}

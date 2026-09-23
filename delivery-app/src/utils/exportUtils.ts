import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Order } from '../types';

export const generatePDF = async (orders: Order[], date: Date) => {
  const dateStr = new Date(date).toLocaleDateString();
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  // Title
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Delivery Orders Report', 148, 15, { align: 'center' });

  // Date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Date: ${dateStr}`, 148, 22, { align: 'center' });

  let yPosition = 30;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 8;

  // Summary Statistics
  const totalCash = orders.filter(o => o.paymentStatus === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAccount = orders.filter(o => o.paymentStatus === 'account').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Summary: Total Orders: ${orders.length} | Total: ₹${totalAmount.toFixed(2)} | Cash: ₹${totalCash.toFixed(2)} | Account: ₹${totalAccount.toFixed(2)}`, margin, yPosition);
  yPosition += 8;

  // Table Header
  const columnWidths = {
    order: 15,
    restaurants: 30,
    items: 50,
    agent: 20,
    amount: 18,
    status: 15,
  };

  const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
  const startX = margin;

  // Header background
  pdf.setFillColor(102, 126, 234);
  pdf.rect(startX, yPosition - 4, totalWidth, 6, 'F');

  // Header text
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 255, 255);

  let xPos = startX;
  pdf.text('Order ID', xPos + 1, yPosition);
  xPos += columnWidths.order;

  pdf.text('Restaurants', xPos + 1, yPosition);
  xPos += columnWidths.restaurants;

  pdf.text('Items', xPos + 1, yPosition);
  xPos += columnWidths.items;

  pdf.text('Delivery Agent', xPos + 1, yPosition);
  xPos += columnWidths.agent;

  pdf.text('Amount', xPos + 1, yPosition);
  xPos += columnWidths.amount;

  pdf.text('Status', xPos + 1, yPosition);

  yPosition += 8;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont('helvetica', 'normal');

  // Table rows
  orders.forEach((order) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;

      // Repeat header on new page
      pdf.setFillColor(102, 126, 234);
      pdf.rect(startX, yPosition - 4, totalWidth, 6, 'F');

      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);

      let xPosHeader = startX;
      pdf.text('Order ID', xPosHeader + 1, yPosition);
      xPosHeader += columnWidths.order;
      pdf.text('Restaurants', xPosHeader + 1, yPosition);
      xPosHeader += columnWidths.restaurants;
      pdf.text('Items', xPosHeader + 1, yPosition);
      xPosHeader += columnWidths.items;
      pdf.text('Delivery Agent', xPosHeader + 1, yPosition);
      xPosHeader += columnWidths.agent;
      pdf.text('Amount', xPosHeader + 1, yPosition);
      xPosHeader += columnWidths.amount;
      pdf.text('Status', xPosHeader + 1, yPosition);

      yPosition += 8;
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
    }

    // Prepare data
    const restaurants = order.restaurants.map(r => r.name).join(', ');
    const items = order.items.map(i => `${i.name}(${i.quantity})`).join(', ');
    const rowHeight = 6;

    // Draw row background (alternating)
    const orderIndex = orders.indexOf(order);
    if (orderIndex % 2 === 0) {
      pdf.setFillColor(245, 247, 255);
      pdf.rect(startX, yPosition - 4, totalWidth, rowHeight, 'F');
    }

    // Draw cell borders
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(startX, yPosition - 4, totalWidth, rowHeight);

    // Draw column dividers
    let xDiv = startX;
    for (let i = 0; i < Object.keys(columnWidths).length - 1; i++) {
      if (i === 0) xDiv += columnWidths.order;
      else if (i === 1) xDiv += columnWidths.restaurants;
      else if (i === 2) xDiv += columnWidths.items;
      else if (i === 3) xDiv += columnWidths.agent;
      else if (i === 4) xDiv += columnWidths.amount;

      pdf.line(xDiv, yPosition - 4, xDiv, yPosition + 2);
    }

    // Write data
    pdf.setFontSize(7);
    xPos = startX + 1;

    // Order ID
    pdf.text(order.orderId, xPos, yPosition);
    xPos += columnWidths.order;

    // Restaurants (truncate if too long)
    const restaurantsTruncated = restaurants.length > 25 ? restaurants.substring(0, 22) + '...' : restaurants;
    pdf.text(restaurantsTruncated, xPos, yPosition);
    xPos += columnWidths.restaurants;

    // Items (truncate if too long)
    const itemsTruncated = items.length > 45 ? items.substring(0, 42) + '...' : items;
    pdf.text(itemsTruncated, xPos, yPosition);
    xPos += columnWidths.items;

    // Delivery Agent
    const agentTruncated = order.deliveryAgent.length > 18 ? order.deliveryAgent.substring(0, 15) + '...' : order.deliveryAgent;
    pdf.text(agentTruncated, xPos, yPosition);
    xPos += columnWidths.agent;

    // Amount
    pdf.setFont('helvetica', 'bold');
    pdf.text(`₹${order.totalAmount.toFixed(2)}`, xPos, yPosition);
    pdf.setFont('helvetica', 'normal');
    xPos += columnWidths.amount;

    // Status
    const statusColor = order.paymentStatus === 'cash' ? [22, 163, 74] : order.paymentStatus === 'account' ? [2, 132, 199] : [217, 119, 6];
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    pdf.text(order.paymentStatus.toUpperCase(), xPos, yPosition);
    pdf.setTextColor(0, 0, 0);

    yPosition += rowHeight;
  });

  // Footer
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'italic');
  pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 5);

  const filename = `delivery-orders-${dateStr.replace(/\//g, '-')}.pdf`;
  pdf.save(filename);
};

export const printOrders = (orders: Order[], date: Date) => {
  const dateStr = new Date(date).toLocaleDateString();
  const totalCash = orders.filter(o => o.paymentStatus === 'cash').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAccount = orders.filter(o => o.paymentStatus === 'account').reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Delivery Orders Report - ${dateStr}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          color: #667eea;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          font-size: 14px;
          color: #666;
        }
        .summary {
          background-color: #f0f4ff;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 25px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }
        .summary-item {
          text-align: center;
        }
        .summary-item label {
          display: block;
          color: #666;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .summary-item value {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: #667eea;
        }
        .orders {
          margin-top: 30px;
        }
        .order-card {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
          page-break-inside: avoid;
        }
        .order-card h3 {
          margin: 0 0 10px 0;
          color: #667eea;
          font-size: 16px;
        }
        .order-field {
          margin: 8px 0;
          font-size: 13px;
        }
        .order-field strong {
          color: #333;
          min-width: 120px;
          display: inline-block;
        }
        .status-badge {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 3px;
          font-size: 11px;
          font-weight: bold;
          text-transform: uppercase;
        }
        .status-cash {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-account {
          background-color: #dbeafe;
          color: #0c4a6e;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 2px solid #ddd;
          text-align: center;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body { margin: 0; }
          .order-card { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Delivery Orders Report</h1>
        <p>Date: <strong>${dateStr}</strong></p>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <label>Total Orders</label>
          <value>${orders.length}</value>
        </div>
        <div class="summary-item">
          <label>Total Amount</label>
          <value>₹${totalAmount.toFixed(2)}</value>
        </div>
        <div class="summary-item">
          <label>Total Cash</label>
          <value>₹${totalCash.toFixed(2)}</value>
        </div>
        <div class="summary-item">
          <label>Total Account</label>
          <value>₹${totalAccount.toFixed(2)}</value>
        </div>
      </div>

      <div class="orders">
        ${orders.map((order, index) => `
          <div class="order-card">
            <h3>${index + 1}. Order #${order.orderId}</h3>
            <div class="order-field">
              <strong>Status:</strong>
              <span class="status-badge status-${order.paymentStatus}">${order.paymentStatus}</span>
            </div>
            <div class="order-field">
              <strong>Restaurants:</strong>
              ${order.restaurants.map(r => r.name).join(', ')}
            </div>
            <div class="order-field">
              <strong>Delivery Agent:</strong>
              ${order.deliveryAgent}
            </div>
            <div class="order-field">
              <strong>Items:</strong>
              ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
            </div>
            <div class="order-field">
              <strong>Total Amount:</strong>
              <span style="color: #667eea; font-weight: bold;">₹${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="footer">
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '', 'width=900,height=700');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  }
};

# Delivery Service Manager

A mobile-first web application for managing delivery orders with PDF export and printing capabilities.

## Features

✅ **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile devices
✅ **Create Orders** - Quick form to add new delivery orders
✅ **Manage Orders** - Edit and delete existing orders
✅ **Filter Orders** - Filter by date, restaurant, delivery agent, and payment status
✅ **Dashboard** - Real-time summary of total orders, amounts, cash, and account payments
✅ **PDF Export** - Generate compact, table-format PDFs for storage
✅ **Print Orders** - Print delivery orders directly from the app
✅ **Auto-grouping** - Orders automatically grouped by date

## Getting Started

### For Desktop Users
1. Open the app in your web browser
2. Click "+ Create Order" to add a new order
3. Fill in the order details and save
4. Use filters to find specific orders
5. Export to PDF or print as needed

### For Mobile Users (Employees)

#### Accessing on Phone
- Open any web browser on your phone (Chrome, Safari, Edge)
- Navigate to the app URL
- The app will automatically adapt to your phone screen

#### Creating Orders
1. Tap "+ Create Order" button at the top
2. Enter Order ID
3. Select the date
4. Add restaurant names (tap "Add" after each)
5. Add items with quantity and price
6. Enter delivery agent name
7. Select payment status (Cash, Account, or Pending)
8. Tap "Save Order"

#### Managing Orders
- **Edit**: Tap the "Edit" button on any order card to modify
- **Delete**: Tap the "Delete" button and confirm
- **View Details**: Scroll to see all order information

#### Filtering Orders
1. Use the filter bar to narrow down orders:
   - Select a date
   - Choose a restaurant
   - Filter by delivery agent
   - Filter by payment status
2. Tap "Clear Filters" to reset

#### Exporting & Printing

**Export to PDF:**
1. Scroll to the "Export & Print Orders" section (below dashboard)
2. Select the date you want to export
3. Tap "📄 Generate PDF"
4. The PDF will download automatically

**Print Orders:**
1. Select the date in the Export panel
2. Tap "🖨️ Print"
3. A print preview will open
4. Use your phone's print options to save as PDF or print directly

## Mobile Tips

### Better Typing
- Tap input fields to bring up the keyboard
- Use 16px font size - easier to read on small screens
- Double-tap to select text for easy editing

### Navigation
- Scroll down to see all order information
- Cards are touch-friendly with larger tap areas
- Use bottom buttons for actions

### Storage
- Save PDFs to your phone's storage
- Share PDFs via email, WhatsApp, or cloud storage
- Organize by date in your device's file manager

### Performance
- The app works offline (data stored locally)
- No internet needed to add/edit orders
- Export requires internet connection

## Order Form Fields

| Field | Required | Notes |
|-------|----------|-------|
| Order ID | Yes | Unique identifier (e.g., ORD-001) |
| Date | Yes | Defaults to today |
| Restaurant | Yes | Can add multiple restaurants |
| Items | Yes | Name, quantity, and price |
| Delivery Agent | Yes | Agent's name |
| Payment Status | Yes | Cash, Account, or Pending |
| Total Amount | Auto | Calculated from items |

## Dashboard Metrics

- **Total Orders** - Number of orders for filtered date(s)
- **Total Amount** - Sum of all order amounts
- **Total Cash** - Sum of cash payments only
- **Total Account** - Sum of account/credit payments
- **Pending** - Sum of pending payments

## PDF Format

The exported PDF includes:
- **Header** - Report title and date
- **Summary** - Order count, totals, cash, and account amounts
- **Table** - Compact Excel-like format with:
  - Order ID
  - Restaurants
  - Items
  - Delivery Agent
  - Amount
  - Payment Status
- **Footer** - Generation timestamp

## Browser Compatibility

Works best on:
- ✅ Chrome (Mobile & Desktop)
- ✅ Safari (iOS & Mac)
- ✅ Edge (Mobile & Desktop)
- ✅ Firefox (Mobile & Desktop)

## Tips for Best Experience

1. **On Mobile**: Use in portrait or landscape mode
2. **Larger Buttons**: Touch targets are sized for easy tapping
3. **Auto-grouping**: Orders automatically organized by date
4. **No Data Loss**: All data saved locally on your device
5. **Quick Export**: Generate PDFs in seconds

## Troubleshooting

**Orders not showing up?**
- Check if the date filter is set correctly
- Clear all filters to see all orders

**Can't generate PDF?**
- Make sure browser has pop-up permission enabled
- Check if JavaScript is enabled
- Try a different browser

**App running slowly on mobile?**
- Close other browser tabs
- Clear browser cache
- Ensure sufficient phone storage
- Restart the browser

## Contact Support

For technical issues or feature requests, contact your administrator.

---

**Version**: 1.0.0  
**Last Updated**: September 2026  
**Optimized for**: Mobile, Tablet, and Desktop

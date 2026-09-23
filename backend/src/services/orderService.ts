import { pool } from '../config/database.js';
import { Order, CreateOrderRequest, UpdateOrderRequest } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';
import { v4 as uuidv4 } from 'uuid';

export const orderService = {
  // Get all orders with pagination and filtering
  async getAllOrders(
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: string = 'DESC',
    filters?: {
      deliveryAgent?: string;
      paymentStatus?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ orders: Order[]; total: number }> {
    let query = 'SELECT * FROM orders WHERE 1=1';
    const params: any[] = [];

    // Apply filters
    if (filters?.deliveryAgent) {
      query += ` AND delivery_agent ILIKE $${params.length + 1}`;
      params.push(`%${filters.deliveryAgent}%`);
    }

    if (filters?.paymentStatus) {
      query += ` AND payment_status = $${params.length + 1}`;
      params.push(filters.paymentStatus);
    }

    if (filters?.startDate) {
      query += ` AND date >= $${params.length + 1}`;
      params.push(filters.startDate);
    }

    if (filters?.endDate) {
      query += ` AND date <= $${params.length + 1}`;
      params.push(filters.endDate);
    }

    // Get total count
    const countResult = await pool.query(
      query.replace('SELECT *', 'SELECT COUNT(*) as count'),
      params
    );
    const total = parseInt(countResult.rows[0].count);

    // Apply sorting and pagination
    const validSortFields = ['created_at', 'date', 'total_amount'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query += ` ORDER BY ${sortField} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(pageSize, (page - 1) * pageSize);

    const result = await pool.query(query, params);
    const orders = result.rows.map(this.mapRowToOrder);

    return { orders, total };
  },

  // Get single order
  async getOrderById(id: string): Promise<Order> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new AppError(404, `Order with id ${id} not found`);
    }

    return this.mapRowToOrder(result.rows[0]);
  },

  // Create new order
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const id = uuidv4();
    
    try {
      const result = await pool.query(
        `INSERT INTO orders (
          id,
          order_id,
          restaurants,
          items,
          total_amount,
          delivery_agent,
          payment_status,
          date,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *`,
        [
          id,
          orderData.orderId,
          JSON.stringify(orderData.restaurants),
          JSON.stringify(orderData.items),
          orderData.totalAmount,
          orderData.deliveryAgent,
          orderData.paymentStatus,
          new Date(orderData.date),
        ]
      );

      return this.mapRowToOrder(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw new AppError(409, `Order with orderId ${orderData.orderId} already exists`);
      }
      throw error;
    }
  },

  // Update order
  async updateOrder(id: string, orderData: UpdateOrderRequest): Promise<Order> {
    // Check if order exists
    await this.getOrderById(id);

    const updates: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (orderData.orderId !== undefined) {
      updates.push(`order_id = $${paramIndex}`);
      params.push(orderData.orderId);
      paramIndex++;
    }

    if (orderData.restaurants !== undefined) {
      updates.push(`restaurants = $${paramIndex}`);
      params.push(JSON.stringify(orderData.restaurants));
      paramIndex++;
    }

    if (orderData.items !== undefined) {
      updates.push(`items = $${paramIndex}`);
      params.push(JSON.stringify(orderData.items));
      paramIndex++;
    }

    if (orderData.totalAmount !== undefined) {
      updates.push(`total_amount = $${paramIndex}`);
      params.push(orderData.totalAmount);
      paramIndex++;
    }

    if (orderData.deliveryAgent !== undefined) {
      updates.push(`delivery_agent = $${paramIndex}`);
      params.push(orderData.deliveryAgent);
      paramIndex++;
    }

    if (orderData.paymentStatus !== undefined) {
      updates.push(`payment_status = $${paramIndex}`);
      params.push(orderData.paymentStatus);
      paramIndex++;
    }

    if (orderData.date !== undefined) {
      updates.push(`date = $${paramIndex}`);
      params.push(new Date(orderData.date));
      paramIndex++;
    }

    if (updates.length === 0) {
      return this.getOrderById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    try {
      const result = await pool.query(
        `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        params
      );

      return this.mapRowToOrder(result.rows[0]);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new AppError(409, `Order with orderId ${orderData.orderId} already exists`);
      }
      throw error;
    }
  },

  // Delete order
  async deleteOrder(id: string): Promise<void> {
    // Check if order exists
    await this.getOrderById(id);

    await pool.query('DELETE FROM orders WHERE id = $1', [id]);
  },

  // Get orders by delivery agent
  async getOrdersByAgent(agent: string): Promise<Order[]> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE delivery_agent ILIKE $1 ORDER BY created_at DESC',
      [`%${agent}%`]
    );

    return result.rows.map(this.mapRowToOrder);
  },

  // Get orders by payment status
  async getOrdersByPaymentStatus(status: string): Promise<Order[]> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE payment_status = $1 ORDER BY created_at DESC',
      [status]
    );

    return result.rows.map(this.mapRowToOrder);
  },

  // Get orders by date range
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    const result = await pool.query(
      'SELECT * FROM orders WHERE date >= $1 AND date <= $2 ORDER BY date DESC',
      [startDate, endDate]
    );

    return result.rows.map(this.mapRowToOrder);
  },

  // Helper to map database row to Order object
  mapRowToOrder(row: any): Order {
    return {
      id: row.id,
      orderId: row.order_id,
      restaurants: typeof row.restaurants === 'string' ? JSON.parse(row.restaurants) : row.restaurants,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
      totalAmount: parseFloat(row.total_amount),
      deliveryAgent: row.delivery_agent,
      paymentStatus: row.payment_status,
      date: new Date(row.date),
      createdAt: new Date(row.created_at),
      updatedAt: row.updated_at ? new Date(row.updated_at) : undefined,
    };
  },
};

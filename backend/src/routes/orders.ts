import { Router, Request, Response, NextFunction } from 'express';
import { orderService } from '../services/orderService.js';
import {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
  validatePagination,
  handleValidationErrors,
} from '../middleware/validation.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { ApiResponse, PaginatedResponse, Order } from '../types/index.js';

const router = Router();

// GET all orders with pagination
router.get(
  '/',
  validatePagination,
  asyncHandler(async (req: Request, res: Response) => {
    const page = (req.query.page as any) || 1;
    const pageSize = (req.query.pageSize as any) || 10;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'DESC';

    const deliveryAgent = req.query.deliveryAgent as string;
    const paymentStatus = req.query.paymentStatus as string;
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

    const filters = {
      deliveryAgent,
      paymentStatus,
      startDate,
      endDate,
    };

    const { orders, total } = await orderService.getAllOrders(
      page,
      pageSize,
      sortBy,
      sortOrder,
      filters
    );

    const totalPages = Math.ceil(total / pageSize);

    const response: PaginatedResponse<Order> = {
      success: true,
      data: orders,
      total,
      page,
      pageSize,
      totalPages,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

// GET order by ID
router.get(
  '/:id',
  validateOrderId,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.getOrderById(req.params.id);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

// POST create new order
router.post(
  '/',
  validateCreateOrder,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.body);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: 'Order created successfully',
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  })
);

// PUT update order
router.put(
  '/:id',
  validateOrderId,
  validateUpdateOrder,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.updateOrder(req.params.id, req.body);

    const response: ApiResponse<Order> = {
      success: true,
      data: order,
      message: 'Order updated successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

// DELETE order
router.delete(
  '/:id',
  validateOrderId,
  handleValidationErrors,
  asyncHandler(async (req: Request, res: Response) => {
    await orderService.deleteOrder(req.params.id);

    const response: ApiResponse<null> = {
      success: true,
      message: 'Order deleted successfully',
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

// GET orders by delivery agent
router.get(
  '/agent/:agent',
  asyncHandler(async (req: Request, res: Response) => {
    const orders = await orderService.getOrdersByAgent(req.params.agent);

    const response: ApiResponse<Order[]> = {
      success: true,
      data: orders,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

// GET orders by payment status
router.get(
  '/status/:status',
  asyncHandler(async (req: Request, res: Response) => {
    const validStatuses = ['cash', 'account', 'pending'];
    if (!validStatuses.includes(req.params.status)) {
      throw new AppError(400, `Invalid payment status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const orders = await orderService.getOrdersByPaymentStatus(req.params.status);

    const response: ApiResponse<Order[]> = {
      success: true,
      data: orders,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  })
);

export default router;

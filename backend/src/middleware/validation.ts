import { Request, Response, NextFunction } from 'express';
import { validationResult, body, query, param } from 'express-validator';
import { AppError } from './errorHandler.js';

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => ({
      field: e.type === 'field' ? e.path : 'unknown',
      message: e.msg
    }));
    throw new AppError(400, `Validation failed: ${JSON.stringify(errorMessages)}`);
  }
  next();
};

// Order validation rules
export const validateCreateOrder = [
  body('orderId')
    .trim()
    .notEmpty()
    .withMessage('orderId is required')
    .isLength({ max: 255 })
    .withMessage('orderId must be at most 255 characters'),
  
  body('restaurants')
    .isArray()
    .withMessage('restaurants must be an array')
    .notEmpty()
    .withMessage('restaurants cannot be empty'),
  
  body('restaurants.*.id')
    .trim()
    .notEmpty()
    .withMessage('restaurant id is required'),
  
  body('restaurants.*.name')
    .trim()
    .notEmpty()
    .withMessage('restaurant name is required'),
  
  body('items')
    .isArray()
    .withMessage('items must be an array')
    .notEmpty()
    .withMessage('items cannot be empty'),
  
  body('items.*.id')
    .trim()
    .notEmpty()
    .withMessage('item id is required'),
  
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('item name is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('item quantity must be at least 1'),
  
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('item price must be a positive number'),
  
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('totalAmount must be a positive number'),
  
  body('deliveryAgent')
    .trim()
    .notEmpty()
    .withMessage('deliveryAgent is required')
    .isLength({ max: 255 })
    .withMessage('deliveryAgent must be at most 255 characters'),
  
  body('paymentStatus')
    .isIn(['cash', 'account', 'pending'])
    .withMessage('paymentStatus must be one of: cash, account, pending'),
  
  body('date')
    .isISO8601()
    .withMessage('date must be a valid ISO8601 date'),
];

export const validateUpdateOrder = [
  body('orderId')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('orderId cannot be empty')
    .isLength({ max: 255 })
    .withMessage('orderId must be at most 255 characters'),
  
  body('totalAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('totalAmount must be a positive number'),
  
  body('deliveryAgent')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('deliveryAgent cannot be empty')
    .isLength({ max: 255 })
    .withMessage('deliveryAgent must be at most 255 characters'),
  
  body('paymentStatus')
    .optional()
    .isIn(['cash', 'account', 'pending'])
    .withMessage('paymentStatus must be one of: cash, account, pending'),
];

export const validateOrderId = [
  param('id')
    .isUUID()
    .withMessage('id must be a valid UUID'),
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('page must be a positive integer')
    .toInt(),
  
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('pageSize must be between 1 and 100')
    .toInt(),
  
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'date', 'totalAmount'])
    .withMessage('sortBy must be one of: createdAt, date, totalAmount'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('sortOrder must be ASC or DESC'),
];

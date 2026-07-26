import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customer.validator.js';

export class CustomerController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await CustomerService.getAllCustomers();
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = createCustomerSchema.parse(req.body);
      const customer = await CustomerService.createCustomer(validated);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = updateCustomerSchema.parse(req.body);
      const customer = await CustomerService.updateCustomer(req.params.id, validated);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomerService.deleteCustomer(req.params.id);
      res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

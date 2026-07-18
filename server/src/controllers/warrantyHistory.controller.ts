import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WarrantyHistoryController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, from, to } = req.query;

      const where: any = {};
      if (search) {
        where.OR = [
          { invoiceNumber: { contains: String(search), mode: 'insensitive' } },
          { customerName: { contains: String(search), mode: 'insensitive' } },
          { productName: { contains: String(search), mode: 'insensitive' } },
        ];
      }
      if (from || to) {
        where.generatedAt = {};
        if (from) where.generatedAt.gte = new Date(String(from));
        if (to) where.generatedAt.lte = new Date(String(to));
      }

      const records = await prisma.warrantyRecord.findMany({
        where,
        orderBy: { generatedAt: 'desc' },
      });

      return res.status(200).json({ success: true, data: records });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.warrantyRecord.delete({ where: { id: req.params.id } });
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';

const router = Router();

router.get('/stats', InvoiceController.getStats);
router.get('/', InvoiceController.getAll);
router.get('/:id', InvoiceController.getById);
router.post('/', InvoiceController.create);
router.put('/:id', InvoiceController.update);
router.patch('/:id/status', InvoiceController.updateStatus);
router.delete('/:id', InvoiceController.delete);

export default router;

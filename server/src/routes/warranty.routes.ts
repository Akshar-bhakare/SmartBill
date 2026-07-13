import { Router } from 'express';
import multer from 'multer';
import { WarrantyController } from '../controllers/warranty.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse-invoice', upload.single('invoiceFile'), WarrantyController.parseInvoice);
router.post('/parse-serials', upload.single('excelFile'), WarrantyController.parseSerials);
router.post('/generate', WarrantyController.generate);
router.get('/download/:fileName', WarrantyController.download);

export default router;

import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
const pdfParse: any = require('pdf-parse');
import * as XLSX from 'xlsx';
import puppeteer from 'puppeteer';
import { extractInvoiceDetailsFromText } from '../services/invoiceParser.js';
import { extractSerialNumbersFromRows } from '../services/excelParser.js';
import { buildWarrantyRows, renderWarrantyTemplate, validateSerialCount } from '../services/warrantyGenerator.js';

interface RequestWithFile extends Request {
  file?: Express.Multer.File;
}

export class WarrantyController {
  static async parseInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const requestWithFile = req as RequestWithFile;
      if (requestWithFile.file?.buffer) {
        const pdfData = await pdfParse(requestWithFile.file.buffer);
        const data = extractInvoiceDetailsFromText(pdfData.text);
        return res.status(200).json({ success: true, data });
      }

      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ success: false, message: 'Invoice file or text is required.' });
      }

      const data = extractInvoiceDetailsFromText(text);
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  static async parseSerials(req: Request, res: Response, next: NextFunction) {
    try {
      const requestWithFile = req as RequestWithFile;
      if (requestWithFile.file?.buffer) {
        const workbook = XLSX.read(requestWithFile.file.buffer, { type: 'buffer' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
        const serials = extractSerialNumbersFromRows(rows);
        return res.status(200).json({ success: true, data: { serialNumbers: serials } });
      }

      const { rows } = req.body;
      if (!Array.isArray(rows)) {
        return res.status(400).json({ success: false, message: 'Excel file or rows are required.' });
      }

      const serials = extractSerialNumbersFromRows(rows);
      return res.status(200).json({ success: true, data: { serialNumbers: serials } });
    } catch (error) {
      next(error);
    }
  }

  static async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceData, serialNumbers } = req.body;
      if (!invoiceData || !Array.isArray(serialNumbers)) {
        return res.status(400).json({ success: false, message: 'Invoice data and serial numbers are required.' });
      }

      const validation = validateSerialCount(invoiceData.quantity, serialNumbers.length);
      if (!validation.ok) {
        return res.status(400).json({ success: false, message: validation.message });
      }

      const rows = buildWarrantyRows(serialNumbers, invoiceData);
      const html = renderWarrantyTemplate(invoiceData, rows);

      const outputDir = path.resolve(process.cwd(), 'generated');
      fs.mkdirSync(outputDir, { recursive: true });

      const filename = `Warranty_${(invoiceData.invoiceNumber || 'document').replace(/[^a-zA-Z0-9]/g, '')}.pdf`;
      const outputPath = path.join(outputDir, filename);

      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
      await browser.close();

      return res.status(200).json({
        success: true,
        data: {
          fileName: filename,
          downloadUrl: `/api/warranty/download/${filename}`,
          outputPath,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async download(req: Request, res: Response, next: NextFunction) {
    try {
      const fileName = req.params.fileName;
      const filePath = path.resolve(process.cwd(), 'generated', fileName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found.' });
      }

      res.download(filePath);
    } catch (error) {
      next(error);
    }
  }
}






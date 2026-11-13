import { Request, Response } from 'express';
import { TallyService } from '../services/tally.service.js';

export class TallyController {
  static async auth(req: Request, res: Response) {
    try {
      const { userId, password, apiKey } = req.body;
      const result = TallyService.authenticate(userId, password, apiKey);
      const statusCode = result.isValid ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'SERVER_ERROR',
        data: null,
      });
    }
  }

  static async ping(req: Request, res: Response) {
    return res.status(200).json({
      isValid: true,
      message: 'PONG',
      errorCode: null,
      data: {
        serverTimeUtc: new Date().toISOString(),
        version: '1.0.0',
        status: 'HEALTHY',
      },
    });
  }

  static async getSalesVouchers(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { fromDate, toDate, voucherStatus } = req.body || {};
      const result = await TallyService.getSalesVouchers(companyId, fromDate, toDate, voucherStatus);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_SALES_FAILED',
        data: null,
      });
    }
  }

  static async getReceiptVouchers(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { fromDate, toDate } = req.body || {};
      const result = await TallyService.getReceiptVouchers(companyId, fromDate, toDate);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_RECEIPTS_FAILED',
        data: null,
      });
    }
  }

  static async getStockJournalVouchers(req: Request, res: Response) {
    try {
      return res.status(200).json({
        isValid: true,
        message: 'Stock journal vouchers retrieved',
        errorCode: null,
        data: { totalRecords: 0, vouchers: [], errors: [] },
      });
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_STOCK_JOURNALS_FAILED',
        data: null,
      });
    }
  }

  static async getCustomers(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const result = await TallyService.getCustomers(companyId);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_CUSTOMERS_FAILED',
        data: null,
      });
    }
  }

  static async getStockItems(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const result = await TallyService.getStockItems(companyId);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_STOCK_ITEMS_FAILED',
        data: null,
      });
    }
  }

  static async getGodowns(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const result = await TallyService.getGodowns(companyId);
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'FETCH_GODOWNS_FAILED',
        data: null,
      });
    }
  }

  static async importGodowns(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { godowns } = req.body || {};
      const result = await TallyService.importGodowns(companyId, godowns);
      return res.status(result.isValid ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'IMPORT_GODOWNS_FAILED',
        data: null,
      });
    }
  }

  static async importLedgers(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { ledgers } = req.body || {};
      const result = await TallyService.importLedgers(companyId, ledgers);
      return res.status(result.isValid ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'IMPORT_LEDGERS_FAILED',
        data: null,
      });
    }
  }

  static async importStockItems(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { stockItems } = req.body || {};
      const result = await TallyService.importStockItems(companyId, stockItems);
      return res.status(result.isValid ? 200 : 400).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'IMPORT_STOCK_ITEMS_FAILED',
        data: null,
      });
    }
  }

  static async importMasters(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const result = await TallyService.importMasters(companyId, req.body || {});
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'IMPORT_MASTERS_FAILED',
        data: null,
      });
    }
  }

  static async exportVouchersXml(req: Request, res: Response) {
    try {
      const companyId = req.companyId || parseInt(process.env.DEFAULT_COMPANY_ID || '12', 10);
      const { fromDate, toDate } = req.query as { fromDate?: string; toDate?: string };
      const xml = await TallyService.exportVouchersXml(companyId, fromDate, toDate);
      res.setHeader('Content-Type', 'application/xml');
      res.setHeader('Content-Disposition', 'attachment; filename="tally_vouchers.xml"');
      return res.status(200).send(xml);
    } catch (err: any) {
      return res.status(500).json({
        isValid: false,
        message: err.message,
        errorCode: 'EXPORT_XML_FAILED',
        data: null,
      });
    }
  }
}

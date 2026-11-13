import { Router } from 'express';
import { TallyController } from '../controllers/tally.controller.js';
import { authenticateTally } from '../middleware/auth.middleware.js';

const router = Router();

// 1. Auth (Public)
router.post('/Auth', TallyController.auth);

// 2. Ping (Heartbeat)
router.post('/Ping', authenticateTally, TallyController.ping);

// 3. Transactions
router.post('/SalesVouchers', authenticateTally, TallyController.getSalesVouchers);
router.post('/ReceiptVouchers', authenticateTally, TallyController.getReceiptVouchers);
router.post('/StockJournalVouchers', authenticateTally, TallyController.getStockJournalVouchers);

// 4. Masters Read (Export to Tally)
router.post('/Customers', authenticateTally, TallyController.getCustomers);
router.post('/StockItems', authenticateTally, TallyController.getStockItems);
router.post('/Godowns', authenticateTally, TallyController.getGodowns);

// 5. Masters Write (Import from Tally TDL)
router.post('/import/godowns', authenticateTally, TallyController.importGodowns);
router.post('/import/ledgers', authenticateTally, TallyController.importLedgers);
router.post('/import/stock-items', authenticateTally, TallyController.importStockItems);
router.post('/import/masters', authenticateTally, TallyController.importMasters);

// 6. Direct Tally XML Export
router.get('/export/vouchers.xml', authenticateTally, TallyController.exportVouchersXml);
router.post('/export/vouchers.xml', authenticateTally, TallyController.exportVouchersXml);

export default router;

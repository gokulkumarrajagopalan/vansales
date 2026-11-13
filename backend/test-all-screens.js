const BASE_URL = 'http://localhost:8080';

async function testAll() {
  console.log('================================================================');
  console.log(' VANSALES PRO PRODUCTION TEST SUITE: ALL SCREENS & API FLOWS     ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  async function req(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async function check(name, fn) {
    try {
      process.stdout.write(`• Testing [${name}] ... `);
      await fn();
      console.log('✓ PASSED');
      passed++;
    } catch (err) {
      console.log(`✗ FAILED: ${err.message}`);
      failed++;
    }
  }

  let userToken = '';
  let tallyToken = '';
  let activeShiftId = 0;
  let customer = null;
  let stockItem = null;
  let createdInvoice = null;

  // 1. Health check
  await check('Health & Server Status', async () => {
    const data = await req(`${BASE_URL}/health`);
    if (data.status !== 'HEALTHY') throw new Error('Status not healthy');
  });

  // 2. Tally Auth
  await check('Tally Contract Auth & Bearer Token', async () => {
    const data = await req(`${BASE_URL}/TallyIntegration/Auth`, {
      method: 'POST',
      body: JSON.stringify({
        userId: 'tally_connector',
        password: 'StrongPassword123!',
        apiKey: 'VB-API-KEY-998877'
      })
    });
    if (!data.isValid || !data.data?.token) throw new Error('Auth invalid');
    tallyToken = data.data.token;
  });

  // 3. Tally Ping
  await check('Tally Contract Heartbeat Ping', async () => {
    const data = await req(`${BASE_URL}/TallyIntegration/Ping`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tallyToken}` }
    });
    if (data.data?.status !== 'HEALTHY') throw new Error('Ping not healthy');
  });

  // 4. Mobile User Login
  await check('Screen: Mobile Auth Sign-In (vansales1)', async () => {
    const data = await req(`${BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: 'vansales1',
        password: 'password123'
      })
    });
    if (!data.isValid || !data.data?.token) throw new Error('Login failed');
    userToken = data.data.token;
  });

  // 5. Open Shift / Day Open Screen
  await check('Screen: Shift Day Open (Odometer + Float)', async () => {
    const data = await req(`${BASE_URL}/api/v1/shifts/open`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        openingOdometer: 14000,
        openingCash: 250.00,
        godownName: 'Van 01 Godown'
      })
    });
    if (data.isValid) {
      activeShiftId = data.data.id;
    } else {
      const curr = await req(`${BASE_URL}/api/v1/shifts/current`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      activeShiftId = curr.data?.shift?.id;
    }
    if (!activeShiftId) throw new Error('Could not obtain active shift');
  });

  // 6. Current Shift Status
  await check('Screen: Dashboard Shift Status & Live Balances', async () => {
    const data = await req(`${BASE_URL}/api/v1/shifts/current`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || !data.data?.shift) throw new Error('No active shift data');
  });

  // 7. Customers / Step 1 Select Customer
  await check('Screen: Step 1 Select Customer (Search & Debtors)', async () => {
    const data = await req(`${BASE_URL}/api/v1/customers?limit=10`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.customers.length === 0) throw new Error('No customers');
    customer = data.data.customers[0];
  });

  // 8. Customer Statement Screen
  await check('Screen: Customer Statement & History', async () => {
    const data = await req(`${BASE_URL}/api/v1/customers/${customer.id}/statement`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid) throw new Error('Failed to fetch statement');
  });

  // 9. Van Stock / Step 2 Select Items Screen
  await check('Screen: Step 2 Select Items & Available Van Stock', async () => {
    const data = await req(`${BASE_URL}/api/v1/stock/van-stock`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.items.length === 0) throw new Error('No items');
    stockItem = data.data.items[0];
  });

  // 10. Create Spot Invoice / Step 3 Invoice Preview Screen
  await check('Screen: Step 3 Tax Invoice Preview & Save (5% VAT + Words)', async () => {
    const data = await req(`${BASE_URL}/api/v1/invoices`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        customerId: customer.id,
        customerName: customer.name,
        paymentMode: 'CASH',
        items: [
          {
            stockItemId: stockItem.id,
            stockItemName: 'Basmati Rice 5KG',
            qty: 4,
            unitPrice: 50.00,
            unit: 'Bag',
            discountPercent: 0,
            taxPercent: 5.0
          }
        ],
        narration: 'Spot delivery in Van 01'
      })
    });

    if (!data.isValid) throw new Error('Invoice creation failed: ' + data.message);
    createdInvoice = data.data;
    if (createdInvoice.subtotal !== 200 || createdInvoice.vatAmount !== 10 || createdInvoice.netTotal !== 210) {
      throw new Error(`Financial mismatch: sub=${createdInvoice.subtotal}, vat=${createdInvoice.vatAmount}, net=${createdInvoice.netTotal}`);
    }
    if (!createdInvoice.amountInWords || (!createdInvoice.amountInWords.includes('Two Hundred Ten') && !createdInvoice.amountInWords.includes('Two Hundred and Ten'))) {
      throw new Error(`Amount in words error: ${createdInvoice.amountInWords}`);
    }
  });

  // 11. Tally Contract: Verify balanced double-entry
  await check('Tally Contract: Double-Entry Balancing Verification', async () => {
    const data = await req(`${BASE_URL}/TallyIntegration/SalesVouchers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tallyToken}` },
      body: JSON.stringify({ companyCode: '30449' })
    });

    const v = data.data.vouchers.find(x => x.guid === createdInvoice.guid);
    if (!v) throw new Error(`Voucher ${createdInvoice.guid} not returned in valid vouchers`);
    
    let debits = 0;
    let credits = 0;
    for (const le of v.ledgerEntries) {
      if (le.entryType === 'DEBIT') debits += le.amount;
      else credits += le.amount;
    }
    debits = Math.round(debits * 100) / 100;
    credits = Math.round(credits * 100) / 100;

    if (debits !== credits) {
      throw new Error(`Double-entry imbalanced! Debits: ${debits}, Credits: ${credits}`);
    }
  });

  // 12. Payment Receipt Screen
  let createdReceipt = null;
  await check('Screen: Payment Receipt Collection (Cash/Bank)', async () => {
    const data = await req(`${BASE_URL}/api/v1/receipts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        customerName: customer.name,
        amount: 210.00,
        paymentMode: 'CASH',
        narration: `Payment against ${createdInvoice.invoiceNumber}`
      })
    });

    if (!data.isValid) throw new Error('Receipt creation failed: ' + data.message);
    createdReceipt = data.data;
  });

  // 13. Tally Contract: Verify Receipt Voucher
  await check('Tally Contract: Pull Receipt Vouchers', async () => {
    const data = await req(`${BASE_URL}/TallyIntegration/ReceiptVouchers`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tallyToken}` },
      body: JSON.stringify({ companyCode: '30449' })
    });
    const r = data.data.vouchers.find(x => x.guid === createdReceipt.guid);
    if (!r) throw new Error(`Receipt ${createdReceipt.guid} not found in Tally response`);
  });

  // 14. Daybook Screen
  await check('Screen: Daybook Register (Today Transactions)', async () => {
    const data = await req(`${BASE_URL}/api/v1/reports/daybook`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.entries.length === 0) throw new Error('Daybook empty');
  });

  // 15. Web Dashboard Metrics Screen
  await check('Screen: Web Executive Dashboard Metrics', async () => {
    const data = await req(`${BASE_URL}/api/v1/reports/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.todaySales <= 0) throw new Error('Dashboard stats missing');
  });

  // 16. Web Tally Sync Center Screen
  await check('Screen: Web Tally Sync Center & Queue Status', async () => {
    const data = await req(`${BASE_URL}/api/v1/tally/sync-status`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.summary?.ready === undefined) throw new Error('Sync status missing');
  });

  // 17. Web Ledger Mapping Screen
  await check('Screen: Web Tally Ledger Mapping Matrix', async () => {
    const data = await req(`${BASE_URL}/api/v1/tally/mappings`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    if (!data.isValid || data.data.mappings.length === 0) throw new Error('Mappings empty');
  });

  // 18. Shift Day Close Screen
  await check('Screen: Shift Day Close & Cash Handover Reconciliation', async () => {
    const currentShift = await req(`${BASE_URL}/api/v1/shifts/current`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    const expected = currentShift.data.metrics.expectedCashInHand;

    const data = await req(`${BASE_URL}/api/v1/shifts/close`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: JSON.stringify({
        closingOdometer: 14065,
        physicalCash: expected,
        handoverNotes: 'Shift closed smoothly. All vouchers balanced.'
      })
    });

    if (!data.isValid || data.data.discrepancy !== 0) {
      throw new Error(`Close shift mismatch. Discrepancy: ${data.data?.discrepancy}`);
    }
  });

  console.log('\n================================================================');
  console.log(` TEST SUMMARY: ${passed} PASSED, ${failed} FAILED `);
  console.log('================================================================');
  if (failed === 0) {
    console.log('🎉 ALL PRODUCTION FLOWS AND CONTRACTS PASSED WITH 100% ACCURACY!');
  }
}

testAll().catch(console.error);

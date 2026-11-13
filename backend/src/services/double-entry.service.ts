import { query } from '../db/pool.js';

export interface LedgerEntryItem {
  ledgerName: string;
  entryType: 'DEBIT' | 'CREDIT';
  amount: number;
  isParty: boolean;
}

export interface BalanceResult {
  isBalanced: boolean;
  delta: number;
  roundedEntries: LedgerEntryItem[];
  roundOffApplied: number;
  errorMessage?: string;
}

export class DoubleEntryService {
  /**
   * Fetches mapped Tally ledger names for a company.
   */
  static async getLedgerMappings(companyId: number): Promise<Record<string, string>> {
    const res = await query(
      `SELECT mapping_key, tally_ledger_name FROM tally_ledger_mappings WHERE cmp_id = $1`,
      [companyId]
    );
    const mappings: Record<string, string> = {
      CASH: 'Cash',
      CARD: 'Bank Accounts',
      VAT_OUTPUT: 'Output VAT 5%',
      SALES: 'Sales Account',
      DISCOUNT: 'Discount Allowed',
      ROUND_OFF: 'Round Off (+/-)',
    };
    for (const row of res.rows) {
      mappings[row.mapping_key] = row.tally_ledger_name;
    }
    return mappings;
  }

  /**
   * Evaluates double-entry balance with ±0.20 AED tolerance rule.
   * If |Debits - Credits| <= 0.20 AED, automatically balances to Round-Off ledger.
   * If > 0.20 AED, marks as unbalanced / quarantine.
   */
  static evaluateBalance(
    entries: LedgerEntryItem[],
    roundOffLedgerName: string = 'Round Off (+/-)',
    toleranceAed: number = 0.20
  ): BalanceResult {
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      const amt = Math.round(Number(entry.amount) * 100) / 100;
      if (entry.entryType === 'DEBIT') {
        totalDebit += amt;
      } else {
        totalCredit += amt;
      }
    }

    totalDebit = Math.round(totalDebit * 100) / 100;
    totalCredit = Math.round(totalCredit * 100) / 100;

    const diff = Math.round((totalDebit - totalCredit) * 100) / 100;
    const absDiff = Math.abs(diff);

    // Exact balance
    if (absDiff === 0) {
      return {
        isBalanced: true,
        delta: 0,
        roundedEntries: [...entries],
        roundOffApplied: 0,
      };
    }

    // Within tolerance: auto-balance using round-off ledger
    if (absDiff <= toleranceAed) {
      const balancedEntries = [...entries];
      let roundOffApplied = 0;

      if (diff > 0) {
        // Debits > Credits by `absDiff`, credit Round-off
        balancedEntries.push({
          ledgerName: roundOffLedgerName,
          entryType: 'CREDIT',
          amount: absDiff,
          isParty: false,
        });
        roundOffApplied = -absDiff;
      } else {
        // Credits > Debits by `absDiff`, debit Round-off
        balancedEntries.push({
          ledgerName: roundOffLedgerName,
          entryType: 'DEBIT',
          amount: absDiff,
          isParty: false,
        });
        roundOffApplied = absDiff;
      }

      return {
        isBalanced: true,
        delta: absDiff,
        roundedEntries: balancedEntries,
        roundOffApplied,
      };
    }

    // Exceeds tolerance: quarantine
    return {
      isBalanced: false,
      delta: absDiff,
      roundedEntries: entries,
      roundOffApplied: 0,
      errorMessage: `Double-entry imbalance exceeds tolerance (Debit: ${totalDebit.toFixed(2)}, Credit: ${totalCredit.toFixed(2)}, Diff: ${diff.toFixed(2)} > ${toleranceAed})`,
    };
  }

  /**
   * Generates a permanent idempotent GUID for vouchers.
   */
  static generateVoucherGuid(prefix: 'VB-SAL' | 'VB-RCT' | 'VB-STK', companyId: number, shiftId: number, voucherId: number): string {
    return `${prefix}-${companyId}-${shiftId}-${voucherId}`;
  }
}

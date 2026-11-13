export type PeriodType =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_month'
  | 'this_year'
  | 'custom';

export type AccountType =
  | 'asset'
  | 'liability'
  | 'equity'
  | 'income'
  | 'expense';

export type AccountSubtype =
  | 'cash'
  | 'bank'
  | 'accounts_receivable'
  | 'accounts_payable'
  | 'inventory'
  | 'current_asset'
  | 'fixed_asset'
  | 'current_liability'
  | 'capital'
  | 'sales_income'
  | 'direct_income'
  | 'indirect_income'
  | 'cost_of_goods_sold'
  | 'direct_expense'
  | 'indirect_expense';

export interface LedgerAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubtype;
  openingBalance: number; // positive = debit, negative = credit
  isSystem?: boolean;
  bankAccountNumber?: string;
  bankBranch?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  companyName?: string;
  phone: string;
  email: string;
  taxNumber: string; // GST / VAT
  creditLimit: number;
  creditDays: number;
  route: string;
  address: string;
  city: string;
  ledgerId: string;
  openingBalance: number;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  companyName: string;
  phone: string;
  email: string;
  taxNumber: string;
  paymentTermsDays: number;
  address: string;
  city: string;
  ledgerId: string;
  openingBalance: number;
}

export interface ItemGroup {
  id: string;
  name: string;
  description?: string;
}

export interface ItemCategory {
  id: string;
  name: string;
}

export interface UnitOfMeasure {
  id: string;
  code: string;
  name: string;
  isBaseUnit: boolean;
  baseMultiplier: number; // e.g. 1 Box = 12 PCS
  baseUnitCode?: string;
}

export interface Item {
  id: string;
  sku: string;
  name: string;
  barcode: string;
  groupId: string;
  categoryId: string;
  unitId: string;
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // percentage e.g. 5, 12, 18
  reorderLevel: number;
  description?: string;
}

export interface Location {
  id: string;
  code: string;
  name: string;
  type: 'warehouse' | 'van' | 'depot';
  isDefault?: boolean;
  assignedVehicleId?: string;
  address?: string;
}

export interface Vehicle {
  id: string;
  regNumber: string;
  model: string;
  make: string;
  capacityKg: number;
  fuelType: 'Diesel' | 'Petrol' | 'EV' | 'CNG';
  assignedDriverId: string;
  locationId: string; // linked van location
  insuranceExpiry: string;
  status: 'on_field' | 'in_depot' | 'maintenance';
}

export interface SalesmanDriver {
  id: string;
  code: string;
  name: string;
  phone: string;
  licenseNumber: string;
  assignedVehicleId: string;
  routeArea: string;
  monthlyTarget: number;
  commissionPercentage: number;
  status: 'active' | 'on_leave';
}

export interface PriceListItem {
  itemId: string;
  customPrice: number;
}

export interface PriceList {
  id: string;
  name: string;
  code: string;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string;
  customerTier: 'all' | 'wholesale' | 'retail' | 'key_accounts';
  items: PriceListItem[];
}

export type VoucherType =
  | 'sales'
  | 'purchase'
  | 'receipt'
  | 'payment'
  | 'contra'
  | 'journal'
  | 'credit_note'
  | 'debit_note'
  | 'sales_order'
  | 'purchase_order';

export interface VoucherLineItem {
  itemId: string;
  itemName?: string;
  unitId: string;
  quantity: number;
  rate: number;
  discountPercent: number;
  taxRate: number;
  taxAmount: number;
  amount: number; // net after discount + tax
}

export interface JournalEntryLine {
  ledgerId: string;
  ledgerName?: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface BillAllocation {
  voucherId: string;
  voucherNumber: string;
  billAmount: number;
  allocatedAmount: number;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  voucherType: VoucherType;
  date: string; // YYYY-MM-DD
  partyType?: 'customer' | 'supplier' | 'ledger';
  partyId?: string;
  partyName?: string;
  locationId?: string; // which godown or van
  locationName?: string;
  vehicleId?: string; // if created on van
  driverId?: string;
  referenceNumber?: string;
  narration: string;
  items?: VoucherLineItem[];
  subtotal?: number;
  taxTotal?: number;
  discountTotal?: number;
  totalAmount: number;
  journalEntries: JournalEntryLine[]; // STRICT double-entry balanced lines!
  allocatedBills?: BillAllocation[];
  status?: 'draft' | 'posted' | 'cancelled';
}

export interface CompanyProfile {
  id: string;
  name: string;
  tradeName: string;
  taxNumber: string; // GSTIN / VAT ID
  registrationNumber: string;
  currency: string;
  currencySymbol: string;
  fiscalYearStart: string; // e.g. 2026-04-01
  fiscalYearEnd: string;   // e.g. 2027-03-31
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logoUrl?: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'salesman_pos' | 'accountant' | 'warehouse_manager';
  active: boolean;
  assignedLocationId?: string;
}

export interface StockMovementRecord {
  itemId: string;
  locationId: string;
  date: string;
  voucherId: string;
  voucherNumber: string;
  voucherType: VoucherType;
  inwardQty: number;
  outwardQty: number;
  rate: number;
}

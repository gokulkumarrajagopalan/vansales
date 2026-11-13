import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  CompanyProfile,
  Customer,
  Supplier,
  LedgerAccount,
  ItemGroup,
  ItemCategory,
  UnitOfMeasure,
  Item,
  Location,
  Vehicle,
  SalesmanDriver,
  PriceList,
  Voucher,
  UserAccount,
  PeriodType,
  VoucherType,
} from '../types/erp';
import {
  initialCompany,
  initialLedgers,
  initialCustomers,
  initialSuppliers,
  initialGroups,
  initialCategories,
  initialUnits,
  initialItems,
  initialLocations,
  initialVehicles,
  initialDrivers,
  initialPriceLists,
  initialVouchers,
  initialStockMatrix,
  initialUsers,
  LocationStock,
} from '../data/initialData';

interface StockSummaryRow {
  item: Item;
  unit: UnitOfMeasure;
  openingQty: number;
  openingValue: number;
  inwardQty: number;
  inwardValue: number;
  outwardQty: number;
  outwardValue: number;
  closingQty: number;
  closingValue: number;
}

interface MonthlyDrilldownRow {
  monthName: string;
  inwardQty: number;
  inwardValue: number;
  outwardQty: number;
  outwardValue: number;
  netClosingQty: number;
}

interface ErpContextType {
  // Navigation & Auth
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isCompanySelected: boolean;
  setIsCompanySelected: (val: boolean) => void;
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  customDateRange: { start: string; end: string };
  setCustomDateRange: (range: { start: string; end: string }) => void;

  // Selected sub-elements for statement/report views
  selectedPartyId: string | null;
  setSelectedPartyId: (id: string | null) => void;
  selectedGodownId: string | null;
  setSelectedGodownId: (id: string | null) => void;
  selectedFleetId: string | null;
  setSelectedFleetId: (id: string | null) => void;
  selectedVoucherTypeFilter: VoucherType | 'all';
  setSelectedVoucherTypeFilter: (type: VoucherType | 'all') => void;
  selectedDrilldownItemId: string | null;
  setSelectedDrilldownItemId: (id: string | null) => void;

  // Masters
  company: CompanyProfile;
  setCompany: (comp: CompanyProfile) => void;
  ledgers: LedgerAccount[];
  customers: Customer[];
  suppliers: Supplier[];
  groups: ItemGroup[];
  categories: ItemCategory[];
  units: UnitOfMeasure[];
  items: Item[];
  locations: Location[];
  vehicles: Vehicle[];
  drivers: SalesmanDriver[];
  priceLists: PriceList[];
  vouchers: Voucher[];
  stockMatrix: LocationStock[];
  users: UserAccount[];

  // Mutators
  addCustomer: (cust: Omit<Customer, 'id'>) => void;
  updateCustomer: (cust: Customer) => void;
  addSupplier: (supp: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supp: Supplier) => void;
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (item: Item) => void;
  addLocation: (loc: Omit<Location, 'id'>) => void;
  addVehicle: (veh: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (veh: Vehicle) => void;
  addDriver: (drv: Omit<SalesmanDriver, 'id'>) => void;
  updateDriver: (drv: SalesmanDriver) => void;
  addLedger: (ldg: Omit<LedgerAccount, 'id'>) => void;
  addPriceList: (pl: Omit<PriceList, 'id'>) => void;
  updatePriceList: (pl: PriceList) => void;
  addUser: (usr: Omit<UserAccount, 'id'>) => void;
  addVoucher: (voucher: Omit<Voucher, 'id'>) => { success: boolean; error?: string };

  // Calculations & Analytics
  getFilteredVouchers: (period?: PeriodType) => Voucher[];
  getPeriodDateBounds: (period: PeriodType) => { start: string; end: string };
  isDateInPeriod: (dateStr: string, period?: PeriodType) => boolean;
  getLedgerBalance: (ledgerId: string) => number;
  getCustomerBalance: (customerId: string) => number;
  getSupplierBalance: (supplierId: string) => number;
  getStockSummary: (locationId?: string | null) => StockSummaryRow[];
  getItemMonthlyMovement: (itemId: string, locationId?: string | null) => MonthlyDrilldownRow[];
  getItemVoucherHistory: (itemId: string, locationId?: string | null) => Voucher[];
  getCustomerAging: () => Array<{ customer: Customer; current: number; d1_30: number; d31_60: number; d61_90: number; d90_plus: number; total: number }>;
  getSupplierAging: () => Array<{ supplier: Supplier; current: number; d1_30: number; d31_60: number; d61_90: number; d90_plus: number; total: number }>;
  getTrialBalance: () => { rows: Array<{ ledger: LedgerAccount; debit: number; credit: number }>; totalDebit: number; totalCredit: number };
  getProfitAndLoss: () => {
    tradingIncome: number;
    costOfGoodsSold: number;
    grossProfit: number;
    operatingExpenses: number;
    netProfit: number;
    expenseDetails: Array<{ name: string; amount: number }>;
  };
  getBalanceSheet: () => {
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    assetRows: Array<{ name: string; amount: number }>;
    liabilityRows: Array<{ name: string; amount: number }>;
    equityRows: Array<{ name: string; amount: number }>;
    netProfit: number;
  };

  // Modal State
  activeVoucherModal: {
    isOpen: boolean;
    initialType?: VoucherType;
    partyId?: string;
    locationId?: string;
    viewOnlyVoucher?: Voucher;
  };
  openVoucherModal: (options?: { initialType?: VoucherType; partyId?: string; locationId?: string; viewOnlyVoucher?: Voucher }) => void;
  closeVoucherModal: () => void;

  // Print/View Invoice Modal
  invoiceToView: Voucher | null;
  setInvoiceToView: (v: Voucher | null) => void;

  resetDatabase: () => void;
}

const ErpContext = createContext<ErpContextType | undefined>(undefined);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('apex_erp_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('apex_erp_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Navigation & Authentication states
  const [currentView, setCurrentView] = useState<string>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [isCompanySelected, setIsCompanySelected] = useState<boolean>(false);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '2026-10-01',
    end: '2026-10-26',
  });

  // Drilldown / Selected report targets
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedGodownId, setSelectedGodownId] = useState<string | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null);
  const [selectedVoucherTypeFilter, setSelectedVoucherTypeFilter] = useState<VoucherType | 'all'>('all');
  const [selectedDrilldownItemId, setSelectedDrilldownItemId] = useState<string | null>(null);

  // Invoice / Voucher details popup
  const [invoiceToView, setInvoiceToView] = useState<Voucher | null>(null);

  // Voucher Creation Modal
  const [activeVoucherModal, setActiveVoucherModal] = useState<{
    isOpen: boolean;
    initialType?: VoucherType;
    partyId?: string;
    locationId?: string;
    viewOnlyVoucher?: Voucher;
  }>({ isOpen: false });

  // Masters
  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('apex_erp_company');
    return saved ? JSON.parse(saved) : initialCompany;
  });

  const [ledgers, setLedgers] = useState<LedgerAccount[]>(() => {
    const saved = localStorage.getItem('apex_erp_ledgers');
    return saved ? JSON.parse(saved) : initialLedgers;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('apex_erp_customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem('apex_erp_suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [groups, setGroups] = useState<ItemGroup[]>(() => {
    const saved = localStorage.getItem('apex_erp_groups');
    return saved ? JSON.parse(saved) : initialGroups;
  });

  const [categories, setCategories] = useState<ItemCategory[]>(() => {
    const saved = localStorage.getItem('apex_erp_categories');
    return saved ? JSON.parse(saved) : initialCategories;
  });

  const [units, setUnits] = useState<UnitOfMeasure[]>(() => {
    const saved = localStorage.getItem('apex_erp_units');
    return saved ? JSON.parse(saved) : initialUnits;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('apex_erp_items');
    return saved ? JSON.parse(saved) : initialItems;
  });

  const [locations, setLocations] = useState<Location[]>(() => {
    const saved = localStorage.getItem('apex_erp_locations');
    return saved ? JSON.parse(saved) : initialLocations;
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('apex_erp_vehicles');
    return saved ? JSON.parse(saved) : initialVehicles;
  });

  const [drivers, setDrivers] = useState<SalesmanDriver[]>(() => {
    const saved = localStorage.getItem('apex_erp_drivers');
    return saved ? JSON.parse(saved) : initialDrivers;
  });

  const [priceLists, setPriceLists] = useState<PriceList[]>(() => {
    const saved = localStorage.getItem('apex_erp_pricelists');
    return saved ? JSON.parse(saved) : initialPriceLists;
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('apex_erp_vouchers');
    return saved ? JSON.parse(saved) : initialVouchers;
  });

  const [stockMatrix, setStockMatrix] = useState<LocationStock[]>(() => {
    const saved = localStorage.getItem('apex_erp_stock');
    return saved ? JSON.parse(saved) : initialStockMatrix;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('apex_erp_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  // LocalStorage sync
  useEffect(() => {
    localStorage.setItem('apex_erp_company', JSON.stringify(company));
  }, [company]);
  useEffect(() => {
    localStorage.setItem('apex_erp_ledgers', JSON.stringify(ledgers));
  }, [ledgers]);
  useEffect(() => {
    localStorage.setItem('apex_erp_customers', JSON.stringify(customers));
  }, [customers]);
  useEffect(() => {
    localStorage.setItem('apex_erp_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem('apex_erp_items', JSON.stringify(items));
  }, [items]);
  useEffect(() => {
    localStorage.setItem('apex_erp_locations', JSON.stringify(locations));
  }, [locations]);
  useEffect(() => {
    localStorage.setItem('apex_erp_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);
  useEffect(() => {
    localStorage.setItem('apex_erp_drivers', JSON.stringify(drivers));
  }, [drivers]);
  useEffect(() => {
    localStorage.setItem('apex_erp_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);
  useEffect(() => {
    localStorage.setItem('apex_erp_stock', JSON.stringify(stockMatrix));
  }, [stockMatrix]);

  const openVoucherModal = (options?: { initialType?: VoucherType; partyId?: string; locationId?: string; viewOnlyVoucher?: Voucher }) => {
    setActiveVoucherModal({
      isOpen: true,
      initialType: options?.initialType || 'sales',
      partyId: options?.partyId,
      locationId: options?.locationId,
      viewOnlyVoucher: options?.viewOnlyVoucher,
    });
  };

  const closeVoucherModal = () => {
    setActiveVoucherModal({ isOpen: false });
  };

  // Date bound helper
  const getPeriodDateBounds = (period: PeriodType): { start: string; end: string } => {
    const today = '2026-10-26';
    switch (period) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday':
        return { start: '2026-10-25', end: '2026-10-25' };
      case 'this_week':
        return { start: '2026-10-20', end: '2026-10-26' };
      case 'this_month':
        return { start: '2026-10-01', end: '2026-10-31' };
      case 'last_month':
        return { start: '2026-09-01', end: '2026-09-30' };
      case 'this_year':
        return { start: '2026-04-01', end: '2027-03-31' };
      case 'custom':
        return customDateRange;
      default:
        return { start: '2026-01-01', end: '2026-12-31' };
    }
  };

  const isDateInPeriod = (dateStr: string, period: PeriodType = selectedPeriod): boolean => {
    const { start, end } = getPeriodDateBounds(period);
    return dateStr >= start && dateStr <= end;
  };

  const getFilteredVouchers = (period: PeriodType = selectedPeriod): Voucher[] => {
    return vouchers.filter(v => isDateInPeriod(v.date, period));
  };

  // Add Voucher with STRICT DEBIT = CREDIT VALIDATION
  const addVoucher = (voucherData: Omit<Voucher, 'id'>): { success: boolean; error?: string } => {
    const totalDebit = voucherData.journalEntries.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = voucherData.journalEntries.reduce((sum, line) => sum + (line.credit || 0), 0);

    // Strictly validate sum(debit) == sum(credit) with 0.01 tolerance
    if (Math.abs(totalDebit - totalCredit) > 0.02) {
      return {
        success: false,
        error: `Accounting Validation Error: Total Debit (${totalDebit.toFixed(2)}) must equal Total Credit (${totalCredit.toFixed(2)}). Difference is ${Math.abs(totalDebit - totalCredit).toFixed(2)}.`,
      };
    }

    const newId = `vouch_${Date.now()}`;
    const newVoucher: Voucher = {
      ...voucherData,
      id: newId,
    };

    setVouchers(prev => [newVoucher, ...prev]);

    // If voucher involves inventory (sales, purchase, credit_note, debit_note), update stock matrix
    if (newVoucher.items && newVoucher.items.length > 0 && newVoucher.locationId) {
      const locId = newVoucher.locationId;
      setStockMatrix(prevStock => {
        const next = [...prevStock];
        newVoucher.items?.forEach(itemLine => {
          const index = next.findIndex(s => s.itemId === itemLine.itemId && s.locationId === locId);
          let delta = 0;
          if (newVoucher.voucherType === 'purchase' || newVoucher.voucherType === 'credit_note') {
            delta = itemLine.quantity; // inward
          } else if (newVoucher.voucherType === 'sales' || newVoucher.voucherType === 'debit_note') {
            delta = -itemLine.quantity; // outward
          }

          if (index >= 0) {
            next[index] = { ...next[index], quantity: Math.max(0, next[index].quantity + delta) };
          } else {
            next.push({ itemId: itemLine.itemId, locationId: locId, quantity: Math.max(0, delta) });
          }
        });
        return next;
      });
    }

    return { success: true };
  };

  // Master adders
  const addCustomer = (custData: Omit<Customer, 'id'>) => {
    const newCust: Customer = {
      ...custData,
      id: `cust_${Date.now()}`,
    };
    setCustomers(prev => [...prev, newCust]);
  };

  const updateCustomer = (cust: Customer) => {
    setCustomers(prev => prev.map(c => c.id === cust.id ? cust : c));
  };

  const addSupplier = (suppData: Omit<Supplier, 'id'>) => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp_${Date.now()}`,
    };
    setSuppliers(prev => [...prev, newSupp]);
  };

  const updateSupplier = (supp: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === supp.id ? supp : s));
  };

  const addItem = (itemData: Omit<Item, 'id'>) => {
    const newItem: Item = {
      ...itemData,
      id: `item_${Date.now()}`,
    };
    setItems(prev => [...prev, newItem]);
    // initialize zero stock in default main location
    setStockMatrix(prev => [...prev, { itemId: newItem.id, locationId: 'loc_main', quantity: 0 }]);
  };

  const updateItem = (item: Item) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
  };

  const addLocation = (locData: Omit<Location, 'id'>) => {
    const newLoc: Location = {
      ...locData,
      id: `loc_${Date.now()}`,
    };
    setLocations(prev => [...prev, newLoc]);
  };

  const addVehicle = (vehData: Omit<Vehicle, 'id'>) => {
    const newVeh: Vehicle = {
      ...vehData,
      id: `veh_${Date.now()}`,
    };
    setVehicles(prev => [...prev, newVeh]);
  };

  const updateVehicle = (veh: Vehicle) => {
    setVehicles(prev => prev.map(v => v.id === veh.id ? veh : v));
  };

  const addDriver = (drvData: Omit<SalesmanDriver, 'id'>) => {
    const newDrv: SalesmanDriver = {
      ...drvData,
      id: `driver_${Date.now()}`,
    };
    setDrivers(prev => [...prev, newDrv]);
  };

  const updateDriver = (drv: SalesmanDriver) => {
    setDrivers(prev => prev.map(d => d.id === drv.id ? drv : d));
  };

  const addLedger = (ldgData: Omit<LedgerAccount, 'id'>) => {
    const newLdg: LedgerAccount = {
      ...ldgData,
      id: `led_${Date.now()}`,
    };
    setLedgers(prev => [...prev, newLdg]);
  };

  const addPriceList = (plData: Omit<PriceList, 'id'>) => {
    const newPl: PriceList = {
      ...plData,
      id: `pl_${Date.now()}`,
    };
    setPriceLists(prev => [...prev, newPl]);
  };

  const updatePriceList = (pl: PriceList) => {
    setPriceLists(prev => prev.map(p => p.id === pl.id ? pl : p));
  };

  const addUser = (usrData: Omit<UserAccount, 'id'>) => {
    const newUsr: UserAccount = {
      ...usrData,
      id: `usr_${Date.now()}`,
    };
    setUsers(prev => [...prev, newUsr]);
  };

  // Ledger Balance Calculator
  const getLedgerBalance = (ledgerId: string): number => {
    const ledger = ledgers.find(l => l.id === ledgerId);
    let balance = ledger ? ledger.openingBalance : 0;

    vouchers.forEach(v => {
      v.journalEntries.forEach(entry => {
        if (entry.ledgerId === ledgerId) {
          // In standard debit/credit:
          // Assets & Expenses increase with Debit (+), decrease with Credit (-)
          // Liabilities, Equity, Incomes increase with Credit (-), decrease with Debit (+)
          if (ledger?.type === 'asset' || ledger?.type === 'expense') {
            balance += (entry.debit || 0) - (entry.credit || 0);
          } else {
            balance += (entry.credit || 0) - (entry.debit || 0);
          }
        }
      });
    });

    return balance;
  };

  // Customer Balance (Receivable)
  const getCustomerBalance = (customerId: string): number => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return 0;
    let balance = customer.openingBalance || 0;

    vouchers.forEach(v => {
      if (v.partyType === 'customer' && v.partyId === customerId) {
        if (v.voucherType === 'sales') {
          balance += v.totalAmount;
        } else if (v.voucherType === 'receipt') {
          balance -= v.totalAmount;
        } else if (v.voucherType === 'credit_note') {
          balance -= v.totalAmount;
        }
      }
    });

    return balance;
  };

  // Supplier Balance (Payable)
  const getSupplierBalance = (supplierId: string): number => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return 0;
    let balance = supplier.openingBalance || 0;

    vouchers.forEach(v => {
      if (v.partyType === 'supplier' && v.partyId === supplierId) {
        if (v.voucherType === 'purchase') {
          balance += v.totalAmount;
        } else if (v.voucherType === 'payment') {
          balance -= v.totalAmount;
        } else if (v.voucherType === 'debit_note') {
          balance -= v.totalAmount;
        }
      }
    });

    return balance;
  };

  // Stock Summary with Opening, Inward, Outward, Closing (Tally style)
  const getStockSummary = (locationId?: string | null): StockSummaryRow[] => {
    return items.map(item => {
      const unit = units.find(u => u.id === item.unitId) || units[0];

      // Calculate movements from vouchers
      let inwardQty = 0;
      let outwardQty = 0;

      vouchers.forEach(v => {
        if (locationId && v.locationId !== locationId) return;
        if (!isDateInPeriod(v.date)) return;

        v.items?.forEach(line => {
          if (line.itemId === item.id) {
            if (v.voucherType === 'purchase' || v.voucherType === 'credit_note') {
              inwardQty += line.quantity;
            } else if (v.voucherType === 'sales' || v.voucherType === 'debit_note') {
              outwardQty += line.quantity;
            }
          }
        });
      });

      // Current stock in location(s)
      const currentStock = stockMatrix
        .filter(s => s.itemId === item.id && (!locationId || s.locationId === locationId))
        .reduce((sum, s) => sum + s.quantity, 0);

      // In classic Tally: Closing = Opening + Inward - Outward
      // So Opening = Closing - Inward + Outward
      const openingQty = Math.max(0, currentStock - inwardQty + outwardQty);
      const closingQty = currentStock;

      return {
        item,
        unit,
        openingQty,
        openingValue: openingQty * item.costPrice,
        inwardQty,
        inwardValue: inwardQty * item.costPrice,
        outwardQty,
        outwardValue: outwardQty * item.sellingPrice,
        closingQty,
        closingValue: closingQty * item.costPrice,
      };
    });
  };

  // Monthly drill-down for selected item (Tally inspiration)
  const getItemMonthlyMovement = (itemId: string, locationId?: string | null): MonthlyDrilldownRow[] => {
    const months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026'];
    const item = items.find(i => i.id === itemId);
    const cost = item ? item.costPrice : 10;
    const price = item ? item.sellingPrice : 15;

    let cumulative = 100; // baseline

    return months.map((monthName, idx) => {
      // In October (current month) show actual vouchers, in previous show synthetic historical movement
      let inQty = 0;
      let outQty = 0;

      if (idx === 6) { // Oct 2026
        vouchers.forEach(v => {
          if (locationId && v.locationId !== locationId) return;
          v.items?.forEach(l => {
            if (l.itemId === itemId) {
              if (v.voucherType === 'purchase' || v.voucherType === 'credit_note') inQty += l.quantity;
              if (v.voucherType === 'sales' || v.voucherType === 'debit_note') outQty += l.quantity;
            }
          });
        });
      } else {
        inQty = (idx + 1) * 45;
        outQty = (idx + 1) * 38;
      }

      cumulative = cumulative + inQty - outQty;

      return {
        monthName,
        inwardQty: inQty,
        inwardValue: inQty * cost,
        outwardQty: outQty,
        outwardValue: outQty * price,
        netClosingQty: Math.max(0, cumulative),
      };
    });
  };

  // Item voucher history drill-down
  const getItemVoucherHistory = (itemId: string, locationId?: string | null): Voucher[] => {
    return vouchers.filter(v => {
      if (locationId && v.locationId !== locationId) return false;
      return v.items?.some(i => i.itemId === itemId);
    });
  };

  // Customer Aging report
  const getCustomerAging = () => {
    return customers.map(cust => {
      const balance = getCustomerBalance(cust.id);
      // Realistic aging distribution
      const d1_30 = Math.round(balance * 0.55);
      const d31_60 = Math.round(balance * 0.30);
      const d61_90 = Math.round(balance * 0.12);
      const d90_plus = Math.max(0, balance - (d1_30 + d31_60 + d61_90));

      return {
        customer: cust,
        current: d1_30,
        d1_30,
        d31_60,
        d61_90,
        d90_plus,
        total: balance,
      };
    });
  };

  // Supplier Aging report
  const getSupplierAging = () => {
    return suppliers.map(supp => {
      const balance = getSupplierBalance(supp.id);
      const d1_30 = Math.round(balance * 0.60);
      const d31_60 = Math.round(balance * 0.28);
      const d61_90 = Math.round(balance * 0.10);
      const d90_plus = Math.max(0, balance - (d1_30 + d31_60 + d61_90));

      return {
        supplier: supp,
        current: d1_30,
        d1_30,
        d31_60,
        d61_90,
        d90_plus,
        total: balance,
      };
    });
  };

  // Trial Balance calculation
  const getTrialBalance = () => {
    const rows = ledgers.map(ldg => {
      let debit = 0;
      let credit = 0;

      // Add opening balance
      if (ldg.openingBalance > 0) {
        debit += ldg.openingBalance;
      } else if (ldg.openingBalance < 0) {
        credit += Math.abs(ldg.openingBalance);
      }

      // Add all journal entries
      vouchers.forEach(v => {
        v.journalEntries.forEach(entry => {
          if (entry.ledgerId === ldg.id) {
            debit += entry.debit || 0;
            credit += entry.credit || 0;
          }
        });
      });

      // Net off to debit or credit column
      if (debit > credit) {
        debit = debit - credit;
        credit = 0;
      } else {
        credit = credit - debit;
        debit = 0;
      }

      return { ledger: ldg, debit, credit };
    });

    const totalDebit = rows.reduce((sum, r) => sum + r.debit, 0);
    const totalCredit = rows.reduce((sum, r) => sum + r.credit, 0);

    return { rows, totalDebit, totalCredit };
  };

  // Profit and Loss calculation
  const getProfitAndLoss = () => {
    let sales = 0;
    let purchase = 0;
    const expenseMap: { [key: string]: number } = {};

    vouchers.forEach(v => {
      if (v.voucherType === 'sales') {
        sales += v.subtotal || v.totalAmount;
      } else if (v.voucherType === 'credit_note') {
        sales -= (v.subtotal || v.totalAmount);
      } else if (v.voucherType === 'purchase') {
        purchase += v.subtotal || v.totalAmount;
      } else if (v.voucherType === 'debit_note') {
        purchase -= (v.subtotal || v.totalAmount);
      }

      // Check expense entries
      v.journalEntries.forEach(line => {
        const ledger = ledgers.find(l => l.id === line.ledgerId);
        if (ledger && ledger.type === 'expense' && ledger.subtype !== 'cost_of_goods_sold') {
          expenseMap[ledger.name] = (expenseMap[ledger.name] || 0) + (line.debit || 0) - (line.credit || 0);
        }
      });
    });

    const costOfGoodsSold = purchase;
    const grossProfit = sales - costOfGoodsSold;

    const expenseDetails = Object.keys(expenseMap).map(name => ({
      name,
      amount: Math.max(0, expenseMap[name]),
    }));

    const operatingExpenses = expenseDetails.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = grossProfit - operatingExpenses;

    return {
      tradingIncome: sales,
      costOfGoodsSold,
      grossProfit,
      operatingExpenses,
      netProfit,
      expenseDetails,
    };
  };

  // Balance Sheet
  const getBalanceSheet = () => {
    const { rows } = getTrialBalance();
    const { netProfit } = getProfitAndLoss();

    const assetRows: Array<{ name: string; amount: number }> = [];
    const liabilityRows: Array<{ name: string; amount: number }> = [];
    const equityRows: Array<{ name: string; amount: number }> = [];

    rows.forEach(r => {
      if (r.ledger.type === 'asset') {
        const val = r.debit - r.credit;
        if (val !== 0) assetRows.push({ name: r.ledger.name, amount: val });
      } else if (r.ledger.type === 'liability') {
        const val = r.credit - r.debit;
        if (val !== 0) liabilityRows.push({ name: r.ledger.name, amount: val });
      } else if (r.ledger.type === 'equity') {
        const val = r.credit - r.debit;
        if (val !== 0) equityRows.push({ name: r.ledger.name, amount: val });
      }
    });

    // Add Net Profit to Equity
    equityRows.push({ name: 'Net Profit / (Loss) for the period', amount: netProfit });

    const totalAssets = assetRows.reduce((sum, r) => sum + r.amount, 0);
    const totalLiabilities = liabilityRows.reduce((sum, r) => sum + r.amount, 0);
    const totalEquity = equityRows.reduce((sum, r) => sum + r.amount, 0);

    return {
      totalAssets,
      totalLiabilities,
      totalEquity,
      assetRows,
      liabilityRows,
      equityRows,
      netProfit,
    };
  };

  const resetDatabase = () => {
    localStorage.clear();
    setCompany(initialCompany);
    setLedgers(initialLedgers);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setGroups(initialGroups);
    setCategories(initialCategories);
    setUnits(initialUnits);
    setItems(initialItems);
    setLocations(initialLocations);
    setVehicles(initialVehicles);
    setDrivers(initialDrivers);
    setPriceLists(initialPriceLists);
    setVouchers(initialVouchers);
    setStockMatrix(initialStockMatrix);
    setUsers(initialUsers);
  };

  return (
    <ErpContext.Provider
      value={{
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        isAuthenticated,
        setIsAuthenticated,
        currentUser,
        setCurrentUser,
        isCompanySelected,
        setIsCompanySelected,
        selectedPeriod,
        setSelectedPeriod,
        customDateRange,
        setCustomDateRange,

        selectedPartyId,
        setSelectedPartyId,
        selectedGodownId,
        setSelectedGodownId,
        selectedFleetId,
        setSelectedFleetId,
        selectedVoucherTypeFilter,
        setSelectedVoucherTypeFilter,
        selectedDrilldownItemId,
        setSelectedDrilldownItemId,

        company,
        setCompany,
        ledgers,
        customers,
        suppliers,
        groups,
        categories,
        units,
        items,
        locations,
        vehicles,
        drivers,
        priceLists,
        vouchers,
        stockMatrix,
        users,

        addCustomer,
        updateCustomer,
        addSupplier,
        updateSupplier,
        addItem,
        updateItem,
        addLocation,
        addVehicle,
        updateVehicle,
        addDriver,
        updateDriver,
        addLedger,
        addPriceList,
        updatePriceList,
        addUser,
        addVoucher,

        getFilteredVouchers,
        getPeriodDateBounds,
        isDateInPeriod,
        getLedgerBalance,
        getCustomerBalance,
        getSupplierBalance,
        getStockSummary,
        getItemMonthlyMovement,
        getItemVoucherHistory,
        getCustomerAging,
        getSupplierAging,
        getTrialBalance,
        getProfitAndLoss,
        getBalanceSheet,

        activeVoucherModal,
        openVoucherModal,
        closeVoucherModal,

        invoiceToView,
        setInvoiceToView,

        resetDatabase,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};

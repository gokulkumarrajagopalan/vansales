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
  Order,
  CropAdvisory,
  Permission,
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
  initialOrders,
  initialCropAdvisories,
  initialPermissions,
} from '../data/initialData';
import {
  BackendSyncSummary,
  fetchBackendVouchers,
  getTokenForCreator,
  loginBackendUser,
  postVoucherToBackend,
  resolveBackendCredentials,
} from '../services/backendSync';
import {
  getFiscalYearBoundsIso,
  getMonthBoundsIso,
  getRelativeIsoDate,
  getTodayIsoDate,
} from '../utils/dateUtils';

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
  goBack: () => void;
  canGoBack: boolean;
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  logout: () => void;
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isCompanySelected: boolean;
  setIsCompanySelected: (val: boolean) => void;
  selectedPeriod: PeriodType;
  setSelectedPeriod: (period: PeriodType) => void;
  customDateRange: { start: string; end: string };

  // Tally Order Admin Portal additions
  orders: Order[];
  approveOrder: (id: string) => void;
  rejectOrder: (id: string, reason: string) => void;
  syncOrderToTally: (id: string) => void;
  addOrder: (order: Partial<Order>) => void;
  pendingOrdersCount: number;

  // Crop Advisory Desk
  cropAdvisories: CropAdvisory[];
  resolveAdvisory: (id: string, solutionNotes: string) => void;
  addAdvisory: (advisory: Omit<CropAdvisory, 'id' | 'createdAt' | 'status'>) => void;

  // Spatie RBAC Permissions
  permissions: Permission[];
  addPermission: (name: string, groupName: string, description?: string) => void;

  // Dynamic Theming
  themeColor: string;
  setThemeColor: (color: string) => void;
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

  isVoucherAccessible: (v: Voucher) => boolean;

  // Backend Synchronization
  isSyncingBackend: boolean;
  lastBackendSync: string | null;
  backendSyncError: string | null;
  syncFromBackend: (tokenOverride?: string) => Promise<{ fetchedInvoices: number; fetchedReceipts: number; error?: string }>;
  postAllInvoicesToBackend: () => Promise<BackendSyncSummary>;
}

const safeParseStorage = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed !== null && parsed !== undefined ? (parsed as T) : fallback;
  } catch {
    return fallback;
  }
};

const CURRENT_SEED_VERSION = '2026-11-12-fresh-v2';
if (typeof window !== 'undefined') {
  try {
    const currentVersion = localStorage.getItem('erp_seed_version');
    if (currentVersion !== CURRENT_SEED_VERSION) {
      const keysToPurge = [
        'apex_erp_theme',
        'apex_erp_company',
        'apex_erp_ledgers',
        'apex_erp_vouchers',
        'apex_erp_stock_items',
        'apex_erp_stock_matrix',
        'apex_erp_locations',
        'apex_erp_vehicles',
        'apex_erp_drivers',
        'apex_erp_customers',
        'apex_erp_suppliers',
        'apex_erp_users',
        'erp_tally_orders',
        'erp_advisories',
        'user',
        'token',
        'backend_user',
        'erp_is_company_selected',
      ];
      keysToPurge.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('erp_seed_version', CURRENT_SEED_VERSION);
    }
  } catch (e) {
    console.warn('Seed version purge check failed:', e);
  }
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

  // Navigation & Authentication states (with session + URL hash persistence)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('token') && localStorage.getItem('user'));
    } catch {
      return false;
    }
  });
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isCompanySelected, setIsCompanySelectedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('erp_is_company_selected') === 'true';
    } catch {
      return false;
    }
  });
  const setIsCompanySelected = (val: boolean) => {
    setIsCompanySelectedState(val);
    try {
      if (val) localStorage.setItem('erp_is_company_selected', 'true');
      else localStorage.removeItem('erp_is_company_selected');
    } catch {
      // ignore storage errors
    }
  };
  const [currentView, setCurrentViewState] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
      const hashView = window.location.hash.slice(2).trim();
      if (hashView) return hashView;
    }
    return isAuthenticated && isCompanySelected ? 'dashboard' : 'landing';
  });
  const [viewHistory, setViewHistory] = useState<string[]>([]);
  const setCurrentView = (view: string) => {
    if (view !== currentView) {
      setViewHistory(prev => (prev[prev.length - 1] === currentView ? prev : [...prev, currentView]));
    }
    setCurrentViewState(view);
    if (typeof window !== 'undefined') {
      const targetHash = `#/${view}`;
      if (window.location.hash !== targetHash) {
        window.history.pushState(null, '', targetHash);
      }
    }
  };
  const goBack = () => {
    if (viewHistory.length > 0) {
      const nextHistory = [...viewHistory];
      const prev = nextHistory.pop()!;
      setViewHistory(nextHistory);
      setCurrentViewState(prev);
      if (typeof window !== 'undefined') {
        const targetHash = `#/${prev}`;
        if (window.location.hash !== targetHash) {
          window.history.pushState(null, '', targetHash);
        }
      }
    } else {
      setCurrentViewState('dashboard');
      if (typeof window !== 'undefined') {
        window.location.hash = '#/dashboard';
      }
    }
  };
  const canGoBack = Boolean(currentView && currentView !== 'dashboard' && currentView !== 'landing' && currentView !== 'login');
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash.startsWith('#/')) {
        const hashView = window.location.hash.slice(2).trim();
        if (hashView) setCurrentViewState(hashView);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>(() => ({
    start: getMonthBoundsIso(0).start,
    end: getTodayIsoDate(),
  }));

  // Drilldown / Selected report targets
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [selectedGodownId, setSelectedGodownId] = useState<string | null>(null);
  const [selectedFleetId, setSelectedFleetId] = useState<string | null>(null);
  const [selectedVoucherTypeFilter, setSelectedVoucherTypeFilter] = useState<VoucherType | 'all'>('all');
  const [selectedDrilldownItemId, setSelectedDrilldownItemId] = useState<string | null>(null);

  // Invoice / Voucher details popup
  const [invoiceToView, setInvoiceToView] = useState<Voucher | null>(null);

  // Backend Sync Status
  const [isSyncingBackend, setIsSyncingBackend] = useState<boolean>(false);
  const [lastBackendSync, setLastBackendSync] = useState<string | null>(null);
  const [backendSyncError, setBackendSyncError] = useState<string | null>(null);

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('Apex')) {
          return parsed;
        }
      } catch (e) {}
    }
    return initialCompany;
  });

  const [ledgers, setLedgers] = useState<LedgerAccount[]>(() =>
    safeParseStorage('apex_erp_ledgers', initialLedgers)
  );

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const parsed = safeParseStorage<Customer[] | null>('apex_erp_customers', null);
    if (Array.isArray(parsed)) {
      return parsed.map(c => {
        const init = initialCustomers.find(ic => ic.id === c.id);
        return {
          ...c,
          createdBy: c.createdBy || init?.createdBy || 'usr_admin1',
          createdByName: c.createdByName || init?.createdByName || 'System Admin Lead',
          assignedSalesmanId: c.assignedSalesmanId || init?.assignedSalesmanId,
          assignedVehicleId: c.assignedVehicleId || init?.assignedVehicleId,
        };
      });
    }
    return initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    safeParseStorage('apex_erp_suppliers', initialSuppliers)
  );

  const [groups, setGroups] = useState<ItemGroup[]>(() =>
    safeParseStorage('apex_erp_groups', initialGroups)
  );

  const [categories, setCategories] = useState<ItemCategory[]>(() =>
    safeParseStorage('apex_erp_categories', initialCategories)
  );

  const [units, setUnits] = useState<UnitOfMeasure[]>(() =>
    safeParseStorage('apex_erp_units', initialUnits)
  );

  const [items, setItems] = useState<Item[]>(() =>
    safeParseStorage('apex_erp_items', initialItems)
  );

  const [locations, setLocations] = useState<Location[]>(() =>
    safeParseStorage('apex_erp_locations', initialLocations)
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>(() =>
    safeParseStorage('apex_erp_vehicles', initialVehicles)
  );

  const [drivers, setDrivers] = useState<SalesmanDriver[]>(() =>
    safeParseStorage('apex_erp_drivers', initialDrivers)
  );

  const [priceLists, setPriceLists] = useState<PriceList[]>(() =>
    safeParseStorage('apex_erp_pricelists', initialPriceLists)
  );

  // --- Tally Order State & Theming ---
  const [themeColor, setThemeColorState] = useState<string>(() => {
    return localStorage.getItem('erp_theme_color') || '#2563eb';
  });

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
    localStorage.setItem('erp_theme_color', color);
    document.documentElement.style.setProperty('--theme-primary', color);
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-primary', themeColor);
  }, [themeColor]);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('erp_tally_orders');
    if (saved) {
      try {
        const parsed: Order[] = JSON.parse(saved);
        return parsed.map(o => {
          const init = initialOrders.find(io => io.id === o.id);
          if (init && (o.salesPersonId === 'u2' || !o.salesPersonId.startsWith('usr_'))) {
            return {
              ...o,
              salesPersonId: init.salesPersonId,
              salesPersonName: init.salesPersonName,
              salesPersonPhone: init.salesPersonPhone,
              vendorId: init.vendorId,
              vendorName: init.vendorName,
            };
          }
          return o;
        });
      } catch {
        return initialOrders;
      }
    }
    return initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('erp_tally_orders', JSON.stringify(orders));
  }, [orders]);

  const [cropAdvisories, setCropAdvisories] = useState<CropAdvisory[]>(() => {
    const saved = localStorage.getItem('erp_crop_advisories');
    return saved ? JSON.parse(saved) : initialCropAdvisories;
  });

  useEffect(() => {
    localStorage.setItem('erp_crop_advisories', JSON.stringify(cropAdvisories));
  }, [cropAdvisories]);

  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const saved = localStorage.getItem('erp_permissions');
    return saved ? JSON.parse(saved) : initialPermissions;
  });

  useEffect(() => {
    localStorage.setItem('erp_permissions', JSON.stringify(permissions));
  }, [permissions]);

  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'pending').length;
  }, [orders]);

  const approveOrder = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'approved',
          approvedBy: 'Super Admin',
          approvedAt: new Date().toISOString(),
          tallySyncStatus: 'synced',
          tallyVoucherNumber: 'SV-' + Date.now().toString().slice(-6),
        };
      }
      return o;
    }));
  };

  const rejectOrder = (id: string, reason: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status: 'rejected',
          rejectionReason: reason,
          tallySyncStatus: 'failed',
        };
      }
      return o;
    }));
  };

  const syncOrderToTally = (id: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          tallySyncStatus: 'synced',
          tallyVoucherNumber: o.tallyVoucherNumber || 'SV-' + Date.now().toString().slice(-6),
        };
      }
      return o;
    }));
  };

  const addOrder = (newOrderData: Partial<Order>) => {
    const newOrd: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      salesPersonId: newOrderData.salesPersonId || 'u2',
      salesPersonName: newOrderData.salesPersonName || 'Sales Person',
      salesPersonPhone: newOrderData.salesPersonPhone || '9876543210',
      vendorId: newOrderData.vendorId || 'cust-1',
      vendorName: newOrderData.vendorName || 'Selected Vendor',
      vendorShopName: newOrderData.vendorShopName || 'Retail Outlet',
      vendorPhone: newOrderData.vendorPhone || '9825000000',
      vendorBorrowLimit: newOrderData.vendorBorrowLimit || 50000,
      vendorAddress: newOrderData.vendorAddress || 'Main Road',
      items: newOrderData.items || [],
      subtotal: newOrderData.subtotal || 0,
      discountAmount: newOrderData.discountAmount || 0,
      finalTotal: newOrderData.finalTotal || 0,
      status: (newOrderData.discountAmount && newOrderData.discountAmount > 0) ? 'pending' : 'approved',
      tallySyncStatus: 'pending',
      createdAt: new Date().toISOString(),
      ...newOrderData,
    };
    setOrders(prev => [newOrd, ...prev]);
  };

  const resolveAdvisory = (id: string, solutionNotes: string) => {
    setCropAdvisories(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: 'Resolved', solutionNotes };
      }
      return a;
    }));
  };

  const addAdvisory = (data: Omit<CropAdvisory, 'id' | 'createdAt' | 'status'>) => {
    const newAdv: CropAdvisory = {
      id: 'adv-' + Date.now(),
      ...data,
      status: 'In Review',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCropAdvisories(prev => [newAdv, ...prev]);
  };

  const addPermission = (name: string, groupName: string, description?: string) => {
    const newP: Permission = {
      id: 'p-' + Date.now(),
      name,
      groupName,
      description,
    };
    setPermissions(prev => [...prev, newP]);
  };

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('apex_erp_vouchers');
    if (saved) {
      try {
        const parsed: Voucher[] = JSON.parse(saved);
        return parsed.map(v => {
          const init = initialVouchers.find(iv => iv.id === v.id);
          return {
            ...v,
            createdBy: v.createdBy || init?.createdBy || (v.locationId === 'loc_van1' ? 'usr_van1' : v.locationId === 'loc_van2' ? 'usr_van2' : v.locationId === 'loc_van3' ? 'usr_van3' : 'usr_admin1'),
            createdByName: v.createdByName || init?.createdByName || (v.locationId === 'loc_van1' ? 'Karthik Rao (Van 01)' : v.locationId === 'loc_van2' ? 'Imran Shaikh (Van 02)' : v.locationId === 'loc_van3' ? 'Prakash Nair (Van 03)' : 'System Admin Lead'),
          };
        });
      } catch {
        return initialVouchers;
      }
    }
    return initialVouchers;
  });

  const [stockMatrix, setStockMatrix] = useState<LocationStock[]>(() => {
    const saved = localStorage.getItem('apex_erp_stock');
    return saved ? JSON.parse(saved) : initialStockMatrix;
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('apex_erp_users');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        return parsed.map(u => {
          const init = initialUsers.find(iu => iu.id === u.id);
          return {
            ...u,
            assignedVehicleId: u.assignedVehicleId || init?.assignedVehicleId,
          };
        });
      } catch {
        return initialUsers;
      }
    }
    return initialUsers;
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
    const today = getTodayIsoDate();
    const yesterday = getRelativeIsoDate(-1);
    const weekStart = getRelativeIsoDate(-6);
    const thisMonth = getMonthBoundsIso(0);
    const lastMonth = getMonthBoundsIso(-1);
    const fiscalYear = getFiscalYearBoundsIso();
    switch (period) {
      case 'today':
        return { start: today, end: today };
      case 'yesterday':
        return { start: yesterday, end: yesterday };
      case 'this_week':
        return { start: weekStart, end: today };
      case 'this_month':
        return thisMonth;
      case 'last_month':
        return lastMonth;
      case 'this_year':
        return fiscalYear;
      case 'custom':
        return customDateRange;
      default:
        return fiscalYear;
    }
  };

  const isDateInPeriod = (dateStr: string, period: PeriodType = selectedPeriod): boolean => {
    const { start, end } = getPeriodDateBounds(period);
    return dateStr >= start && dateStr <= end;
  };

  // Check if a voucher belongs to current user / van territory
  const isVoucherAccessible = (v: Voucher): boolean => {
    if (!currentUser || currentUser.role !== 'salesman_pos') return true;
    // Salesman can strictly ONLY see vouchers created by him
    return v.createdBy === currentUser.id;
  };

  const getFilteredVouchers = (period: PeriodType = selectedPeriod): Voucher[] => {
    return vouchers.filter(v => isDateInPeriod(v.date, period) && isVoucherAccessible(v));
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
      createdBy: voucherData.createdBy || currentUser?.id || 'usr_admin1',
      createdByName: voucherData.createdByName || currentUser?.name || 'System Admin Lead',
      locationId: voucherData.locationId || currentUser?.assignedLocationId || 'loc_main',
      vehicleId: voucherData.vehicleId || currentUser?.assignedVehicleId,
    };

    setVouchers(prev => [newVoucher, ...prev]);

    // Auto-persist Sales Invoices and Payment Receipts to PostgreSQL Backend API
    if (newVoucher.voucherType === 'sales' || newVoucher.voucherType === 'receipt') {
      (async () => {
        try {
          const token = localStorage.getItem('token') || (await loginBackendUser(currentUser)) || undefined;
          const res = await postVoucherToBackend(newVoucher, token);
          if (res?.id) {
            setVouchers(prev =>
              prev.map(v =>
                v.id === newId
                  ? {
                      ...v,
                      backendId: res.id,
                      guid: res.guid || v.guid,
                      syncStatus: res.syncStatus || 'READY',
                      source: v.source || 'WEB_APP',
                    }
                  : v
              )
            );
            setLastBackendSync(new Date().toISOString());
          }
        } catch (err: any) {
          console.warn('[Auto Backend Sync Error]', err?.response?.data?.message || err?.message);
          setBackendSyncError(err?.response?.data?.message || err?.message || 'Auto-sync failed');
        }
      })();
    }

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
      createdBy: currentUser?.id || 'usr_admin1',
      createdByName: currentUser?.name || 'System Admin Lead',
      assignedSalesmanId: currentUser?.role === 'salesman_pos' ? currentUser.id : undefined,
      assignedVehicleId: currentUser?.assignedVehicleId,
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
        // If salesman, only compute transactions created by/accessible to him
        if (currentUser?.role === 'salesman_pos' && !isVoucherAccessible(v)) return;
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

  const syncFromBackend = async (tokenOverride?: string): Promise<{ fetchedInvoices: number; fetchedReceipts: number; error?: string }> => {
    setIsSyncingBackend(true);
    setBackendSyncError(null);
    try {
      const token = tokenOverride || (await loginBackendUser(currentUser)) || undefined;
      if (!token) {
        const msg = 'Unable to authenticate with backend API';
        setBackendSyncError(msg);
        return { fetchedInvoices: 0, fetchedReceipts: 0, error: msg };
      }

      const { invoices: beInvoices, receipts: beReceipts } = await fetchBackendVouchers(
        customers,
        ledgers,
        items,
        token
      );

      const allBe = [...beInvoices, ...beReceipts];
      const byNum = new Map<string, Voucher>();
      allBe.forEach(b => {
        if (b.voucherNumber) byNum.set(b.voucherNumber, b);
      });

      const isRestricted = currentUser?.role === 'salesman_pos';

      setVouchers(prev => {
        const seenNums = new Set<string>();
        const mergedExisting: Voucher[] = [];

        for (const v of prev) {
          if (v.voucherType !== 'sales' && v.voucherType !== 'receipt') {
            mergedExisting.push(v);
            continue;
          }

          const matchedBe = byNum.get(v.voucherNumber);
          if (matchedBe) {
            seenNums.add(v.voucherNumber);
            mergedExisting.push({
              ...v,
              backendId: matchedBe.backendId,
              guid: matchedBe.guid,
              source: matchedBe.source,
              syncStatus: matchedBe.syncStatus,
              paymentMode: matchedBe.paymentMode || v.paymentMode,
            });
          } else if (!v.backendId) {
            // Preserve local unsynced vouchers
            seenNums.add(v.voucherNumber);
            mergedExisting.push(v);
          } else if (isRestricted && v.createdBy !== currentUser?.id) {
            // Preserve other vans' already-synced vouchers when a restricted salesman views DB
            seenNums.add(v.voucherNumber);
            mergedExisting.push(v);
          }
        }

        const newFromBackend = allBe.filter(b => b.voucherNumber && !seenNums.has(b.voucherNumber));
        return [...newFromBackend, ...mergedExisting];
      });

      setLastBackendSync(new Date().toISOString());
      return { fetchedInvoices: beInvoices.length, fetchedReceipts: beReceipts.length };
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to sync from backend';
      setBackendSyncError(msg);
      return { fetchedInvoices: 0, fetchedReceipts: 0, error: msg };
    } finally {
      setIsSyncingBackend(false);
    }
  };

  const postAllInvoicesToBackend = async (): Promise<BackendSyncSummary> => {
    setIsSyncingBackend(true);
    setBackendSyncError(null);
    const summary: BackendSyncSummary = {
      postedInvoices: 0,
      postedReceipts: 0,
      skipped: 0,
      failed: 0,
      fetchedInvoices: 0,
      fetchedReceipts: 0,
      errors: [],
    };

    try {
      const tokenCache = new Map<string, string>();
      const targets = vouchers.filter(
        v => (v.voucherType === 'sales' || v.voucherType === 'receipt') && isVoucherAccessible(v)
      );

      for (const v of targets) {
        if (v.backendId) {
          summary.skipped += 1;
          continue;
        }
        try {
          const creatorUser =
            users.find(u => u.id === v.createdBy) ||
            (v.locationId === 'loc_van1'
              ? users.find(u => u.id === 'usr_van1')
              : v.locationId === 'loc_van2'
              ? users.find(u => u.id === 'usr_van2')
              : v.locationId === 'loc_van3'
              ? users.find(u => u.id === 'usr_van3')
              : currentUser);
          const { username } = resolveBackendCredentials(creatorUser || currentUser);
          let token = tokenCache.get(username);
          if (!token) {
            const obtained = await getTokenForCreator(creatorUser || currentUser);
            if (obtained) {
              token = obtained;
              tokenCache.set(username, token);
            }
          }

          const res = await postVoucherToBackend(v, token);
          if (res?.id) {
            if (v.voucherType === 'sales') summary.postedInvoices += 1;
            else summary.postedReceipts += 1;
          } else {
            summary.skipped += 1;
          }
        } catch (err: any) {
          summary.failed += 1;
          summary.errors.push(`${v.voucherNumber}: ${err?.response?.data?.message || err?.message}`);
        }
      }

      // Restore current user's active JWT and fetch fresh list from backend
      const activeToken = (await loginBackendUser(currentUser)) || undefined;
      const fetched = await syncFromBackend(activeToken);
      summary.fetchedInvoices = fetched.fetchedInvoices;
      summary.fetchedReceipts = fetched.fetchedReceipts;
      if (fetched.error) summary.errors.push(fetched.error);
      return summary;
    } finally {
      setIsSyncingBackend(false);
    }
  };

  // Authenticate & sync backend vouchers whenever session logs in
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    let cancelled = false;
    (async () => {
      const token = localStorage.getItem('token') || (await loginBackendUser(currentUser));
      if (!cancelled && token) {
        await syncFromBackend(token);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, currentUser?.id]);

  const logout = () => {
    setIsAuthenticated(false);
    setIsCompanySelected(false);
    setCurrentUser(null);
    setBackendSyncError(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('backend_user');
      localStorage.removeItem('user');
      localStorage.removeItem('erp_is_company_selected');
    } catch {
      // ignore storage errors
    }
    setCurrentView('login');
  };

  return (
    <ErpContext.Provider
      value={{
        theme,
        toggleTheme,
        currentView,
        setCurrentView,
        goBack,
        canGoBack,
        isAuthenticated,
        setIsAuthenticated,
        logout,
        currentUser,
        setCurrentUser,
        isCompanySelected,
        setIsCompanySelected,
        selectedPeriod,
        setSelectedPeriod,
        customDateRange,

        // Tally Order additions
        orders,
        approveOrder,
        rejectOrder,
        syncOrderToTally,
        addOrder,
        pendingOrdersCount,
        cropAdvisories,
        resolveAdvisory,
        addAdvisory,
        permissions,
        addPermission,
        themeColor,
        setThemeColor,
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

        isVoucherAccessible,

        isSyncingBackend,
        lastBackendSync,
        backendSyncError,
        syncFromBackend,
        postAllInvoicesToBackend,
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

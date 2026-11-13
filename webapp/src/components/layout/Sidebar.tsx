import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { LogoMark } from '../common/LogoMark';
import {
  LayoutDashboard,
  FileCheck,
  Sprout,
  Server,
  Palette,
  ShieldCheck,
  FolderTree,
  ShoppingCart,
  ShoppingBag,
  FileSpreadsheet,
  Boxes,
  Truck,
  BookOpen,
  PieChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Users,
  Building,
  CreditCard,
  Layers,
  ArrowRightLeft,
  FileText,
  Clock,
  MapPin,
  Tag,
  UserCheck,
  Zap,
  TrendingUp,
  Receipt,
  Radio,
} from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  view?: string;
  badge?: number | string;
  subItems?: Array<{
    id: string;
    label: string;
    view: string;
    icon?: React.ReactNode;
    badge?: number | string;
  }>;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, openVoucherModal, pendingOrdersCount, themeColor, currentUser } = useErp();

  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    orders_billing: true,
    sales: true,
    chart_of_accounts: false,
    purchase: false,
    vouchers: false,
    inventory: false,
    fleet: false,
    accountant: false,
    final_accounts: false,
    settings: false,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const navSections: NavSection[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      view: 'dashboard',
    },
    {
      id: 'orders_billing',
      label: 'Orders & Billing',
      icon: <FileCheck className="w-4 h-4" />,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      subItems: [
        {
          id: 'ord_mgmt',
          label: 'Order Approval Queue',
          view: 'orders_billing',
          icon: <FileCheck className="w-3.5 h-3.5" />,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
        },
        {
          id: 'ord_adv',
          label: 'Field Support Desk',
          view: 'crop_advisory',
          icon: <Sprout className="w-3.5 h-3.5" />,
        },
        {
          id: 'ord_tally',
          label: 'Tally Sync Center',
          view: 'tally_sync',
          icon: <Server className="w-3.5 h-3.5" />,
        },
      ],
    },
    {
      id: 'chart_of_accounts',
      label: 'Chart of Accounts',
      icon: <FolderTree className="w-4 h-4" />,
      subItems: [
        { id: 'coa_cust', label: 'Customers', view: 'customers', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'coa_vend', label: 'Suppliers', view: 'suppliers', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'coa_ledg', label: 'General Ledgers', view: 'chart_of_accounts', icon: <Layers className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: <ShoppingCart className="w-4 h-4" />,
      subItems: [
        { id: 'sales_cust', label: 'Customers Master', view: 'customers', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'sales_so', label: 'Sales Orders', view: 'sales_order', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'sales_inv', label: 'Sales Invoices', view: 'sales', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'sales_ret', label: 'Credit Notes', view: 'sales_return', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'sales_pay', label: 'Collect Payment', view: 'collect_payment', icon: <Receipt className="w-3.5 h-3.5" /> },
        { id: 'sales_stmt', label: 'Customer Statement', view: 'customer_statement', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'sales_out', label: 'Customer Outstandings', view: 'customer_outstandings', icon: <Clock className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'purchase',
      label: 'Purchase',
      icon: <ShoppingBag className="w-4 h-4" />,
      subItems: [
        { id: 'pur_supp', label: 'Suppliers Master', view: 'suppliers', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'pur_po', label: 'Purchase Orders', view: 'purchase_order', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'pur_bill', label: 'Purchase Bills', view: 'purchase', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'pur_ret', label: 'Debit Notes', view: 'purchase_return', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'pur_pay', label: 'Make Payment', view: 'make_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
        { id: 'pur_stmt', label: 'Supplier Statement', view: 'supplier_statement', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'pur_out', label: 'Supplier Outstandings', view: 'supplier_outstandings', icon: <Clock className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'vouchers',
      label: 'Vouchers',
      icon: <Receipt className="w-4 h-4" />,
      subItems: [
        { id: 'v_hub', label: 'Vouchers Hub', view: 'vouchers_hub', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'v_contra', label: 'Contra Entries', view: 'vouchers_hub', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'v_journal', label: 'Journal Entries', view: 'vouchers_hub', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'v_receipt', label: 'Receipt Vouchers', view: 'collect_payment', icon: <Receipt className="w-3.5 h-3.5" /> },
        { id: 'v_payment', label: 'Payment Vouchers', view: 'make_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-4 h-4" />,
      subItems: [
        { id: 'inv_items', label: 'Items Master', view: 'items', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'inv_grp', label: 'Item Groups', view: 'item_groups', icon: <Boxes className="w-3.5 h-3.5" /> },
        { id: 'inv_cat', label: 'Categories', view: 'item_categories', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'inv_units', label: 'Units of Measure', view: 'units', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'inv_price', label: 'Price Lists', view: 'price_list', icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { id: 'inv_godown', label: 'Godowns & Vans', view: 'godowns', icon: <MapPin className="w-3.5 h-3.5" /> },
        { id: 'inv_stock_sum', label: 'Stock Summary', view: 'stock_summary', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'inv_godown_sum', label: 'Van Stock Summary', view: 'godown_summary', icon: <Truck className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'fleet',
      label: 'Fleet Management',
      icon: <Truck className="w-4 h-4" />,
      subItems: [
        { id: 'flt_live', label: 'Live Fleet GPS', view: 'live_tracking', icon: <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> },
        { id: 'flt_master', label: 'Vehicles Master', view: 'fleet_master', icon: <Truck className="w-3.5 h-3.5" /> },
        { id: 'flt_driver', label: 'Drivers & Reps', view: 'salesman_driver', icon: <UserCheck className="w-3.5 h-3.5" /> },
        { id: 'flt_report', label: 'Fleet Performance', view: 'fleet_wise_report', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'accountant',
      label: 'Accounting Reports',
      icon: <BookOpen className="w-4 h-4" />,
      subItems: [
        { id: 'acct_daybook', label: 'Daybook', view: 'daybook', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { id: 'acct_stmt', label: 'Ledger Statements', view: 'ledger_statements', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'acct_out', label: 'Ledger Outstandings', view: 'ledger_outstandings', icon: <Clock className="w-3.5 h-3.5" /> },
        { id: 'acct_reg', label: 'Voucher Register', view: 'voucher_register', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'final_accounts',
      label: 'Final Accounts',
      icon: <PieChart className="w-4 h-4" />,
      subItems: [
        { id: 'fa_tb', label: 'Trial Balance', view: 'trial_balance', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'fa_bs', label: 'Balance Sheet', view: 'balance_sheet', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'fa_pl', label: 'Profit & Loss', view: 'profit_loss', icon: <TrendingUp className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      subItems: [
        { id: 'set_profile', label: 'Company Profile', view: 'company_profile', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'set_tax', label: 'Tax Details', view: 'tax_details', icon: <Receipt className="w-3.5 h-3.5" /> },
        { id: 'set_users', label: 'Users & Roles', view: 'users_permissions', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'set_theme', label: 'Theme & Branding', view: 'theme_settings', icon: <Palette className="w-3.5 h-3.5" /> },
        { id: 'set_perm', label: 'Role Permissions', view: 'permissions_registry', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
        ...(currentUser?.role === 'admin' ? [{ id: 'set_api', label: 'Mobile Sync API', view: 'developer_api', icon: <Zap className="w-3.5 h-3.5" /> }] : []),
        { id: 'set_about', label: 'System Overview', view: 'about', icon: <FileText className="w-3.5 h-3.5" /> },
      ],
    },
  ];

  // Role-based navigation filtering
  const filteredNavSections: NavSection[] = useMemo(() => {
    const role = currentUser?.role || 'admin';

    if (role === 'admin') {
      return navSections;
    }

    if (role === 'salesman_pos') {
      return [
        navSections.find(s => s.id === 'dashboard')!,
        {
          id: 'orders_billing',
          label: 'Orders & Support',
          icon: <FileCheck className="w-4 h-4" />,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          subItems: [
            {
              id: 'ord_mgmt',
              label: 'My Orders Queue',
              view: 'orders_billing',
              icon: <FileCheck className="w-3.5 h-3.5" />,
              badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
            },
            {
              id: 'ord_adv',
              label: 'Field Support Desk',
              view: 'crop_advisory',
              icon: <Sprout className="w-3.5 h-3.5" />,
            },
          ],
        },
        navSections.find(s => s.id === 'sales')!,
        {
          id: 'inventory',
          label: 'Van Stock & Items',
          icon: <Boxes className="w-4 h-4" />,
          subItems: [
            { id: 'inv_items', label: 'Items Master', view: 'items', icon: <Tag className="w-3.5 h-3.5" /> },
            { id: 'inv_godown_sum', label: 'Van Stock Summary', view: 'godown_summary', icon: <Truck className="w-3.5 h-3.5" /> },
          ],
        },
        {
          id: 'fleet',
          label: 'Fleet & GPS',
          icon: <Truck className="w-4 h-4" />,
          subItems: [
            { id: 'flt_live', label: 'Live Fleet GPS', view: 'live_tracking', icon: <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> },
          ],
        },
      ].filter(Boolean) as NavSection[];
    }

    if (role === 'accountant') {
      return navSections.filter(s =>
        ['dashboard', 'orders_billing', 'chart_of_accounts', 'sales', 'purchase', 'vouchers', 'accountant', 'final_accounts'].includes(s.id)
      );
    }

    if (role === 'warehouse_manager') {
      return navSections.filter(s =>
        ['dashboard', 'orders_billing', 'inventory', 'fleet', 'purchase'].includes(s.id)
      );
    }

    return navSections;
  }, [currentUser, pendingOrdersCount]);

  return (
    <aside className="w-64 bg-white dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 flex flex-col shrink-0 border-r border-slate-200 dark:border-slate-800/80 select-none shadow-xs dark:shadow-[0_0_25px_rgba(0,0,0,0.3)] transition-colors duration-200">
      {/* Talliffy Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 transition-colors">
        <div className="flex items-center gap-3">
          <LogoMark size="sm" />
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Talli<span className="text-blue-600 dark:text-blue-500">ffy</span>
            </span>
            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-wide uppercase mt-1">
              Van Sales ERP
            </span>
          </div>
        </div>
      </div>

      {/* Quick Voucher Button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={() => openVoucherModal({ initialType: 'sales' })}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-white rounded-xl shadow-sm transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
          style={{ backgroundColor: themeColor }}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Sales Invoice</span>
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {filteredNavSections.map(section => {
          const hasChildren = section.subItems && section.subItems.length > 0;
          const isExpanded = expandedGroups[section.id];
          const isCurrentActive = section.view === currentView;
          const hasActiveChild = section.subItems?.some(sub => sub.view === currentView);

          return (
            <div key={section.id} className="space-y-0.5">
              {/* Group Header / Primary Item */}
              <button
                onClick={() => {
                  if (hasChildren) {
                    toggleGroup(section.id);
                  } else if (section.view) {
                    setCurrentView(section.view);
                  }
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-xl transition-all duration-150 text-left ${
                  isCurrentActive
                    ? 'text-white font-bold shadow-xs'
                    : hasActiveChild
                    ? 'text-blue-900 dark:text-white bg-blue-50 dark:bg-slate-800/80 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
                }`}
                style={isCurrentActive ? { backgroundColor: themeColor } : {}}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`${isCurrentActive ? 'text-white' : hasActiveChild ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    {section.icon}
                  </span>
                  <span className="tracking-tight truncate">{section.label}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {section.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white animate-pulse">
                      {section.badge}
                    </span>
                  )}
                  {hasChildren && (
                    <span className="text-slate-400 dark:text-slate-500">
                      {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  )}
                </div>
              </button>

              {/* Collapsible Subitems */}
              {hasChildren && isExpanded && (
                <div className="pl-5 pr-1 py-1 space-y-0.5 border-l border-slate-200 dark:border-slate-800/80 ml-4 my-0.5">
                  {section.subItems?.map(sub => {
                    const isSubActive = currentView === sub.view;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setCurrentView(sub.view)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11.5px] rounded-lg transition-all text-left ${
                          isSubActive
                            ? 'text-white font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/40'
                        }`}
                        style={isSubActive ? { backgroundColor: themeColor } : {}}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {sub.icon && <span className={isSubActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>{sub.icon}</span>}
                          <span className="truncate">{sub.label}</span>
                        </div>
                        {sub.badge !== undefined && (
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${isSubActive ? 'bg-white text-slate-900' : 'bg-amber-500 text-white'}`}>
                            {sub.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Talliffy System Status Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/60 space-y-1.5 transition-colors">
        <div className="flex items-center justify-between text-[10px] text-blue-700 dark:text-blue-400 font-mono bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900/40">
          <span>TALLIFFY CLOUD SYNC</span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400 animate-ping" />
        </div>
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[10px] px-0.5">
          <span>Enterprise v2.4</span>
          <button
            onClick={() => setCurrentView('about')}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            TallyPrime Gateway
          </button>
        </div>
      </div>
    </aside>
  );
};

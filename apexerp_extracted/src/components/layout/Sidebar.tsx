import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  LayoutDashboard,
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
  FileCheck,
} from 'lucide-react';

interface NavSection {
  id: string;
  label: string;
  icon: React.ReactNode;
  view?: string;
  subItems?: Array<{
    id: string;
    label: string;
    view: string;
    icon?: React.ReactNode;
  }>;
}

export const Sidebar: React.FC = () => {
  const { currentView, setCurrentView, openVoucherModal } = useErp();

  // Keep track of which groups are expanded
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    chart_of_accounts: false,
    sales: true,
    purchase: false,
    vouchers: false,
    inventory: true,
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
      id: 'chart_of_accounts',
      label: 'Chart of Accounts',
      icon: <FolderTree className="w-4 h-4" />,
      subItems: [
        { id: 'coa_cust', label: 'Customers', view: 'customers', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'coa_vend', label: 'Vendors / Suppliers', view: 'suppliers', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'coa_ledg', label: 'All General Ledgers', view: 'chart_of_accounts', icon: <Layers className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: <ShoppingCart className="w-4 h-4" />,
      subItems: [
        { id: 'sales_cust', label: 'Customers Master', view: 'customers', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'sales_so', label: 'Sales Orders', view: 'sales_order', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
        { id: 'sales_inv', label: 'Sales / Invoices & POS', view: 'sales', icon: <FileText className="w-3.5 h-3.5" /> },
        { id: 'sales_ret', label: 'Sales Return / Credit Note', view: 'sales_return', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'sales_pay', label: 'Collect Payment', view: 'collect_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
        { id: 'sales_stmt', label: 'Customer Statement', view: 'customer_statement', icon: <BookOpen className="w-3.5 h-3.5" /> },
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
        { id: 'pur_ret', label: 'Purchase Return / Debit Note', view: 'purchase_return', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'pur_pay', label: 'Make Payment', view: 'make_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
        { id: 'pur_stmt', label: 'Supplier Statement', view: 'supplier_statement', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { id: 'pur_out', label: 'Supplier Outstandings', view: 'supplier_outstandings', icon: <Clock className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'vouchers',
      label: 'Vouchers',
      icon: <Receipt className="w-4 h-4" />,
      view: 'vouchers_hub',
      subItems: [
        { id: 'v_hub', label: 'Vouchers Hub (All 10)', view: 'vouchers_hub', icon: <FileCheck className="w-3.5 h-3.5" /> },
        { id: 'v_contra', label: 'Contra (Cash/Bank)', view: 'vouchers_hub', icon: <ArrowRightLeft className="w-3.5 h-3.5" /> },
        { id: 'v_journal', label: 'Journal Entry', view: 'vouchers_hub', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { id: 'v_receipt', label: 'Receipt Voucher', view: 'collect_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
        { id: 'v_payment', label: 'Payment Voucher', view: 'make_payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: <Boxes className="w-4 h-4" />,
      subItems: [
        { id: 'inv_items', label: 'Items Master', view: 'items', icon: <Boxes className="w-3.5 h-3.5" /> },
        { id: 'inv_grp', label: 'Item Groups', view: 'item_groups', icon: <Layers className="w-3.5 h-3.5" /> },
        { id: 'inv_cat', label: 'Categories', view: 'item_categories', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'inv_units', label: 'Units of Measure', view: 'units', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'inv_price', label: 'Price List (Effective Date)', view: 'price_list', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'inv_godown', label: 'Godown / Location (Van/Depot)', view: 'godowns', icon: <MapPin className="w-3.5 h-3.5" /> },
        { id: 'inv_stock_sum', label: 'Stock Summary (Tally Movement)', view: 'stock_summary', icon: <TrendingUp className="w-3.5 h-3.5" /> },
        { id: 'inv_godown_sum', label: 'Godown / Van Summary', view: 'godown_summary', icon: <MapPin className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'fleet',
      label: 'Fleet Management',
      icon: <Truck className="w-4 h-4" />,
      subItems: [
        { id: 'flt_master', label: 'Fleet Master (Vehicles)', view: 'fleet_master', icon: <Truck className="w-3.5 h-3.5" /> },
        { id: 'flt_driver', label: 'Salesman / Driver Master', view: 'salesman_driver', icon: <UserCheck className="w-3.5 h-3.5" /> },
        { id: 'flt_report', label: 'Fleet Wise Report (Card Style)', view: 'fleet_wise_report', icon: <Zap className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'accountant',
      label: 'Accountant',
      icon: <BookOpen className="w-4 h-4" />,
      subItems: [
        { id: 'acct_daybook', label: 'Daybook (All Vouchers)', view: 'daybook', icon: <Clock className="w-3.5 h-3.5" /> },
        { id: 'acct_stmt', label: 'Ledger Statements', view: 'ledger_statements', icon: <BookOpen className="w-3.5 h-3.5" /> },
        { id: 'acct_out', label: 'Ledger Outstandings', view: 'ledger_outstandings', icon: <Clock className="w-3.5 h-3.5" /> },
        { id: 'acct_reg', label: 'Voucher Register', view: 'voucher_register', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'final_accounts',
      label: 'Final Accounts',
      icon: <PieChart className="w-4 h-4" />,
      subItems: [
        { id: 'fa_tb', label: 'Trial Balance', view: 'trial_balance', icon: <FileCheck className="w-3.5 h-3.5" /> },
        { id: 'fa_bs', label: 'Balance Sheet', view: 'balance_sheet', icon: <PieChart className="w-3.5 h-3.5" /> },
        { id: 'fa_pl', label: 'Profit & Loss Account', view: 'profit_loss', icon: <TrendingUp className="w-3.5 h-3.5" /> },
      ],
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      subItems: [
        { id: 'set_profile', label: 'Company Profile Alteration', view: 'company_profile', icon: <Building className="w-3.5 h-3.5" /> },
        { id: 'set_tax', label: 'Tax Details', view: 'tax_details', icon: <Tag className="w-3.5 h-3.5" /> },
        { id: 'set_users', label: 'Users & Permissions', view: 'users_permissions', icon: <Users className="w-3.5 h-3.5" /> },
        { id: 'set_api', label: 'Developer Mobile API', view: 'developer_api', icon: <Zap className="w-3.5 h-3.5" /> },
        { id: 'set_about', label: 'About & VPS Architecture', view: 'about', icon: <FileText className="w-3.5 h-3.5" /> },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 select-none">
      {/* Brand & Workspace */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            AP
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-tight leading-none">ApexERP</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-0.5">POS & VAN DISTRIBUTION</span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {navSections.map(section => {
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
                className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-colors ${
                  isCurrentActive || hasActiveChild
                    ? 'text-white bg-slate-800/90 shadow-2xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`${isCurrentActive || hasActiveChild ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {section.icon}
                  </span>
                  <span className="tracking-tight">{section.label}</span>
                </div>
                {hasChildren && (
                  <span className="text-slate-500">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                )}
              </button>

              {/* Collapsible Subitems */}
              {hasChildren && isExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l border-slate-800 ml-4 my-0.5">
                  {section.subItems?.map(sub => {
                    const isSubActive = currentView === sub.view;
                    return (
                      <button
                        key={sub.id}
                        onClick={() => setCurrentView(sub.view)}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 text-[11.5px] rounded-md transition-colors text-left ${
                          isSubActive
                            ? 'text-indigo-300 font-semibold bg-indigo-950/40'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSubActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                        <span className="truncate">{sub.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Quick Help & Double-Entry Invariant Badge */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 text-[11px] text-slate-400 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
          <span>DEBIT = CREDIT STRICT</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="flex items-center justify-between text-slate-500 text-[10px]">
          <span>Single-Tenant VPS v2.4</span>
          <button
            onClick={() => setCurrentView('about')}
            className="hover:text-slate-300 underline"
          >
            Docs
          </button>
        </div>
      </div>
    </aside>
  );
};

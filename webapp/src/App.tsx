import React, { Suspense, lazy } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/auth/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { SignupPage } from './components/auth/SignupPage';
import { CompanySelector } from './components/auth/CompanySelector';
import { VoucherModal } from './components/vouchers/VoucherModal';
import { InvoiceViewModal } from './components/vouchers/InvoiceViewModal';
import { ShieldAlert } from 'lucide-react';

function lazyNamed<T extends Record<string, any>>(
  loader: () => Promise<T>,
  exportName: keyof T
) {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as React.ComponentType<any> };
  });
}

const DashboardView = lazyNamed(() => import('./components/dashboard/DashboardView'), 'DashboardView');
const ChartOfAccountsView = lazyNamed(() => import('./components/coa/ChartOfAccountsView'), 'ChartOfAccountsView');

// Tally Order Admin Portal Views
const OrdersBillingView = lazyNamed(() => import('./components/orders/OrdersBillingView'), 'OrdersBillingView');
const CropAdvisoryDeskView = lazyNamed(() => import('./components/advisory/CropAdvisoryDeskView'), 'CropAdvisoryDeskView');
const ThemeSettingsView = lazyNamed(() => import('./components/settings/ThemeSettingsView'), 'ThemeSettingsView');
const PermissionsRegistryView = lazyNamed(() => import('./components/settings/PermissionsRegistryView'), 'PermissionsRegistryView');
const TallySyncCenterView = lazyNamed(() => import('./components/tally/TallySyncCenterView'), 'TallySyncCenterView');

// Sales Views
const CustomersView = lazyNamed(() => import('./components/sales/CustomersView'), 'CustomersView');
const SalesOrdersView = lazyNamed(() => import('./components/sales/SalesOrdersView'), 'SalesOrdersView');
const SalesInvoicesView = lazyNamed(() => import('./components/sales/SalesInvoicesView'), 'SalesInvoicesView');
const CreditNotesView = lazyNamed(() => import('./components/sales/CreditNotesView'), 'CreditNotesView');
const CollectPaymentView = lazyNamed(() => import('./components/sales/CollectPaymentView'), 'CollectPaymentView');
const CustomerStatementView = lazyNamed(() => import('./components/sales/CustomerStatementView'), 'CustomerStatementView');
const CustomerOutstandingsView = lazyNamed(() => import('./components/sales/CustomerOutstandingsView'), 'CustomerOutstandingsView');

// Purchase Views
const SuppliersView = lazyNamed(() => import('./components/purchase/SuppliersView'), 'SuppliersView');
const PurchaseOrdersView = lazyNamed(() => import('./components/purchase/PurchaseOrdersView'), 'PurchaseOrdersView');
const PurchaseBillsView = lazyNamed(() => import('./components/purchase/PurchaseBillsView'), 'PurchaseBillsView');
const DebitNotesView = lazyNamed(() => import('./components/purchase/DebitNotesView'), 'DebitNotesView');
const MakePaymentView = lazyNamed(() => import('./components/purchase/MakePaymentView'), 'MakePaymentView');
const SupplierStatementView = lazyNamed(() => import('./components/purchase/SupplierStatementView'), 'SupplierStatementView');
const SupplierOutstandingsView = lazyNamed(() => import('./components/purchase/SupplierOutstandingsView'), 'SupplierOutstandingsView');

// Vouchers Hub
const VouchersHubView = lazyNamed(() => import('./components/vouchers/VouchersHubView'), 'VouchersHubView');

// Inventory Views
const ItemsView = lazyNamed(() => import('./components/inventory/ItemsView'), 'ItemsView');
const InventoryMastersView = lazyNamed(() => import('./components/inventory/InventoryMastersView'), 'InventoryMastersView');
const PriceListView = lazyNamed(() => import('./components/inventory/PriceListView'), 'PriceListView');
const GodownLocationView = lazyNamed(() => import('./components/inventory/GodownLocationView'), 'GodownLocationView');
const StockSummaryView = lazyNamed(() => import('./components/inventory/StockSummaryView'), 'StockSummaryView');
const GodownSummaryView = lazyNamed(() => import('./components/inventory/GodownSummaryView'), 'GodownSummaryView');

// Fleet Views
const FleetMasterView = lazyNamed(() => import('./components/fleet/FleetMasterView'), 'FleetMasterView');
const SalesmanDriverView = lazyNamed(() => import('./components/fleet/SalesmanDriverView'), 'SalesmanDriverView');
const FleetWiseReportView = lazyNamed(() => import('./components/fleet/FleetWiseReportView'), 'FleetWiseReportView');
const GoogleMapLiveTracker = lazyNamed(() => import('./components/dashboard/GoogleMapLiveTracker'), 'GoogleMapLiveTracker');

// Accountant Views
const DaybookView = lazyNamed(() => import('./components/accountant/DaybookView'), 'DaybookView');
const LedgerStatementsView = lazyNamed(() => import('./components/accountant/LedgerStatementsView'), 'LedgerStatementsView');
const LedgerOutstandingsView = lazyNamed(() => import('./components/accountant/LedgerOutstandingsView'), 'LedgerOutstandingsView');
const VoucherRegisterView = lazyNamed(() => import('./components/accountant/VoucherRegisterView'), 'VoucherRegisterView');

// Final Accounts Views
const TrialBalanceView = lazyNamed(() => import('./components/finalaccounts/TrialBalanceView'), 'TrialBalanceView');
const BalanceSheetView = lazyNamed(() => import('./components/finalaccounts/BalanceSheetView'), 'BalanceSheetView');
const ProfitLossView = lazyNamed(() => import('./components/finalaccounts/ProfitLossView'), 'ProfitLossView');

// Settings Views
const CompanyProfileView = lazyNamed(() => import('./components/settings/CompanyProfileView'), 'CompanyProfileView');
const TaxDetailsView = lazyNamed(() => import('./components/settings/TaxDetailsView'), 'TaxDetailsView');
const UsersPermissionsView = lazyNamed(() => import('./components/settings/UsersPermissionsView'), 'UsersPermissionsView');
const DeveloperApiView = lazyNamed(() => import('./components/settings/DeveloperApiView'), 'DeveloperApiView');
const AboutPageView = lazyNamed(() => import('./components/settings/AboutPageView'), 'AboutPageView');

const ErpAppMain: React.FC = () => {
  const { currentView, setCurrentView, isAuthenticated, isCompanySelected, currentUser } = useErp();

  // Step 1: Landing Page
  if (currentView === 'landing' && !isAuthenticated) {
    return <LandingPage />;
  }

  // Step 2: Sign Up Page
  if (currentView === 'signup' && !isAuthenticated) {
    return <SignupPage />;
  }

  // Step 3: Sign In Page
  if (currentView === 'login' || (!isAuthenticated && currentView !== 'landing' && currentView !== 'signup')) {
    return <LoginPage />;
  }

  // Step 3: Company Selection
  if (!isCompanySelected || currentView === 'select_company') {
    return <CompanySelector />;
  }

  // Step 4: Full Enterprise Portal Layout
  const renderCurrentView = () => {
    // Role-based view authorization guard for Van Sales Reps
    if (currentUser?.role === 'salesman_pos') {
      const allowedViews = [
        'dashboard',
        'orders_billing',
        'crop_advisory',
        'customers',
        'sales_order',
        'sales',
        'sales_return',
        'collect_payment',
        'customer_statement',
        'customer_outstandings',
        'items',
        'godown_summary',
        'live_tracking',
        'about',
      ];
      if (!allowedViews.includes(currentView)) {
        return (
          <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Module Access Restricted</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              This module requires Administrator or Financial Accountant privilege. Your current logged-in role is <strong>Van Sales POS ({currentUser.name})</strong>.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
              >
                Return to Van Dashboard
              </button>
            </div>
          </div>
        );
      }
    }

    switch (currentView) {
      // Dashboard
      case 'dashboard':
        return <DashboardView />;

      // Tally Order Admin Portal Views
      case 'orders_billing':
        return <OrdersBillingView />;
      case 'crop_advisory':
        return <CropAdvisoryDeskView />;
      case 'theme_settings':
        return <ThemeSettingsView />;
      case 'permissions_registry':
        return <PermissionsRegistryView />;
      case 'tally_sync':
        return <TallySyncCenterView />;

      // Chart of Accounts
      case 'chart_of_accounts':
        return <ChartOfAccountsView />;

      // Sales
      case 'customers':
        return <CustomersView />;
      case 'sales_order':
        return <SalesOrdersView />;
      case 'sales':
        return <SalesInvoicesView />;
      case 'sales_return':
        return <CreditNotesView />;
      case 'collect_payment':
        return <CollectPaymentView />;
      case 'customer_statement':
        return <CustomerStatementView />;
      case 'customer_outstandings':
        return <CustomerOutstandingsView />;

      // Purchase
      case 'suppliers':
        return <SuppliersView />;
      case 'purchase_order':
        return <PurchaseOrdersView />;
      case 'purchase':
        return <PurchaseBillsView />;
      case 'purchase_return':
        return <DebitNotesView />;
      case 'make_payment':
        return <MakePaymentView />;
      case 'supplier_statement':
        return <SupplierStatementView />;
      case 'supplier_outstandings':
        return <SupplierOutstandingsView />;

      // Vouchers Hub
      case 'vouchers_hub':
        return <VouchersHubView />;

      // Inventory
      case 'items':
        return <ItemsView />;
      case 'item_groups':
        return <InventoryMastersView activeTab="groups" />;
      case 'item_categories':
        return <InventoryMastersView activeTab="categories" />;
      case 'units':
        return <InventoryMastersView activeTab="units" />;
      case 'price_list':
        return <PriceListView />;
      case 'godowns':
        return <GodownLocationView />;
      case 'stock_summary':
        return <StockSummaryView />;
      case 'godown_summary':
        return <GodownSummaryView />;

      // Fleet
      case 'live_tracking':
        return (
          <div className="p-6 space-y-4 max-w-7xl mx-auto">
            <GoogleMapLiveTracker />
          </div>
        );
      case 'fleet_master':
        return <FleetMasterView />;
      case 'salesman_driver':
        return <SalesmanDriverView />;
      case 'fleet_wise_report':
        return <FleetWiseReportView />;

      // Accountant
      case 'daybook':
        return <DaybookView />;
      case 'ledger_statements':
        return <LedgerStatementsView />;
      case 'ledger_outstandings':
        return <LedgerOutstandingsView />;
      case 'voucher_register':
        return <VoucherRegisterView />;

      // Final Accounts
      case 'trial_balance':
        return <TrialBalanceView />;
      case 'balance_sheet':
        return <BalanceSheetView />;
      case 'profit_loss':
        return <ProfitLossView />;

      // Settings
      case 'company_profile':
        return <CompanyProfileView />;
      case 'tax_details':
        return <TaxDetailsView />;
      case 'users_permissions':
        return <UsersPermissionsView />;
      case 'developer_api':
        if (currentUser?.role !== 'admin') {
          return (
            <div className="p-8 max-w-xl mx-auto my-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Privileges Required</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Mobile Sync API credentials and integration endpoints are strictly restricted to <strong>System Administrators</strong>.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          );
        }
        return <DeveloperApiView />;
      case 'about':
        return <AboutPageView />;

      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64 text-xs font-medium text-slate-500 dark:text-slate-400">
                Loading workspace module...
              </div>
            }
          >
            {renderCurrentView()}
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      <VoucherModal />
      <InvoiceViewModal />
    </div>
  );
};

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error?.message || 'Unexpected rendering error' };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-4">
            <h2 className="text-lg font-bold">Unable to display workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{this.state.message}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.hash = '#/login';
                  window.location.reload();
                }}
                className="px-4 py-2 text-xs font-semibold border border-slate-300 dark:border-slate-700 rounded-xl"
              >
                Reset Session &amp; Sign In
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ErpProvider>
        <ErpAppMain />
      </ErpProvider>
    </AppErrorBoundary>
  );
}

export { App };

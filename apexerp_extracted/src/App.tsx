import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/auth/LandingPage';
import { LoginPage } from './components/auth/LoginPage';
import { CompanySelector } from './components/auth/CompanySelector';
import { DashboardView } from './components/dashboard/DashboardView';
import { VoucherModal } from './components/vouchers/VoucherModal';
import { InvoiceViewModal } from './components/vouchers/InvoiceViewModal';
import { ChartOfAccountsView } from './components/coa/ChartOfAccountsView';

// Sales Views
import { CustomersView } from './components/sales/CustomersView';
import { SalesOrdersView } from './components/sales/SalesOrdersView';
import { SalesInvoicesView } from './components/sales/SalesInvoicesView';
import { CreditNotesView } from './components/sales/CreditNotesView';
import { CollectPaymentView } from './components/sales/CollectPaymentView';
import { CustomerStatementView } from './components/sales/CustomerStatementView';
import { CustomerOutstandingsView } from './components/sales/CustomerOutstandingsView';

// Purchase Views
import { SuppliersView } from './components/purchase/SuppliersView';
import { PurchaseOrdersView } from './components/purchase/PurchaseOrdersView';
import { PurchaseBillsView } from './components/purchase/PurchaseBillsView';
import { DebitNotesView } from './components/purchase/DebitNotesView';
import { MakePaymentView } from './components/purchase/MakePaymentView';
import { SupplierStatementView } from './components/purchase/SupplierStatementView';
import { SupplierOutstandingsView } from './components/purchase/SupplierOutstandingsView';

// Vouchers Hub
import { VouchersHubView } from './components/vouchers/VouchersHubView';

// Inventory Views
import { ItemsView } from './components/inventory/ItemsView';
import { InventoryMastersView } from './components/inventory/InventoryMastersView';
import { PriceListView } from './components/inventory/PriceListView';
import { GodownLocationView } from './components/inventory/GodownLocationView';
import { StockSummaryView } from './components/inventory/StockSummaryView';
import { GodownSummaryView } from './components/inventory/GodownSummaryView';

// Fleet Views
import { FleetMasterView } from './components/fleet/FleetMasterView';
import { SalesmanDriverView } from './components/fleet/SalesmanDriverView';
import { FleetWiseReportView } from './components/fleet/FleetWiseReportView';

// Accountant Views
import { DaybookView } from './components/accountant/DaybookView';
import { LedgerStatementsView } from './components/accountant/LedgerStatementsView';
import { LedgerOutstandingsView } from './components/accountant/LedgerOutstandingsView';
import { VoucherRegisterView } from './components/accountant/VoucherRegisterView';

// Final Accounts Views
import { TrialBalanceView } from './components/finalaccounts/TrialBalanceView';
import { BalanceSheetView } from './components/finalaccounts/BalanceSheetView';
import { ProfitLossView } from './components/finalaccounts/ProfitLossView';

// Settings Views
import { CompanyProfileView } from './components/settings/CompanyProfileView';
import { TaxDetailsView } from './components/settings/TaxDetailsView';
import { UsersPermissionsView } from './components/settings/UsersPermissionsView';
import { DeveloperApiView } from './components/settings/DeveloperApiView';
import { AboutPageView } from './components/settings/AboutPageView';

const ErpAppMain: React.FC = () => {
  const { currentView, isAuthenticated, isCompanySelected } = useErp();

  // Step 1: Landing Page
  if (currentView === 'landing' && !isAuthenticated) {
    return <LandingPage />;
  }

  // Step 2: Sign In Page
  if (currentView === 'login' || (!isAuthenticated && currentView !== 'landing')) {
    return <LoginPage />;
  }

  // Step 3: Company Selection (Single company support)
  if (!isCompanySelected || currentView === 'select_company') {
    return <CompanySelector />;
  }

  // Step 4: Full Production ERP Portal with Zoho Books Layout
  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'chart_of_accounts':
        return <ChartOfAccountsView />;
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
      case 'vouchers_hub':
        return <VouchersHubView />;
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
      case 'fleet_master':
        return <FleetMasterView />;
      case 'salesman_driver':
        return <SalesmanDriverView />;
      case 'fleet_wise_report':
        return <FleetWiseReportView />;
      case 'daybook':
        return <DaybookView />;
      case 'ledger_statements':
        return <LedgerStatementsView />;
      case 'ledger_outstandings':
        return <LedgerOutstandingsView />;
      case 'voucher_register':
        return <VoucherRegisterView />;
      case 'trial_balance':
        return <TrialBalanceView />;
      case 'balance_sheet':
        return <BalanceSheetView />;
      case 'profit_loss':
        return <ProfitLossView />;
      case 'company_profile':
        return <CompanyProfileView />;
      case 'tax_details':
        return <TaxDetailsView />;
      case 'users_permissions':
        return <UsersPermissionsView />;
      case 'developer_api':
        return <DeveloperApiView />;
      case 'about':
        return <AboutPageView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Zoho Books Styled Left Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          {renderCurrentView()}
        </main>
      </div>

      {/* Global Modals */}
      <VoucherModal />
      <InvoiceViewModal />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <ErpAppMain />
    </ErpProvider>
  );
}

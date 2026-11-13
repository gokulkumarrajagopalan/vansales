import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { amountToWords } from '../utils/numberToWords';
import { APP_CONFIG } from '../config';

interface InvoicePreviewScreenProps {
  customer: any;
  items: any[];
  onSuccess: (invoiceResult: any) => void;
  onBack: () => void;
}

export const InvoicePreviewScreen: React.FC<InvoicePreviewScreenProps> = ({
  customer,
  items,
  onSuccess,
  onBack,
}) => {
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CREDIT' | 'CARD' | 'CHEQUE'>('CASH');
  const [loading, setLoading] = useState(false);
  const [savedInvoice, setSavedInvoice] = useState<any>(null);

  // Calculations
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.lineTaxable;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
  let netTotal = Math.round((subtotal + vatAmount) * 100) / 100;
  let roundOff = 0;

  if (paymentMode === 'CASH') {
    const roundedCash = Math.round(netTotal * 4) / 4;
    roundOff = Math.round((roundedCash - netTotal) * 100) / 100;
    netTotal = roundedCash;
  }

  const inWords = amountToWords(netTotal, APP_CONFIG.currencyCode);

  const handleSaveInvoice = async () => {
    setLoading(true);
    try {
      const payload = {
        customerId: customer.id,
        customerName: customer.name,
        paymentMode,
        items: items.map((i) => ({
          stockItemId: i.id,
          stockItemName: i.name,
          qty: i.qty,
          unitPrice: i.sellingPrice,
          unit: i.unit,
          discountPercent: 0,
          taxPercent: 5.0,
        })),
        narration: `Spot sale to ${customer.name} via Van App`,
      };

      const res = await MobileApi.createInvoice(payload);
      if (res.isValid && res.data) {
        setSavedInvoice(res.data);
      } else {
        Alert.alert('Cannot Save Invoice', res.message || 'Error occurred');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    Alert.alert('Bluetooth Printer', 'Sending ESC/POS tax invoice command to connected mobile printer...');
  };

  const handleShare = async () => {
    try {
      const lines = items
        .map(i => `• ${i.name} x${i.qty} @ ${APP_CONFIG.currencySymbol}${i.sellingPrice.toFixed(2)} = ${APP_CONFIG.currencySymbol}${(i.lineTaxable || 0).toFixed(2)}`)
        .join('\n');
      await Share.share({
        title: `Tax Invoice ${currentInvNum}`,
        message: `${APP_CONFIG.companyName}\nTax Invoice: ${currentInvNum}\nDate: ${displayDate}\nCustomer: ${customer?.name || 'Customer'}\nPayment Mode: ${paymentMode}\n\n${lines}\n\nSubtotal: ${APP_CONFIG.currencySymbol} ${subtotal.toFixed(2)}\n${APP_CONFIG.taxName} (5%): ${APP_CONFIG.currencySymbol} ${vatAmount.toFixed(2)}\nNet Total: ${APP_CONFIG.currencySymbol} ${netTotal.toFixed(2)} (${inWords})`,
      });
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Unable to open share sheet.');
    }
  };

  const currentInvNum = savedInvoice?.invoiceNumber || 'INV-DRAFT';
  const displayDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Tax Invoice #{currentInvNum}</Text>
          <Text style={styles.headerSub}>Display Mode • Ready to Print & Share</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Saved Success Banner */}
        {savedInvoice ? (
          <View style={styles.successBanner}>
            <Text style={styles.checkIcon}>✓</Text>
            <Text style={styles.successBannerText}>
              Invoice #{savedInvoice.invoiceNumber} saved! Inventory updated.
            </Text>
          </View>
        ) : null}

        {/* Invoice Document Sheet */}
        <View style={styles.docSheet}>
          {/* Top Voucher Row */}
          <View style={styles.docTopRow}>
            <View>
              <Text style={styles.docMetaLabel}>VOUCHER NUMBER</Text>
              <Text style={styles.docVoucherNum}>{currentInvNum}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.docMetaLabel}>DATE</Text>
              <Text style={styles.docDate}>{displayDate}</Text>
            </View>
          </View>

          <View style={styles.docDivider} />

          {/* Customer & Bill To */}
          <Text style={styles.sectionHeader}>CUSTOMER & BILL TO</Text>
          <Text style={styles.customerName}>{customer.name}</Text>
          <Text style={styles.customerAddress}>
            {customer.address || 'Al Rigga Road, Deira, Dubai, United Arab Emirates'}
          </Text>
          <Text style={styles.trnText}>
            TRN: {customer.trn || '100234567800003'} | Peppol ID: -
          </Text>

          {/* Payment Method Block */}
          <View style={styles.paymentMethodBlock}>
            <Text style={styles.pmTitle}>PAYMENT METHOD:</Text>
            <Text style={styles.pmValue}>
              {paymentMode === 'CASH'
                ? 'Cash payment (Fully Settled)'
                : paymentMode === 'CREDIT'
                ? 'Credit (30 Days Terms)'
                : `${paymentMode} Settlement`}
            </Text>
          </View>

          {/* Payment Terms Selector if not saved yet */}
          {!savedInvoice && (
            <View style={styles.pmSelectorRow}>
              {(['CASH', 'CREDIT', 'CARD', 'CHEQUE'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pmPill, paymentMode === m && styles.pmPillActive]}
                  onPress={() => setPaymentMode(m)}
                >
                  <Text style={[styles.pmPillText, paymentMode === m && styles.pmPillTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.docDivider} />

          {/* Body of Invoice */}
          <Text style={styles.sectionHeader}>BODY OF INVOICE ({items.length} ITEMS)</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thText, { flex: 2.2 }]}>Item / Part No</Text>
            <Text style={[styles.thText, { flex: 0.8, textAlign: 'center' }]}>Qty</Text>
            <Text style={[styles.thText, { flex: 1, textAlign: 'right' }]}>Rate</Text>
            <Text style={[styles.thText, { flex: 0.8, textAlign: 'right' }]}>Disc</Text>
            <Text style={[styles.thText, { flex: 1.2, textAlign: 'right' }]}>Amount</Text>
          </View>

          {/* Table Rows */}
          {items.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <View style={{ flex: 2.2 }}>
                <Text style={styles.rowItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.rowItemSku}>{item.unit || 'Nos'}</Text>
              </View>
              <Text style={[styles.rowText, { flex: 0.8, textAlign: 'center' }]}>{item.qty}</Text>
              <Text style={[styles.rowText, { flex: 1, textAlign: 'right' }]}>
                {item.sellingPrice?.toFixed(2)}
              </Text>
              <Text style={[styles.rowText, { flex: 0.8, textAlign: 'right' }]}>0.00</Text>
              <Text style={[styles.rowBoldText, { flex: 1.2, textAlign: 'right' }]}>
                {item.lineTaxable.toFixed(2)}
              </Text>
            </View>
          ))}

          <View style={styles.docDivider} />

          {/* Financials Breakdown */}
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>{APP_CONFIG.currencySymbol} {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>{APP_CONFIG.taxName} (5%)</Text>
            <Text style={styles.calcValue}>{APP_CONFIG.currencySymbol} {vatAmount.toFixed(2)}</Text>
          </View>
          {roundOff !== 0 && (
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Round Off</Text>
              <Text style={styles.calcValue}>{APP_CONFIG.currencySymbol} {roundOff.toFixed(2)}</Text>
            </View>
          )}

          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>{APP_CONFIG.currencySymbol} {netTotal.toFixed(2)}</Text>
          </View>

          {/* Amount In Words Box */}
          <View style={styles.wordsBox}>
            <Text style={styles.wordsLabel}>AMOUNT IN WORDS:</Text>
            <Text style={styles.wordsValue}>{inWords}</Text>
          </View>

          {savedInvoice?.guid && (
            <View style={styles.guidBadge}>
              <Text style={styles.guidLabel}>PERMANENT TALLY GUID:</Text>
              <Text style={styles.guidValue}>{savedInvoice.guid}</Text>
            </View>
          )}
        </View>

        {/* Action Button: If not saved, show Save Invoice */}
        {!savedInvoice ? (
          <TouchableOpacity
            style={[styles.confirmBtn, loading && styles.btnDisabled]}
            onPress={handleSaveInvoice}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmBtnText}>CONFIRM & SAVE INVOICE 💾</Text>
            )}
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Persistent Bottom Action Bar (When Saved) */}
      {savedInvoice && (
        <View style={styles.bottomBar}>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
              <Text style={styles.printBtnText}>🖨 Print</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <Text style={styles.shareBtnText}>🔗 Share PDF</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => onSuccess(savedInvoice)}
          >
            <Text style={styles.doneBtnText}>Done / Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: {
    padding: 6,
    marginRight: 8,
  },
  backArrow: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  headerSub: {
    fontSize: 12,
    color: '#64748B',
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 140,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: theme.spacing.lg,
    gap: 10,
  },
  checkIcon: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  successBannerText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E3A8A',
    flex: 1,
  },
  docSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: theme.spacing.lg,
  },
  docTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docMetaLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  docVoucherNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginTop: 2,
  },
  docDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    marginTop: 2,
  },
  docDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E40AF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 3,
  },
  customerAddress: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 3,
  },
  trnText: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  paymentMethodBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  pmTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    marginBottom: 2,
  },
  pmValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  pmSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  pmPill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  pmPillActive: {
    backgroundColor: '#2563EB',
  },
  pmPillText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#64748B',
  },
  pmPillTextActive: {
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  rowItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  rowItemSku: {
    fontSize: 10,
    color: '#94A3B8',
  },
  rowText: {
    fontSize: 12,
    color: '#475569',
  },
  rowBoldText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  calcLabel: {
    fontSize: 13,
    color: '#475569',
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  grandTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  grandTotalValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  wordsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
  },
  wordsLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginBottom: 2,
  },
  wordsValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  guidBadge: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  guidLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  guidValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#2563EB',
    fontWeight: 'bold',
  },
  confirmBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  printBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  printBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareBtn: {
    flex: 1,
    backgroundColor: '#D97706',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  doneBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  doneBtnText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

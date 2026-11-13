import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface ReceiptScreenProps {
  initialCustomer?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ReceiptScreen: React.FC<ReceiptScreenProps> = ({
  initialCustomer,
  onSuccess,
  onCancel,
}) => {
  const [customerName, setCustomerName] = useState(initialCustomer?.name || 'Al Safeer Car Rental');
  const [amount, setAmount] = useState(
    initialCustomer?.balance > 0 ? Number(initialCustomer.balance).toFixed(2) : '525.00'
  );
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'CHEQUE' | 'CARD' | 'BANK'>('CASH');
  const [chequeNo, setChequeNo] = useState('');
  const [bankName, setBankName] = useState('');
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCustomer?.name) {
      setCustomerName(initialCustomer.name);
      if (initialCustomer.balance > 0) {
        setAmount(Number(initialCustomer.balance).toFixed(2));
      }
    }
  }, [initialCustomer]);

  const handleSaveReceipt = async () => {
    const numAmt = parseFloat(amount);
    if (!customerName || isNaN(numAmt) || numAmt <= 0) {
      Alert.alert('Required', 'Please enter a valid customer name and receipt amount');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        amount: numAmt,
        paymentMode,
        chequeNo: paymentMode === 'CHEQUE' ? chequeNo : undefined,
        bankName: paymentMode === 'CHEQUE' ? bankName : undefined,
        narration: narration || `Collection from ${customerName}`,
      };

      const res = await MobileApi.createReceipt(payload);
      if (res.isValid && res.data) {
        Alert.alert(
          'Receipt Recorded! 🎉',
          `Receipt: ${res.data.receiptNumber}\nGUID: ${res.data.guid}\nAmount: ${APP_CONFIG.currencySymbol} ${res.data.amount}\nTally Sync: READY`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Cannot Save Receipt', res.message || 'Error occurred');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Payment Receipt</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Customer / Party Name</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Search or enter customer"
          />

          <Text style={styles.label}>Receipt Amount ({APP_CONFIG.currencyCode})</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
          />

          <Text style={styles.label}>Collection Mode</Text>
          <View style={styles.modesRow}>
            {(['CASH', 'CHEQUE', 'CARD', 'BANK'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modePill, paymentMode === m && styles.modePillActive]}
                onPress={() => setPaymentMode(m)}
              >
                <Text style={[styles.modeText, paymentMode === m && styles.modeTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {paymentMode === 'CHEQUE' && (
            <>
              <Text style={styles.label}>Cheque Number</Text>
              <TextInput
                style={styles.input}
                value={chequeNo}
                onChangeText={setChequeNo}
                placeholder="e.g. 004921"
              />

              <Text style={styles.label}>Drawee Bank Name</Text>
              <TextInput
                style={styles.input}
                value={bankName}
                onChangeText={setBankName}
                placeholder="e.g. Emirates NBD"
              />
            </>
          )}

          <Text style={styles.label}>Remarks / Narration</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={narration}
            onChangeText={setNarration}
            placeholder="Payment against outstanding bill..."
            multiline
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSaveReceipt}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>SAVE RECEIPT & PRINT SLIP 💳</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backBtn: {
    padding: theme.spacing.sm,
  },
  backBtnText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  scrollContent: {
    padding: theme.spacing.xl,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  modesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  modePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modePillActive: {
    backgroundColor: theme.colors.primary,
  },
  modeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

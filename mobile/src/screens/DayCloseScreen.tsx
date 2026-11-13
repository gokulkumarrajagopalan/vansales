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

interface DayCloseScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const DayCloseScreen: React.FC<DayCloseScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const [closingOdo, setClosingOdo] = useState('12580');
  const [physicalCash, setPhysicalCash] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('Physical cash counted and handed over');
  const [shiftData, setShiftData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await MobileApi.getCurrentShift();
        if (res.isValid && res.data) {
          setShiftData(res.data);
          const expected = res.data.metrics?.expectedCashInHand || 0;
          setPhysicalCash(expected.toFixed(2));
        }
      } catch (err) {
        console.warn('[Fetch current shift error]', err);
      }
    })();
  }, []);

  const expectedCash = shiftData?.metrics?.expectedCashInHand || 0;
  const physicalNum = parseFloat(physicalCash) || 0;
  const discrepancy = physicalNum - expectedCash;

  const handleCloseShift = async () => {
    const odoNum = parseInt(closingOdo, 10);
    if (isNaN(odoNum)) {
      Alert.alert('Required', 'Please enter a valid closing odometer reading');
      return;
    }

    setLoading(true);
    try {
      const res = await MobileApi.closeShift(odoNum, physicalNum, handoverNotes);
      if (res.isValid && res.data) {
        Alert.alert(
          'Shift Closed! 🏁',
          `Distance: ${res.data.distanceKm} KM\nSystem Cash: ${APP_CONFIG.currencySymbol} ${res.data.systemCash}\nPhysical Cash: ${APP_CONFIG.currencySymbol} ${res.data.physicalCash}\nDiscrepancy: ${APP_CONFIG.currencySymbol} ${res.data.discrepancy}`,
          [{ text: 'OK', onPress: onSuccess }]
        );
      } else {
        Alert.alert('Cannot Close Shift', res.message || 'Error occurred');
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
        <Text style={styles.headerTitle}>Day Close / Reconciliation</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Expected Totals Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>SYSTEM COMPUTED CASH IN HAND</Text>
          <Text style={styles.summaryAmount}>{APP_CONFIG.currencySymbol} {expectedCash.toFixed(2)}</Text>
          <Text style={styles.summaryDetails}>
            Opening Float ({APP_CONFIG.currencySymbol}{shiftData?.metrics?.openingCash || 0}) + Cash Sales ({APP_CONFIG.currencySymbol}{shiftData?.metrics?.cashSales || 0}) + Cash Collections ({APP_CONFIG.currencySymbol}{shiftData?.metrics?.cashReceipts || 0})
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Closing Odometer Reading (KM)</Text>
          <TextInput
            style={styles.input}
            value={closingOdo}
            onChangeText={setClosingOdo}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Physical Cash Handed Over ({APP_CONFIG.currencyCode})</Text>
          <TextInput
            style={styles.input}
            value={physicalCash}
            onChangeText={setPhysicalCash}
            keyboardType="decimal-pad"
          />

          {/* Live Discrepancy Indicator */}
          <View style={[styles.discrepancyBox, discrepancy === 0 ? styles.discZero : styles.discWarning]}>
            <Text style={styles.discTitle}>
              Cash Discrepancy:{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {discrepancy === 0 ? `0.00 ${APP_CONFIG.currencyCode} (Perfect Match! 🎉)` : `${APP_CONFIG.currencySymbol} ${discrepancy.toFixed(2)} Difference`}
              </Text>
            </Text>
          </View>

          <Text style={styles.label}>Handover Remarks</Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            value={handoverNotes}
            onChangeText={setHandoverNotes}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCloseShift}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>SUBMIT CASH & CLOSE SHIFT 🏁</Text>
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
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 1,
    marginBottom: 6,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#34D399',
    marginBottom: 6,
  },
  summaryDetails: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  discrepancyBox: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  discZero: {
    backgroundColor: '#ECFDF5',
  },
  discWarning: {
    backgroundColor: '#FFFBEB',
  },
  discTitle: {
    fontSize: 13,
    color: theme.colors.text,
  },
  button: {
    backgroundColor: theme.colors.danger,
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

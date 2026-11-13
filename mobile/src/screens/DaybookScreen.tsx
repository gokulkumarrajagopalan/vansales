import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface DaybookScreenProps {
  onBack: () => void;
}

export const DaybookScreen: React.FC<DaybookScreenProps> = ({ onBack }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [scope, setScope] = useState<'today' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const fetchDaybook = async (selectedScope = scope) => {
    try {
      setLoading(true);
      const res = await MobileApi.getDaybook(selectedScope === 'all' ? 'all' : undefined);
      if (res.isValid && res.data?.entries) {
        setEntries(res.data.entries);
      }
    } catch (err) {
      console.warn('[Fetch Daybook error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaybook(scope);
  }, [scope]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day Book Transactions</Text>
        <TouchableOpacity
          onPress={() => setScope(prev => (prev === 'today' ? 'all' : 'today'))}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>{scope === 'all' ? 'All' : 'Today'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading day transactions...</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.voucherNumber}>{item.voucherNumber}</Text>
                <Text style={[styles.amountText, item.voucherType === 'Sales' ? styles.salesAmt : styles.receiptAmt]}>
                  {APP_CONFIG.currencySymbol} {item.amount?.toFixed(2)}
                </Text>
              </View>

              <View style={styles.cardRow}>
                <Text style={styles.partyName}>{item.partyName}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{item.syncStatus || 'READY'}</Text>
                </View>
              </View>

              <Text style={styles.guidText}>{item.guid}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions recorded today</Text>
            </View>
          }
        />
      )}
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
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  voucherNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  salesAmt: {
    color: theme.colors.primary,
  },
  receiptAmt: {
    color: theme.colors.success,
  },
  partyName: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#EFF6FF',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  guidText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#94A3B8',
    marginTop: 4,
  },
  loaderCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface SelectCustomerScreenProps {
  onSelectCustomer: (customer: any) => void;
  onCancel: () => void;
}

export const SelectCustomerScreen: React.FC<SelectCustomerScreenProps> = ({
  onSelectCustomer,
  onCancel,
}) => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async (q = '') => {
    try {
      setLoading(true);
      const res = await MobileApi.getCustomers(q);
      if (res.isValid) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.warn('[Fetch Customers error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Step Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onCancel} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Cancel</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.stepIndicator}>STEP 1 OF 3</Text>
          <Text style={styles.headerTitle}>Select Customer</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by customer name, phone, or TRN..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Customer List */}
      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading debtor accounts...</Text>
        </View>
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.customerCard}
              onPress={() => onSelectCustomer(item)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.customerName}>{item.name}</Text>
                <View style={[styles.balanceBadge, (item.balance || 0) > 0 ? styles.balanceDue : styles.balanceClear]}>
                  <Text style={styles.balanceText}>
                    {(item.balance || 0) > 0 ? `${APP_CONFIG.currencySymbol} ${Number(item.balance).toFixed(2)} Due` : 'Clear Balance'}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDetails}>
                <Text style={styles.detailText}>📞 {item.phone || 'No phone recorded'}</Text>
                <Text style={styles.detailText}>📍 {item.address || 'Dubai, UAE'}</Text>
                {item.trn ? (
                  <Text style={styles.trnText}>TRN: {item.trn}</Text>
                ) : null}
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching customers found</Text>
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
  stepIndicator: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  searchContainer: {
    padding: theme.spacing.md,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  customerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
    marginRight: 8,
  },
  balanceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  balanceDue: {
    backgroundColor: '#FEE2E2',
  },
  balanceClear: {
    backgroundColor: '#ECFDF5',
  },
  balanceText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  cardDetails: {
    gap: 3,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  trnText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: theme.colors.primary,
    marginTop: 2,
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

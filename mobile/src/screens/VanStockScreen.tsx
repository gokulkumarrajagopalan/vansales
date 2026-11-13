import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface VanStockScreenProps {
  onBack: () => void;
}

export const VanStockScreen: React.FC<VanStockScreenProps> = ({ onBack }) => {
  const [items, setItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [godownName, setGodownName] = useState('Van 01 Godown');
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await MobileApi.getVanStock();
      if (res.isValid && res.data?.items) {
        setItems(res.data.items);
        setGodownName(res.data.godownName);
      }
    } catch (err) {
      console.warn('[Fetch Stock error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filtered = items.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Van Inventory</Text>
          <Text style={styles.headerSub}>{godownName}</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filter stock by name..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading van stock...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.stockCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
                <Text style={styles.itemPrice}>{APP_CONFIG.currencySymbol} {item.sellingPrice?.toFixed(2)} / {item.unit}</Text>
              </View>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyNumber}>{item.stockQty}</Text>
                <Text style={styles.qtyUnit}>{item.unit}</Text>
              </View>
            </View>
          )}
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
  headerSub: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  searchBar: {
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
    paddingVertical: 8,
    fontSize: 14,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  stockCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  itemCategory: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 4,
  },
  qtyBadge: {
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  qtyNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  qtyUnit: {
    fontSize: 11,
    color: theme.colors.textMuted,
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
});

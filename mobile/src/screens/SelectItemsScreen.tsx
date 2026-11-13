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
  ScrollView,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface SelectItemsScreenProps {
  customer: any;
  onProceed: (selectedItems: any[], customer: any) => void;
  onBack: () => void;
}

export const SelectItemsScreen: React.FC<SelectItemsScreenProps> = ({
  customer,
  onProceed,
  onBack,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [categories, setCategories] = useState<string[]>(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await MobileApi.getVanStock();
      if (res.isValid && res.data?.items) {
        setItems(res.data.items);
        const cats = Array.from(new Set(res.data.items.map((i: any) => i.category || 'General'))) as string[];
        setCategories(['All', ...cats]);
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

  const updateQuantity = (itemId: number, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: next };
    });
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate cart totals
  let totalCount = 0;
  let subtotal = 0;
  const selectedCartItems: any[] = [];

  for (const item of items) {
    const qty = quantities[item.id];
    if (qty && qty > 0) {
      totalCount += qty;
      const lineTaxable = qty * (item.sellingPrice || 0);
      subtotal += lineTaxable;
      selectedCartItems.push({
        ...item,
        qty,
        lineTaxable,
      });
    }
  }

  const vatAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const netTotal = Math.round((subtotal + vatAmount) * 100) / 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.stepIndicator}>STEP 2 OF 3</Text>
          <Text style={styles.customerHeaderName}>{customer.name}</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* Category Filter Horizontal Pills */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryPillText, selectedCategory === cat && styles.categoryPillTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name or SKU..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Stock Items List */}
      {loading ? (
        <View style={styles.loaderCenter}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading van inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const qty = quantities[item.id] || 0;
            return (
              <View style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemMeta}>
                    In Van: <Text style={styles.boldText}>{item.stockQty} {item.unit}</Text> • Price:{' '}
                    <Text style={styles.boldText}>{APP_CONFIG.currencySymbol} {item.sellingPrice?.toFixed(2)}</Text>
                  </Text>
                  <Text style={styles.vatTag}>{APP_CONFIG.taxName} (5%) Applicable</Text>
                </View>

                {/* Stepper controls */}
                <View style={styles.stepperContainer}>
                  {qty > 0 ? (
                    <>
                      <TouchableOpacity
                        style={styles.stepBtnMinus}
                        onPress={() => updateQuantity(item.id, -1)}
                      >
                        <Text style={styles.stepBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{qty}</Text>
                    </>
                  ) : null}
                  <TouchableOpacity
                    style={styles.stepBtnPlus}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.stepBtnPlusText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stock items found</Text>
            </View>
          }
        />
      )}

      {/* Bottom Floating Bar */}
      {totalCount > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomBarCount}>{totalCount} Items Selected</Text>
            <Text style={styles.bottomBarTotal}>
              {APP_CONFIG.currencySymbol} {netTotal.toFixed(2)} <Text style={styles.bottomBarVat}>(Incl. {APP_CONFIG.taxName})</Text>
            </Text>
          </View>
          <TouchableOpacity
            style={styles.proceedBtn}
            onPress={() => onProceed(selectedCartItems, customer)}
          >
            <Text style={styles.proceedBtnText}>REVIEW INVOICE →</Text>
          </TouchableOpacity>
        </View>
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
  customerHeaderName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  categoryBar: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.md,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#F1F5F9',
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
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
    color: theme.colors.text,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100,
    gap: theme.spacing.sm,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  boldText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  vatTag: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtnMinus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#475569',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  stepBtnPlus: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnPlusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
  bottomBarCount: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  bottomBarTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  bottomBarVat: {
    fontSize: 11,
    fontWeight: 'normal',
    color: theme.colors.primary,
  },
  proceedBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: 12,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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

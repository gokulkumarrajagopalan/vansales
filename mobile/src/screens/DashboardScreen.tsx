import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface DashboardScreenProps {
  user: any;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onNavigate,
  onLogout,
}) => {
  const [shiftData, setShiftData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  const fetchShift = async () => {
    try {
      setRefreshing(true);
      await MobileApi.flushOfflineQueue().catch(() => {});
      const count = await MobileApi.getOfflineQueueCount();
      setPendingSyncCount(count);
      const res = await MobileApi.getCurrentShift();
      if (res.isValid) {
        setShiftData(res.data);
      }
    } catch (err) {
      console.warn('[Dashboard Shift fetch err]', err);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchShift();
  }, []);

  const hasActiveShift = Boolean(shiftData?.shift?.id);
  const metrics = shiftData?.metrics || {
    totalSales: 0,
    cashSales: 0,
    invoiceCount: 0,
    totalReceipts: 0,
    receiptCount: 0,
    expectedCashInHand: 0,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.driverGreeting}>Hello,</Text>
          <Text style={styles.driverName}>{user?.fullName || 'Sales Representative'}</Text>
          <Text style={styles.vanGodown}>Assigned: {user?.godownName || 'Van 01 Godown'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchShift} />}
      >
        {/* Offline Sync Outbox Banner */}
        {pendingSyncCount > 0 && (
          <TouchableOpacity
            style={styles.syncBanner}
            onPress={fetchShift}
          >
            <Text style={styles.syncBannerText}>
              ⏳ {pendingSyncCount} offline record(s) pending sync — Tap to retry
            </Text>
          </TouchableOpacity>
        )}

        {/* Shift Status Banner */}
        <View style={[styles.shiftBanner, hasActiveShift ? styles.shiftOpen : styles.shiftClosed]}>
          <View style={styles.shiftBannerLeft}>
            <View style={[styles.statusDot, { backgroundColor: hasActiveShift ? '#10B981' : '#EF4444' }]} />
            <Text style={styles.shiftStatusText}>
              {hasActiveShift ? `Shift #${shiftData.shift.id} Active` : 'No Active Shift (Day Closed)'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.shiftActionBtn}
            onPress={() => onNavigate(hasActiveShift ? 'DAY_CLOSE' : 'DAY_OPEN')}
          >
            <Text style={styles.shiftActionBtnText}>
              {hasActiveShift ? 'Close Day 🏁' : 'Start Day 🚀'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Van Route & GPS Navigation Banner */}
        <TouchableOpacity
          style={styles.navBannerCard}
          activeOpacity={0.85}
          onPress={() => onNavigate('VAN_NAVIGATION')}
        >
          <View style={styles.navBannerTop}>
            <View style={styles.navLivePill}>
              <View style={styles.navPulseDot} />
              <Text style={styles.navLivePillText}>LIVE GPS ROUTE 01</Text>
            </View>
            <Text style={styles.navSpeedPill}>Van Moving • 38 km/h</Text>
          </View>

          <View style={styles.navBannerContent}>
            <View style={styles.navBannerIconBox}>
              <Text style={styles.navBannerIconEmoji}>🚐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.navBannerTitle}>Van Live Route Navigation</Text>
              <Text style={styles.navBannerSub}>
                Deira / Bur Dubai Sector • 5 Customer Waypoints Scheduled
              </Text>
            </View>
            <Text style={styles.navBannerArrow}>→</Text>
          </View>
        </TouchableOpacity>

        {/* 4 Metric Cards */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Today Sales */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Today's Sales</Text>
            <Text style={styles.metricValue}>{APP_CONFIG.currencySymbol} {metrics.totalSales.toFixed(2)}</Text>
            <Text style={styles.metricSub}>{APP_CONFIG.currencyCode} • {metrics.invoiceCount} Invoices</Text>
          </View>

          {/* Card 2: Cash in Hand */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Cash In Hand</Text>
            <Text style={[styles.metricValue, { color: theme.colors.success }]}>
              {APP_CONFIG.currencySymbol} {metrics.expectedCashInHand.toFixed(2)}
            </Text>
            <Text style={styles.metricSub}>{APP_CONFIG.currencyCode} • System Balance</Text>
          </View>

          {/* Card 3: Collections */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Collections</Text>
            <Text style={styles.metricValue}>{APP_CONFIG.currencySymbol} {metrics.totalReceipts.toFixed(2)}</Text>
            <Text style={styles.metricSub}>{APP_CONFIG.currencyCode} • {metrics.receiptCount} Receipts</Text>
          </View>

          {/* Card 4: Odometer */}
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Odometer Start</Text>
            <Text style={styles.metricValue}>{shiftData?.shift?.opening_odometer || 0}</Text>
            <Text style={styles.metricSub}>KM Reading</Text>
          </View>
        </View>

        {/* Action Grid */}
        <Text style={styles.sectionTitle}>Van Operations</Text>

        {/* Primary Spot Sale Button */}
        <TouchableOpacity
          style={styles.primaryAction}
          onPress={() => onNavigate('SELECT_CUSTOMER')}
        >
          <View style={styles.primaryActionLeft}>
            <Text style={styles.primaryActionEmoji}>🛒</Text>
            <View>
              <Text style={styles.primaryActionTitle}>NEW SPOT SALE</Text>
              <Text style={styles.primaryActionSub}>Select Customer &gt; Add Items &gt; 5% VAT Invoice</Text>
            </View>
          </View>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        {/* Grid of Secondary Actions */}
        <View style={styles.actionsGrid}>
          {/* Action: Live Route Navigation */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#3B82F6', backgroundColor: '#F0F9FF' }]}
            onPress={() => onNavigate('VAN_NAVIGATION')}
          >
            <Text style={styles.actionCardEmoji}>🛰️</Text>
            <Text style={[styles.actionCardTitle, { color: '#0369A1' }]}>Live Route GPS</Text>
            <Text style={styles.actionCardSub}>Moving Van & Stops</Text>
          </TouchableOpacity>

          {/* Action: Payment Receipt */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('RECEIPT')}
          >
            <Text style={styles.actionCardEmoji}>💳</Text>
            <Text style={styles.actionCardTitle}>Payment Receipt</Text>
            <Text style={styles.actionCardSub}>Collect Cash/Cheque</Text>
          </TouchableOpacity>

          {/* Action: Van Stock */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('VAN_STOCK')}
          >
            <Text style={styles.actionCardEmoji}>📦</Text>
            <Text style={styles.actionCardTitle}>Van Stock</Text>
            <Text style={styles.actionCardSub}>Live Mobile Inventory</Text>
          </TouchableOpacity>

          {/* Action: Daybook */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate('DAYBOOK')}
          >
            <Text style={styles.actionCardEmoji}>📑</Text>
            <Text style={styles.actionCardTitle}>Day Book</Text>
            <Text style={styles.actionCardSub}>Today's Transactions</Text>
          </TouchableOpacity>

          {/* Action: Day Close / Open */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => onNavigate(hasActiveShift ? 'DAY_CLOSE' : 'DAY_OPEN')}
          >
            <Text style={styles.actionCardEmoji}>{hasActiveShift ? '🏁' : '🚀'}</Text>
            <Text style={styles.actionCardTitle}>{hasActiveShift ? 'End Day' : 'Start Day'}</Text>
            <Text style={styles.actionCardSub}>{hasActiveShift ? 'Cash Reconciliation' : 'Odometer & Float'}</Text>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  driverGreeting: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  vanGodown: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  logoutBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: '#F1F5F9',
  },
  logoutText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  shiftBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
  },
  shiftOpen: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  shiftClosed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  shiftBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shiftStatusText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  shiftActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.sm,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  shiftActionBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginVertical: 4,
  },
  metricSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  primaryAction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  primaryActionEmoji: {
    fontSize: 30,
  },
  primaryActionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  primaryActionSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  arrowText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  actionCardEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  actionCardSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  // Live GPS Nav Banner Styles
  navBannerCard: {
    backgroundColor: '#0F172A',
    borderRadius: theme.borderRadius.xl,
    padding: 16,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#38BDF855',
    shadowColor: '#0284C7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  navBannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0369A1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    gap: 6,
  },
  navPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  navLivePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  navSpeedPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  navBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBannerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF844',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBannerIconEmoji: {
    fontSize: 24,
  },
  navBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  navBannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  navBannerArrow: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  syncBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  syncBannerText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
});

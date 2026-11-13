import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Default URL: 10.0.2.2 for Android emulator, localhost for iOS/web
const DEFAULT_HOST = 'http://66.116.232.161:8088';
const OFFLINE_QUEUE_KEY = 'offline_sync_queue';

export interface OfflineQueueItem {
  id: string;
  type: 'invoice' | 'receipt' | 'open_shift' | 'close_shift';
  endpoint: string;
  payload: any;
  queuedAt: string;
}

function isNetworkFailure(err: any): boolean {
  return !err?.response || err?.code === 'ECONNABORTED' || err?.code === 'ERR_NETWORK';
}

export class MobileApi {
  private static baseURL: string = DEFAULT_HOST;
  private static token: string | null = null;

  static async init() {
    const savedHost = await AsyncStorage.getItem('server_host');
    if (savedHost) {
      this.baseURL = savedHost;
    }
    this.token = await AsyncStorage.getItem('auth_token');
    if (this.token) {
      await this.flushOfflineQueue().catch(() => {});
    }
  }

  static async setHost(host: string) {
    this.baseURL = host;
    await AsyncStorage.setItem('server_host', host);
  }

  static getHost(): string {
    return this.baseURL;
  }

  private static getClient() {
    return axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      },
      timeout: 10000,
    });
  }

  static async getOfflineQueue(): Promise<OfflineQueueItem[]> {
    try {
      const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  static async getOfflineQueueCount(): Promise<number> {
    const items = await this.getOfflineQueue();
    return items.length;
  }

  private static async enqueueOffline(item: Omit<OfflineQueueItem, 'id' | 'queuedAt'>): Promise<OfflineQueueItem> {
    const queue = await this.getOfflineQueue();
    const entry: OfflineQueueItem = {
      ...item,
      id: `OFF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      queuedAt: new Date().toISOString(),
    };
    queue.push(entry);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return entry;
  }

  static async flushOfflineQueue(): Promise<{ synced: number; remaining: number }> {
    if (!this.token) {
      const count = await this.getOfflineQueueCount();
      return { synced: 0, remaining: count };
    }
    const queue = await this.getOfflineQueue();
    if (queue.length === 0) return { synced: 0, remaining: 0 };

    const remaining: OfflineQueueItem[] = [];
    let synced = 0;

    for (let i = 0; i < queue.length; i++) {
      const entry = queue[i];
      try {
        await this.getClient().post(entry.endpoint, entry.payload);
        synced += 1;
      } catch (err: any) {
        if (isNetworkFailure(err)) {
          remaining.push(...queue.slice(i));
          break;
        }
        // Keep failed server-rejected items for manual review rather than silent data loss
        remaining.push(entry);
      }
    }

    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return { synced, remaining: remaining.length };
  }

  static async login(username: string, password: string) {
    const res = await this.getClient().post('/api/v1/auth/login', { username, password });
    if (res.data.isValid && res.data.data?.token) {
      this.token = res.data.data.token;
      await AsyncStorage.setItem('auth_token', this.token!);
      await AsyncStorage.setItem('auth_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  }

  static async logout() {
    this.token = null;
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('auth_user');
  }

  static async getCurrentShift() {
    const res = await this.getClient().get('/api/v1/shifts/current');
    return res.data;
  }

  static async openShift(openingOdometer: number, openingCash: number, godownName?: string) {
    const payload = { openingOdometer, openingCash, godownName };
    try {
      const res = await this.getClient().post('/api/v1/shifts/open', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const queued = await this.enqueueOffline({ type: 'open_shift', endpoint: '/api/v1/shifts/open', payload });
        return {
          isValid: true,
          queuedOffline: true,
          message: 'Shift open queued offline and will sync when back online.',
          data: { id: queued.id, queuedOffline: true },
        };
      }
      throw err;
    }
  }

  static async closeShift(closingOdometer: number, physicalCash: number, handoverNotes?: string) {
    const payload = { closingOdometer, physicalCash, handoverNotes };
    try {
      const res = await this.getClient().post('/api/v1/shifts/close', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const queued = await this.enqueueOffline({ type: 'close_shift', endpoint: '/api/v1/shifts/close', payload });
        return {
          isValid: true,
          queuedOffline: true,
          message: 'Shift close queued offline and will sync when back online.',
          data: { id: queued.id, queuedOffline: true },
        };
      }
      throw err;
    }
  }

  static async getCustomers(search = '') {
    const res = await this.getClient().get(`/api/v1/customers?limit=50&search=${encodeURIComponent(search)}`);
    return res.data;
  }

  static async getVanStock(godownName?: string) {
    const res = await this.getClient().get(`/api/v1/stock/van-stock${godownName ? `?godownName=${encodeURIComponent(godownName)}` : ''}`);
    return res.data;
  }

  static async createInvoice(payload: {
    customerId?: number;
    customerName: string;
    paymentMode: string;
    items: any[];
    narration?: string;
  }) {
    try {
      const res = await this.getClient().post('/api/v1/invoices', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const queued = await this.enqueueOffline({ type: 'invoice', endpoint: '/api/v1/invoices', payload });
        return {
          isValid: true,
          queuedOffline: true,
          message: 'Invoice saved offline — will auto-sync when connection is restored.',
          data: {
            invoiceNumber: queued.id,
            guid: queued.id,
            queuedOffline: true,
          },
        };
      }
      throw err;
    }
  }

  static async createReceipt(payload: {
    customerName: string;
    amount: number;
    paymentMode: string;
    chequeNo?: string;
    bankName?: string;
    narration?: string;
  }) {
    try {
      const res = await this.getClient().post('/api/v1/receipts', payload);
      return res.data;
    } catch (err: any) {
      if (isNetworkFailure(err)) {
        const queued = await this.enqueueOffline({ type: 'receipt', endpoint: '/api/v1/receipts', payload });
        return {
          isValid: true,
          queuedOffline: true,
          message: 'Receipt saved offline — will auto-sync when connection is restored.',
          data: {
            receiptNumber: queued.id,
            guid: queued.id,
            amount: payload.amount,
            queuedOffline: true,
          },
        };
      }
      throw err;
    }
  }

  static async sendTelemetryPing(payload: {
    latitude: number;
    longitude: number;
    speed_kmh?: number;
    heading_deg?: number;
    battery_pct?: number;
  }) {
    const res = await this.getClient().post('/api/v1/tracking/ping', payload);
    return res.data;
  }

  static async getDaybook(date?: string) {
    const queryStr = date ? `?date=${encodeURIComponent(date)}` : '';
    const res = await this.getClient().get(`/api/v1/reports/daybook${queryStr}`);
    return res.data;
  }

  static async getInvoices(limit = 50) {
    const res = await this.getClient().get(`/api/v1/invoices?limit=${limit}`);
    return res.data;
  }

  static async getReceipts(limit = 50) {
    const res = await this.getClient().get(`/api/v1/receipts?limit=${limit}`);
    return res.data;
  }
}

import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileApi } from './src/api/mobileApi';
import { AuthScreen } from './src/screens/AuthScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { DayOpenScreen } from './src/screens/DayOpenScreen';
import { DayCloseScreen } from './src/screens/DayCloseScreen';
import { SelectCustomerScreen } from './src/screens/SelectCustomerScreen';
import { SelectItemsScreen } from './src/screens/SelectItemsScreen';
import { InvoicePreviewScreen } from './src/screens/InvoicePreviewScreen';
import { ReceiptScreen } from './src/screens/ReceiptScreen';
import { VanStockScreen } from './src/screens/VanStockScreen';
import { DaybookScreen } from './src/screens/DaybookScreen';
import { VanNavigationScreen } from './src/screens/VanNavigationScreen';
import { SplashScreen } from './src/screens/SplashScreen';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('DASHBOARD');

  // Sales wizard flow state
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        await MobileApi.init();
        const savedUser = await AsyncStorage.getItem('auth_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (err) {
        console.warn('[App Init error]', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await MobileApi.logout();
    setUser(null);
    setCurrentScreen('DASHBOARD');
  };

  if (loading || showSplash) {
    return (
      <>
        <StatusBar style="light" />
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </>
    );
  }

  // If not authenticated, render AuthScreen
  if (!user) {
    return (
      <>
        <StatusBar style="dark" />
        <AuthScreen onLoginSuccess={(u) => setUser(u)} />
      </>
    );
  }

  // Render active screen
  return (
    <>
      <StatusBar style="dark" />
      {currentScreen === 'DASHBOARD' && (
        <DashboardScreen
          user={user}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLogout={handleLogout}
        />
      )}

      {currentScreen === 'DAY_OPEN' && (
        <DayOpenScreen
          user={user}
          onSuccess={() => setCurrentScreen('DASHBOARD')}
          onCancel={() => setCurrentScreen('DASHBOARD')}
        />
      )}

      {currentScreen === 'DAY_CLOSE' && (
        <DayCloseScreen
          onSuccess={() => setCurrentScreen('DASHBOARD')}
          onCancel={() => setCurrentScreen('DASHBOARD')}
        />
      )}

      {currentScreen === 'SELECT_CUSTOMER' && (
        <SelectCustomerScreen
          onSelectCustomer={(cust) => {
            setSelectedCustomer(cust);
            setCurrentScreen('SELECT_ITEMS');
          }}
          onCancel={() => setCurrentScreen('DASHBOARD')}
        />
      )}

      {currentScreen === 'SELECT_ITEMS' && (
        <SelectItemsScreen
          customer={selectedCustomer}
          onProceed={(items) => {
            setCartItems(items);
            setCurrentScreen('INVOICE_PREVIEW');
          }}
          onBack={() => setCurrentScreen('SELECT_CUSTOMER')}
        />
      )}

      {currentScreen === 'INVOICE_PREVIEW' && (
        <InvoicePreviewScreen
          customer={selectedCustomer}
          items={cartItems}
          onSuccess={() => {
            setCartItems([]);
            setSelectedCustomer(null);
            setCurrentScreen('DASHBOARD');
          }}
          onBack={() => setCurrentScreen('SELECT_ITEMS')}
        />
      )}

      {currentScreen === 'RECEIPT' && (
        <ReceiptScreen
          initialCustomer={selectedCustomer}
          onSuccess={() => {
            setSelectedCustomer(null);
            setCurrentScreen('DASHBOARD');
          }}
          onCancel={() => {
            setSelectedCustomer(null);
            setCurrentScreen('DASHBOARD');
          }}
        />
      )}

      {currentScreen === 'VAN_STOCK' && (
        <VanStockScreen onBack={() => setCurrentScreen('DASHBOARD')} />
      )}

      {currentScreen === 'DAYBOOK' && (
        <DaybookScreen onBack={() => setCurrentScreen('DASHBOARD')} />
      )}

      {currentScreen === 'VAN_NAVIGATION' && (
        <VanNavigationScreen
          user={user}
          onBack={() => setCurrentScreen('DASHBOARD')}
          onStartSaleForCustomer={(cust) => {
            setSelectedCustomer(cust);
            setCurrentScreen('SELECT_ITEMS');
          }}
          onCollectReceiptForCustomer={(cust) => {
            setSelectedCustomer(cust);
            setCurrentScreen('RECEIPT');
          }}
        />
      )}
    </>
  );
}

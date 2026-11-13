import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyCode, setCompanyCode] = useState('30449');
  const [loading, setLoading] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverHost, setServerHost] = useState(MobileApi.getHost());

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Required', 'Please enter username and password');
      return;
    }
    setLoading(true);
    try {
      const res = await MobileApi.login(username.trim(), password.trim());
      if (res.isValid && res.data?.user) {
        onLoginSuccess(res.data.user);
      } else {
        Alert.alert('Login Failed', res.message || 'Invalid credentials');
      }
    } catch (err: any) {
      Alert.alert('Network Error', err.response?.data?.message || err.message || 'Cannot reach server');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveServer = async () => {
    await MobileApi.setHost(serverHost.trim());
    setShowServerModal(false);
    Alert.alert('Saved', 'Server address updated: ' + serverHost);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoBadge}
            resizeMode="contain"
          />
          <Text style={styles.title}>Talliffy Van Sales</Text>
          <Text style={styles.subtitle}>Mobile Field Sales &amp; Tally Sync</Text>
        </View>

        {/* Card Form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sales Representative Sign-In</Text>

          {/* Company Code */}
          <Text style={styles.label}>Company Code</Text>
          <TextInput
            style={styles.input}
            value={companyCode}
            onChangeText={setCompanyCode}
            placeholder="e.g. 30449"
            placeholderTextColor="#94A3B8"
          />

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            autoCapitalize="none"
            placeholderTextColor="#94A3B8"
          />

          {/* Password */}
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            secureTextEntry
            placeholderTextColor="#94A3B8"
          />

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>SIGN IN TO ROUTE</Text>
            )}
          </TouchableOpacity>

          {/* Server Settings Link */}
          <TouchableOpacity
            style={styles.serverSettingsLink}
            onPress={() => setShowServerModal(true)}
          >
            <Text style={styles.serverSettingsText}>⚙️ Server Settings ({MobileApi.getHost()})</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Server Config Modal */}
      <Modal visible={showServerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Backend API Gateway URL</Text>
            <Text style={styles.modalSubtitle}>Default for Android Emulator is http://10.0.2.2:8080</Text>
            <TextInput
              style={styles.input}
              value={serverHost}
              onChangeText={setServerHost}
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F1F5F9' }]}
                onPress={() => setShowServerModal(false)}
              >
                <Text style={{ color: '#475569', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveServer}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 18,
    shadowColor: '#0E2E91',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: theme.spacing.md,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  serverSettingsLink: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  serverSettingsText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
  },
  modalButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
  },
});

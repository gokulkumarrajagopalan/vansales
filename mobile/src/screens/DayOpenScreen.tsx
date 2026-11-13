import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../theme';
import { MobileApi } from '../api/mobileApi';
import { APP_CONFIG } from '../config';

interface DayOpenScreenProps {
  user: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export const DayOpenScreen: React.FC<DayOpenScreenProps> = ({
  user,
  onSuccess,
  onCancel,
}) => {
  const [odometer, setOdometer] = useState('12500');
  const [cashFloat, setCashFloat] = useState('200.00');
  const [godownName, setGodownName] = useState(user?.godownName || 'Van 01 Godown');
  const [loading, setLoading] = useState(false);

  const handleOpenShift = async () => {
    const odoNum = parseInt(odometer, 10);
    const floatNum = parseFloat(cashFloat);

    if (isNaN(odoNum) || odoNum <= 0) {
      Alert.alert('Required', 'Please enter a valid starting odometer reading');
      return;
    }

    setLoading(true);
    try {
      const res = await MobileApi.openShift(odoNum, isNaN(floatNum) ? 0 : floatNum, godownName);
      if (res.isValid) {
        Alert.alert('Shift Started', 'Van shift opened successfully! Have a safe route.');
        onSuccess();
      } else {
        Alert.alert('Cannot Open Shift', res.message);
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
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Day Open / Shift Start</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Morning Departure Checklist</Text>
          <Text style={styles.subtitle}>
            Enter opening readings before departing with the van.
          </Text>

          <Text style={styles.label}>Assigned Vehicle / Godown</Text>
          <TextInput
            style={styles.input}
            value={godownName}
            onChangeText={setGodownName}
            placeholder="Van Godown"
          />

          <Text style={styles.label}>Opening Odometer Reading (KM)</Text>
          <TextInput
            style={styles.input}
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
            placeholder="e.g. 12500"
          />

          <Text style={styles.label}>Opening Cash Float ({APP_CONFIG.currencyCode})</Text>
          <TextInput
            style={styles.input}
            value={cashFloat}
            onChangeText={setCashFloat}
            keyboardType="decimal-pad"
            placeholder="e.g. 200.00"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleOpenShift}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>START ROUTE & OPEN SHIFT 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
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
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  content: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xxl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
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

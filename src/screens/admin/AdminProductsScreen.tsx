import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { SACCOProduct } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency } from '../../utils/theme';

interface AdminProductsScreenProps {
  onBack: () => void;
}

export const AdminProductsScreen: React.FC<AdminProductsScreenProps> = ({ onBack }) => {
  const { products, saveProduct } = useSACCO();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SACCOProduct | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [rate, setRate] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [minDur, setMinDur] = useState('');
  const [maxDur, setMaxDur] = useState('');
  const [loading, setLoading] = useState(false);

  const handleOpenEdit = (p?: SACCOProduct) => {
    if (p) {
      setEditingProduct(p);
      setName(p.name);
      setDesc(p.description);
      setRate(p.interestRate.toString());
      setMinAmt(p.minAmount.toString());
      setMaxAmt(p.maxAmount.toString());
      setMinDur(p.minDurationMonths.toString());
      setMaxDur(p.maxDurationMonths.toString());
    } else {
      setEditingProduct(null);
      setName('');
      setDesc('');
      setRate('12');
      setMinAmt('5000');
      setMaxAmt('500000');
      setMinDur('3');
      setMaxDur('24');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !desc.trim() || !rate || !minAmt || !maxAmt) {
      Alert.alert('Required Fields', 'Please complete all required fields.');
      return;
    }

    const newProd: SACCOProduct = {
      id: editingProduct?.id || `prod-${Date.now()}`,
      name: name.trim(),
      description: desc.trim(),
      interestRate: parseFloat(rate) || 10,
      minAmount: parseFloat(minAmt) || 5000,
      maxAmount: parseFloat(maxAmt) || 500000,
      minDurationMonths: parseInt(minDur, 10) || 1,
      maxDurationMonths: parseInt(maxDur, 10) || 24,
      repaymentFrequency: ['monthly'],
      icon: 'cash-outline',
    };

    setLoading(true);
    await saveProduct(newProd);
    setLoading(false);
    setModalVisible(false);
    Alert.alert('Product Saved', `SACCO Product "${newProd.name}" configured successfully.`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Credit Products"
        subtitle="Loan Catalogs & Interest Policies"
        onBack={onBack}
        rightAction={{
          icon: 'add-circle-outline',
          color: COLORS.primary,
          onPress: () => handleOpenEdit(),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.banner}>
          <Ionicons name="information-circle" size={18} color="#0369A1" style={{ marginRight: 6 }} />
          <Text style={styles.bannerText}>
            Configured loan facilities are automatically calculated and offered to members based on their available limits.
          </Text>
        </View>

        {products.map((prod) => (
          <View key={prod.id} style={styles.prodCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.prodName}>{prod.name}</Text>
                <Text style={styles.prodRate}>{prod.interestRate}% p.a. Annual Interest</Text>
              </View>
              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => handleOpenEdit(prod)}
              >
                <Ionicons name="pencil" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.prodDesc}>{prod.description}</Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Min Borrowing</Text>
                <Text style={styles.metricVal}>{formatCurrency(prod.minAmount)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Max Borrowing</Text>
                <Text style={styles.metricVal}>{formatCurrency(prod.maxAmount)}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Tenure Period</Text>
                <Text style={styles.metricVal}>
                  {prod.minDurationMonths} - {prod.maxDurationMonths} Mos
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* CREATE/EDIT MODAL */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingProduct ? 'Edit Loan Product' : 'Add New SACCO Product'}
        subtitle="Set interest rates and borrowing eligibility"
      >
        <InputField
          label="Product Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g. Asset Finance Loan"
          iconName="cash-outline"
          required
        />

        <InputField
          label="Description / Purpose"
          value={desc}
          onChangeText={setDesc}
          placeholder="Brief summary of loan purpose"
          iconName="document-text-outline"
          multiline
          numberOfLines={2}
          required
        />

        <InputField
          label="Annual Interest Rate (%)"
          value={rate}
          onChangeText={setRate}
          placeholder="e.g. 10.5"
          keyboardType="numeric"
          iconName="trending-up-outline"
          required
        />

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <InputField
              label="Min Amount (KES)"
              value={minAmt}
              onChangeText={setMinAmt}
              placeholder="e.g. 5000"
              keyboardType="numeric"
              required
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label="Max Amount (KES)"
              value={maxAmt}
              onChangeText={setMaxAmt}
              placeholder="e.g. 1000000"
              keyboardType="numeric"
              required
            />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <InputField
              label="Min Tenure (Mos)"
              value={minDur}
              onChangeText={setMinDur}
              placeholder="e.g. 3"
              keyboardType="number-pad"
              required
            />
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              label="Max Tenure (Mos)"
              value={maxDur}
              onChangeText={setMaxDur}
              placeholder="e.g. 36"
              keyboardType="number-pad"
              required
            />
          </View>
        </View>

        <Button
          title={editingProduct ? 'Save Product Changes' : 'Create SACCO Product'}
          onPress={handleSave}
          loading={loading}
          variant="primary"
          size="lg"
          iconName="checkmark"
          fullWidth
          style={{ marginTop: 10 }}
        />
      </CustomModal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    marginBottom: 16,
  },
  bannerText: {
    fontSize: 11.5,
    color: '#0369A1',
    flex: 1,
    lineHeight: 16,
  },
  prodCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  prodName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  prodRate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentDark,
    marginTop: 2,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  editBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  prodDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  metricVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
});


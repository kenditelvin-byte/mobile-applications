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
import { LinearGradient } from 'expo-linear-gradient';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { StatCard } from '../../components/common/StatCard';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface SharesScreenProps {
  onBack: () => void;
}

export const SharesScreen: React.FC<SharesScreenProps> = ({ onBack }) => {
  const { shares, savings, myTransactions, buyShares } = useSACCO();

  const [buyModalVisible, setBuyModalVisible] = useState(false);
  const [unitsToBuy, setUnitsToBuy] = useState('10');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'savings_deduction'>('mpesa');
  const [buyLoading, setBuyLoading] = useState(false);

  const totalShares = shares?.totalShares || 0;
  const sharePrice = shares?.sharePrice || 1000;
  const totalValue = shares?.totalValue || totalShares * sharePrice;
  const minRequired = shares?.minimumRequiredShares || 50;

  // Statutory requirement progress
  const progressPercent = Math.min(100, Math.round((totalShares / minRequired) * 100));
  const isCompliant = totalShares >= minRequired;

  // Estimated annual dividend (e.g., 11.5% as per AGM policy)
  const estimatedDividend = Math.round(totalValue * 0.115);

  const parsedUnits = parseInt(unitsToBuy, 10) || 0;
  const totalCost = parsedUnits * sharePrice;

  // Filter share transactions
  const shareTx = myTransactions.filter((t) => t.type === 'share_contribution');

  const handleBuy = async () => {
    if (parsedUnits <= 0) {
      Alert.alert('Invalid Units', 'Please enter at least 1 share unit.');
      return;
    }

    if (paymentMethod === 'savings_deduction') {
      const savBal = savings?.currentBalance || 0;
      if (savBal < totalCost) {
        Alert.alert(
          'Insufficient Savings',
          `Your savings balance is ${formatCurrency(savBal)}. You need ${formatCurrency(totalCost)}.`
        );
        return;
      }
    }

    setBuyLoading(true);
    const res = await buyShares(parsedUnits, paymentMethod);
    setBuyLoading(false);

    if (res.success) {
      setBuyModalVisible(false);
      Alert.alert('Shares Purchased! 🎉', res.message);
    } else {
      Alert.alert('Purchase Failed', res.message);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="SACCO Shares Capital"
        subtitle="Institutional Ownership & Dividend Growth"
        onBack={onBack}
        rightAction={{
          icon: 'add-circle',
          color: COLORS.primary,
          onPress: () => setBuyModalVisible(true),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Shares Card */}
        <LinearGradient
          colors={['#4C1D95', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sharesCard}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.cardLabel}>TOTAL SHARE CAPITAL</Text>
              <Text style={styles.cardValue}>{formatCurrency(totalValue)}</Text>
            </View>
            <View style={styles.shareCountPill}>
              <Ionicons name="pie-chart" size={13} color="#DDD6FE" />
              <Text style={styles.shareCountText}>{totalShares} Shares Owned</Text>
            </View>
          </View>

          <View style={styles.complianceBox}>
            <View style={styles.complianceHeader}>
              <Text style={styles.complianceLabel}>Statutory Minimum Compliance</Text>
              <Text style={styles.complianceStatus}>
                {totalShares} / {minRequired} Required ({progressPercent}%)
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${progressPercent}%`,
                    backgroundColor: isCompliant ? '#34D399' : '#FCD34D',
                  },
                ]}
              />
            </View>
            <Text style={styles.complianceNote}>
              {isCompliant
                ? '✓ You meet the statutory shareholding threshold to vote at AGM.'
                : `Need ${minRequired - totalShares} more shares to qualify for full voting rights.`}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => setBuyModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color="#4C1D95" />
            <Text style={styles.buyBtnText}>Purchase More Shares</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Dividend & Stats Grid */}
        <View style={styles.statsRow}>
          <StatCard
            label="Share Unit Value"
            value={formatCurrency(sharePrice)}
            icon="pricetag-outline"
            color={COLORS.purple}
            subValue="Fixed Par Value"
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Est. Annual Dividend"
            value={formatCurrency(estimatedDividend)}
            icon="trending-up-outline"
            color={COLORS.accent}
            subValue="@ 11.5% Historical Rate"
          />
        </View>

        {/* Benefits Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Benefits of SACCO Share Capital</Text>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.benefitText}>Annual cash dividend payouts directly to your savings.</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.benefitText}>Democratic voting rights at the Annual General Meeting (AGM).</Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.accent} style={{ marginRight: 8 }} />
            <Text style={styles.benefitText}>Acts as secondary security guarantee for emergency borrowings.</Text>
          </View>
        </View>

        {/* Share Purchase History */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Share Contributions History</Text>
          <Text style={styles.sectionSubtitle}>
            Ledger of share capital purchases and allocations
          </Text>

          {shareTx.length === 0 ? (
            <EmptyState
              icon="pie-chart-outline"
              title="No Share Purchases"
              description="You have not purchased any additional shares yet."
              actionTitle="Buy First Shares"
              onAction={() => setBuyModalVisible(true)}
            />
          ) : (
            <View style={styles.historyList}>
              {shareTx.map((tx, idx) => (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    idx < shareTx.length - 1 && styles.txRowBorder,
                  ]}
                >
                  <View style={styles.txIcon}>
                    <Ionicons name="pie-chart" size={18} color={COLORS.purple} />
                  </View>
                  <View style={styles.txDetails}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txMeta}>
                      Ref: {tx.referenceNumber} • {formatDate(tx.date)}
                    </Text>
                  </View>
                  <View style={styles.txAmountBlock}>
                    <Text style={styles.txAmount}>{formatCurrency(tx.amount)}</Text>
                    <Badge label={tx.status} variant="success" size="sm" />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* BUY SHARES MODAL */}
      <CustomModal
        visible={buyModalVisible}
        onClose={() => setBuyModalVisible(false)}
        title="Purchase SACCO Shares"
        subtitle={`1 Share Unit = ${formatCurrency(sharePrice)}`}
      >
        <Text style={styles.modalSectionLabel}>1. SELECT UNITS TO BUY</Text>
        <InputField
          label="Number of Share Units"
          value={unitsToBuy}
          onChangeText={setUnitsToBuy}
          placeholder="e.g. 10"
          keyboardType="number-pad"
          iconName="pie-chart-outline"
          required
        />

        {/* Quick unit chips */}
        <View style={styles.chipsRow}>
          {[5, 10, 20, 50, 100].map((units) => (
            <TouchableOpacity
              key={units}
              style={styles.chip}
              onPress={() => setUnitsToBuy(units.toString())}
            >
              <Text style={styles.chipText}>{units} Units</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.modalSectionLabel, { marginTop: 12 }]}>2. SOURCE OF PAYMENT</Text>
        <View style={styles.methodsRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              paymentMethod === 'mpesa' && styles.methodCardActive,
            ]}
            onPress={() => setPaymentMethod('mpesa')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={20}
              color={paymentMethod === 'mpesa' ? '#15803D' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                paymentMethod === 'mpesa' && styles.methodTextActive,
              ]}
            >
              M-Pesa Express
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              paymentMethod === 'savings_deduction' && styles.methodCardActive,
            ]}
            onPress={() => setPaymentMethod('savings_deduction')}
          >
            <Ionicons
              name="wallet-outline"
              size={20}
              color={paymentMethod === 'savings_deduction' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                paymentMethod === 'savings_deduction' && styles.methodTextActive,
              ]}
            >
              From Savings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Total Cost Box */}
        <View style={styles.costBox}>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Cost per Unit:</Text>
            <Text style={styles.costVal}>{formatCurrency(sharePrice)}</Text>
          </View>
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Total Units:</Text>
            <Text style={styles.costVal}>{parsedUnits} Shares</Text>
          </View>
          <View style={styles.costDivider} />
          <View style={styles.costRow}>
            <Text style={styles.costTotalLabel}>Total Investment:</Text>
            <Text style={styles.costTotalVal}>{formatCurrency(totalCost)}</Text>
          </View>
        </View>

        <Button
          title={`Confirm Purchase (${formatCurrency(totalCost)})`}
          onPress={handleBuy}
          loading={buyLoading}
          variant="primary"
          size="lg"
          iconName="checkmark-circle"
          fullWidth
          style={{ marginTop: 14 }}
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
  sharesCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.medium,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DDD6FE',
    letterSpacing: 0.8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  shareCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 4,
  },
  shareCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DDD6FE',
  },
  complianceBox: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginVertical: 14,
  },
  complianceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  complianceLabel: {
    fontSize: 11,
    color: '#DDD6FE',
  },
  complianceStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  track: {
    height: 7,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  complianceNote: {
    fontSize: 10.5,
    color: '#E9D5FF',
    marginTop: 6,
    lineHeight: 14,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  buyBtnText: {
    color: '#4C1D95',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  historySection: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 10,
    marginTop: 2,
  },
  historyList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txDesc: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  txMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmountBlock: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: -8,
    marginBottom: 14,
  },
  chip: {
    flex: 1,
    paddingVertical: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  methodCardActive: {
    borderColor: COLORS.purple,
    backgroundColor: '#FAF5FF',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  methodTextActive: {
    color: COLORS.purple,
    fontWeight: '700',
  },
  costBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  costLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  costVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  costDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 6,
  },
  costTotalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  costTotalVal: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.purple,
  },
});


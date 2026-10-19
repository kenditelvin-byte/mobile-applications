import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { SavingsGrowthChart } from '../../components/common/SavingsGrowthChart';
import { EmptyState } from '../../components/common/EmptyState';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface SavingsScreenProps {
  onBack: () => void;
}

export const SavingsScreen: React.FC<SavingsScreenProps> = ({ onBack }) => {
  const { savings, myTransactions, depositSavings, withdrawSavings, isLoading } = useSACCO();

  const [depositModalVisible, setDepositModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState<'mpesa' | 'bank_transfer'>('mpesa');
  const [depositRef, setDepositRef] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  // Withdraw Form
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'mpesa' | 'bank_transfer'>('mpesa');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  // Filtering tabs: All, Deposits, Withdrawals
  const [filterTab, setFilterTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');

  const savingsTx = myTransactions.filter(
    (t) => t.type === 'deposit' || t.type === 'withdrawal'
  );

  const filteredTx = savingsTx.filter((t) => {
    if (filterTab === 'deposits') return t.type === 'deposit';
    if (filterTab === 'withdrawals') return t.type === 'withdrawal';
    return true;
  });

  const handleDeposit = async () => {
    const num = parseFloat(depositAmount.replace(/,/g, ''));
    if (isNaN(num) || num < 100) {
      Alert.alert('Invalid Amount', 'Minimum deposit is KES 100.');
      return;
    }

    setDepositLoading(true);
    const res = await depositSavings(num, depositMethod, depositRef.trim() || undefined);
    setDepositLoading(false);

    if (res.success) {
      setDepositModalVisible(false);
      setDepositAmount('');
      setDepositRef('');
      Alert.alert('Deposit Successful! 🎉', res.message);
    } else {
      Alert.alert('Deposit Failed', res.message);
    }
  };

  const handleWithdraw = async () => {
    const num = parseFloat(withdrawAmount.replace(/,/g, ''));
    if (isNaN(num) || num < 500) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is KES 500.');
      return;
    }
    if (!withdrawReason.trim()) {
      Alert.alert('Reason Required', 'Please specify the purpose of this withdrawal.');
      return;
    }

    setWithdrawLoading(true);
    const res = await withdrawSavings(num, withdrawMethod, withdrawReason.trim());
    setWithdrawLoading(false);

    if (res.success) {
      setWithdrawModalVisible(false);
      setWithdrawAmount('');
      setWithdrawReason('');
      Alert.alert('Withdrawal Processed', res.message);
    } else {
      Alert.alert('Withdrawal Failed', res.message);
    }
  };

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  return (
    <View style={styles.container}>
      <Header title="Savings Portfolio" subtitle="Member Deposit & Growth Account" onBack={onBack} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <LinearGradient
          colors={['#065F46', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.cardTop}>
            <Text style={styles.balanceLabel}>CURRENT SAVINGS BALANCE</Text>
            <View style={styles.interestBadge}>
              <Ionicons name="sparkles" size={12} color="#FEF08A" />
              <Text style={styles.interestBadgeText}>8.5% p.a. Rebate</Text>
            </View>
          </View>

          <Text style={styles.balanceAmount}>
            {formatCurrency(savings?.currentBalance || 0)}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Deposited</Text>
              <Text style={styles.statVal}>
                {formatCurrency(savings?.totalDeposited || 0)}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Withdrawn</Text>
              <Text style={styles.statVal}>
                {formatCurrency(savings?.totalWithdrawn || 0)}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: '#10B981' }]}
              onPress={() => setDepositModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Deposit Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.primaryActionBtn, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
              onPress={() => setWithdrawModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-up-circle-outline" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Growth visualization */}
        <SavingsGrowthChart currentBalance={savings?.currentBalance || 0} />

        {/* Savings Statements & History */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Savings Statement & History</Text>
            <Text style={styles.historyCount}>{filteredTx.length} Entries</Text>
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterTabs}>
            {(['all', 'deposits', 'withdrawals'] as const).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, filterTab === tab && styles.filterTabActive]}
                onPress={() => setFilterTab(tab)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    filterTab === tab && styles.filterTabTextActive,
                  ]}
                >
                  {tab === 'all'
                    ? 'All Activity'
                    : tab === 'deposits'
                    ? 'Deposits (+)'
                    : 'Withdrawals (-)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredTx.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No Savings Records"
              description="Make your first deposit to grow your savings balance and increase your loan limit."
              actionTitle="Deposit Now"
              onAction={() => setDepositModalVisible(true)}
            />
          ) : (
            <View style={styles.listContainer}>
              {filteredTx.map((tx, idx) => {
                const isDeposit = tx.type === 'deposit';
                return (
                  <View
                    key={tx.id}
                    style={[
                      styles.listItem,
                      idx < filteredTx.length - 1 && styles.listItemBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.itemIcon,
                        { backgroundColor: isDeposit ? '#ECFDF5' : '#FEE2E2' },
                      ]}
                    >
                      <Ionicons
                        name={isDeposit ? 'arrow-down' : 'arrow-up'}
                        size={18}
                        color={isDeposit ? COLORS.accentDark : COLORS.danger}
                      />
                    </View>

                    <View style={styles.itemInfo}>
                      <Text style={styles.itemDescription} numberOfLines={1}>
                        {tx.description}
                      </Text>
                      <Text style={styles.itemMeta}>
                        Ref: {tx.referenceNumber} • {formatDate(tx.date)} {tx.time}
                      </Text>
                      <Text style={styles.itemBalanceAfter}>
                        Balance: {formatCurrency(tx.balanceAfter)}
                      </Text>
                    </View>

                    <View style={styles.itemAmountBlock}>
                      <Text
                        style={[
                          styles.itemAmount,
                          { color: isDeposit ? COLORS.accentDark : COLORS.danger },
                        ]}
                      >
                        {isDeposit ? '+' : '-'} {formatCurrency(tx.amount)}
                      </Text>
                      <Badge
                        label={tx.status}
                        variant={tx.status === 'completed' ? 'success' : 'warning'}
                        size="sm"
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* DEPOSIT MODAL */}
      <CustomModal
        visible={depositModalVisible}
        onClose={() => setDepositModalVisible(false)}
        title="Deposit into Savings"
        subtitle="Funds reflect instantly in your SACCO account"
      >
        <Text style={styles.modalSectionLabel}>1. SELECT PAYMENT METHOD</Text>
        <View style={styles.methodsRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              depositMethod === 'mpesa' && styles.methodCardActive,
            ]}
            onPress={() => setDepositMethod('mpesa')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={depositMethod === 'mpesa' ? '#15803D' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                depositMethod === 'mpesa' && styles.methodTextActive,
              ]}
            >
              M-Pesa Express
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              depositMethod === 'bank_transfer' && styles.methodCardActive,
            ]}
            onPress={() => setDepositMethod('bank_transfer')}
          >
            <Ionicons
              name="business-outline"
              size={22}
              color={depositMethod === 'bank_transfer' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                depositMethod === 'bank_transfer' && styles.methodTextActive,
              ]}
            >
              Bank Wire
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.modalSectionLabel, { marginTop: 14 }]}>2. ENTER AMOUNT (KES)</Text>
        <InputField
          label="Deposit Amount"
          value={depositAmount}
          onChangeText={setDepositAmount}
          placeholder="e.g. 10000"
          keyboardType="numeric"
          iconName="cash-outline"
          required
        />

        {/* Quick Amount Chips */}
        <View style={styles.chipsRow}>
          {quickAmounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              style={styles.chip}
              onPress={() => setDepositAmount(amt.toString())}
            >
              <Text style={styles.chipText}>+{amt.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField
          label="Optional Reference Code / Notes"
          value={depositRef}
          onChangeText={setDepositRef}
          placeholder="e.g. Salary contribution"
          iconName="document-text-outline"
        />

        <Button
          title="Confirm & Deposit"
          onPress={handleDeposit}
          loading={depositLoading}
          variant="accent"
          size="lg"
          iconName="checkmark-circle"
          fullWidth
          style={{ marginTop: 10 }}
        />
      </CustomModal>

      {/* WITHDRAWAL MODAL */}
      <CustomModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        title="Withdraw from Savings"
        subtitle="Transfer funds to your mobile wallet or bank account"
      >
        <Text style={styles.modalSectionLabel}>1. DESTINATION ACCOUNT</Text>
        <View style={styles.methodsRow}>
          <TouchableOpacity
            style={[
              styles.methodCard,
              withdrawMethod === 'mpesa' && styles.methodCardActive,
            ]}
            onPress={() => setWithdrawMethod('mpesa')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={22}
              color={withdrawMethod === 'mpesa' ? '#15803D' : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                withdrawMethod === 'mpesa' && styles.methodTextActive,
              ]}
            >
              M-Pesa Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.methodCard,
              withdrawMethod === 'bank_transfer' && styles.methodCardActive,
            ]}
            onPress={() => setWithdrawMethod('bank_transfer')}
          >
            <Ionicons
              name="business-outline"
              size={22}
              color={withdrawMethod === 'bank_transfer' ? COLORS.primary : COLORS.textMuted}
            />
            <Text
              style={[
                styles.methodText,
                withdrawMethod === 'bank_transfer' && styles.methodTextActive,
              ]}
            >
              Bank Account
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.modalSectionLabel, { marginTop: 14 }]}>2. WITHDRAWAL DETAILS</Text>
        <InputField
          label="Withdrawal Amount (KES)"
          value={withdrawAmount}
          onChangeText={setWithdrawAmount}
          placeholder="e.g. 5000"
          keyboardType="numeric"
          iconName="cash-outline"
          helperText={`Available balance: ${formatCurrency(savings?.currentBalance || 0)}`}
          required
        />

        <InputField
          label="Purpose / Reason for Withdrawal"
          value={withdrawReason}
          onChangeText={setWithdrawReason}
          placeholder="e.g. Medical, utility bill, tuition"
          iconName="help-circle-outline"
          required
        />

        <View style={styles.policyNotice}>
          <Ionicons name="information-circle" size={18} color="#0284C7" style={{ marginRight: 6 }} />
          <Text style={styles.policyText}>
            Savings locked as collateral for active loans cannot be withdrawn until the loan is fully repaid.
          </Text>
        </View>

        <Button
          title="Process Withdrawal"
          onPress={handleWithdraw}
          loading={withdrawLoading}
          variant="danger"
          size="lg"
          iconName="arrow-up-circle"
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
  balanceCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.medium,
    marginBottom: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D1FAE5',
    letterSpacing: 0.8,
  },
  interestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  interestBadgeText: {
    color: '#FEF08A',
    fontSize: 10.5,
    fontWeight: '700',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 10,
    letterSpacing: -0.5,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginVertical: 10,
  },
  statCol: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 12,
  },
  statLabel: {
    fontSize: 10.5,
    color: '#D1FAE5',
  },
  statVal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  historySection: {
    marginTop: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  historyCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    padding: 3,
    marginBottom: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    ...SHADOWS.small,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemBalanceAfter: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  itemAmountBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  itemAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  methodsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  methodCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  methodCardActive: {
    borderColor: COLORS.accentDark,
    backgroundColor: '#F0FDF4',
  },
  methodText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  methodTextActive: {
    color: COLORS.accentDark,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
    marginTop: -8,
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  policyText: {
    fontSize: 11,
    color: '#0369A1',
    flex: 1,
    lineHeight: 15,
  },
});

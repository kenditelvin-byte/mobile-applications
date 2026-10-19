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
import { EmptyState } from '../../components/common/EmptyState';
import { Loan } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface RepaymentScreenProps {
  onBack: () => void;
  initialLoan?: Loan;
}

export const RepaymentScreen: React.FC<RepaymentScreenProps> = ({ onBack, initialLoan }) => {
  const {
    myLoans,
    myRepayments,
    savings,
    makeLoanRepayment,
  } = useSACCO();

  const activeLoans = myLoans.filter((l) => l.status === 'active');
  const [selectedLoanId, setSelectedLoanId] = useState<string>(
    initialLoan?.id || activeLoans[0]?.id || ''
  );

  const selectedLoan = activeLoans.find((l) => l.id === selectedLoanId) || activeLoans[0];

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'bank_transfer' | 'savings_deduction'>('mpesa');
  const [amount, setAmount] = useState<string>(
    selectedLoan ? selectedLoan.monthlyInstallment.toString() : ''
  );
  const [loading, setLoading] = useState(false);

  const parsedAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const currentOutstanding = selectedLoan?.outstandingBalance || 0;
  const remainingAfterPayment = Math.max(0, currentOutstanding - parsedAmount);

  const handleRepay = async () => {
    if (!selectedLoan) {
      Alert.alert('No Loan Selected', 'Please select an active loan to repay.');
      return;
    }
    if (parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid repayment amount.');
      return;
    }
    if (parsedAmount > currentOutstanding) {
      Alert.alert(
        'Excess Amount',
        `The amount entered exceeds the total outstanding balance of ${formatCurrency(currentOutstanding)}.`
      );
      return;
    }

    if (paymentMethod === 'savings_deduction') {
      const savBal = savings?.currentBalance || 0;
      if (savBal < parsedAmount) {
        Alert.alert(
          'Insufficient Savings',
          `Your savings balance is ${formatCurrency(savBal)}. You cannot deduct ${formatCurrency(parsedAmount)}.`
        );
        return;
      }
    }

    setLoading(true);
    const res = await makeLoanRepayment(selectedLoan.id, parsedAmount, paymentMethod);
    setLoading(false);

    if (res.success) {
      Alert.alert('Repayment Successful! 🎉', res.message);
      setAmount('');
    } else {
      Alert.alert('Repayment Failed', res.message);
    }
  };

  const handleSelectQuickAmount = (type: 'installment' | 'half' | 'full') => {
    if (!selectedLoan) return;
    if (type === 'installment') {
      setAmount(Math.min(selectedLoan.monthlyInstallment, selectedLoan.outstandingBalance).toString());
    } else if (type === 'half') {
      setAmount(Math.round(selectedLoan.monthlyInstallment / 2).toString());
    } else if (type === 'full') {
      setAmount(selectedLoan.outstandingBalance.toString());
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Loan Repayment"
        subtitle="Manage & Settle Active Installments"
        onBack={onBack}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeLoans.length === 0 ? (
          <EmptyState
            icon="checkmark-done-circle"
            title="All Loans Cleared!"
            description="You do not have any active loans pending repayment. Your credit score is excellent."
            actionTitle="Go to Loans"
            onAction={onBack}
          />
        ) : (
          <>
            {/* Active loan selector */}
            {activeLoans.length > 1 && (
              <View style={styles.selectorSection}>
                <Text style={styles.sectionLabel}>SELECT LOAN TO REPAY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.loansScroll}>
                  {activeLoans.map((l) => (
                    <TouchableOpacity
                      key={l.id}
                      style={[
                        styles.loanPill,
                        selectedLoanId === l.id && styles.loanPillActive,
                      ]}
                      onPress={() => {
                        setSelectedLoanId(l.id);
                        setAmount(l.monthlyInstallment.toString());
                      }}
                    >
                      <Text
                        style={[
                          styles.loanPillText,
                          selectedLoanId === l.id && styles.loanPillTextActive,
                        ]}
                      >
                        {l.productName} ({l.loanNumber})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selected Loan Overview Card */}
            {selectedLoan && (
              <LinearGradient
                colors={['#78350F', '#B45309']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.summaryCard}
              >
                <View style={styles.summaryTop}>
                  <View>
                    <Text style={styles.summarySub}>{selectedLoan.productName}</Text>
                    <Text style={styles.summaryTitle}>{selectedLoan.loanNumber}</Text>
                  </View>
                  <View style={styles.duePill}>
                    <Ionicons name="time" size={13} color="#FEF3C7" />
                    <Text style={styles.duePillText}>
                      Due: {formatDate(selectedLoan.nextRepaymentDate || '')}
                    </Text>
                  </View>
                </View>

                <View style={styles.balanceRow}>
                  <View>
                    <Text style={styles.balanceLabel}>OUTSTANDING BALANCE</Text>
                    <Text style={styles.balanceVal}>
                      {formatCurrency(selectedLoan.outstandingBalance)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.balanceLabel}>INSTALLMENT</Text>
                    <Text style={styles.installmentVal}>
                      {formatCurrency(selectedLoan.monthlyInstallment)}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            )}

            {/* Repayment Form Card */}
            <View style={styles.formCard}>
              <Text style={styles.formSectionHeader}>1. PAYMENT METHOD</Text>

              <View style={styles.methodList}>
                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'mpesa' && styles.methodOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('mpesa')}
                >
                  <View style={styles.methodLeft}>
                    <Ionicons
                      name="phone-portrait"
                      size={20}
                      color={paymentMethod === 'mpesa' ? '#15803D' : COLORS.textMuted}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.methodTitle}>M-Pesa Express</Text>
                      <Text style={styles.methodDesc}>Instant STK push notification to phone</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={paymentMethod === 'mpesa' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={paymentMethod === 'mpesa' ? COLORS.primary : COLORS.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'savings_deduction' && styles.methodOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('savings_deduction')}
                >
                  <View style={styles.methodLeft}>
                    <Ionicons
                      name="wallet"
                      size={20}
                      color={paymentMethod === 'savings_deduction' ? COLORS.primary : COLORS.textMuted}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.methodTitle}>Deduct from Savings Balance</Text>
                      <Text style={styles.methodDesc}>
                        Available: {formatCurrency(savings?.currentBalance || 0)}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name={paymentMethod === 'savings_deduction' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={paymentMethod === 'savings_deduction' ? COLORS.primary : COLORS.textMuted}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.methodOption,
                    paymentMethod === 'bank_transfer' && styles.methodOptionActive,
                  ]}
                  onPress={() => setPaymentMethod('bank_transfer')}
                >
                  <View style={styles.methodLeft}>
                    <Ionicons
                      name="business"
                      size={20}
                      color={paymentMethod === 'bank_transfer' ? COLORS.secondary : COLORS.textMuted}
                    />
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.methodTitle}>Bank Wire / Standing Order</Text>
                      <Text style={styles.methodDesc}>Direct bank settlement</Text>
                    </View>
                  </View>
                  <Ionicons
                    name={paymentMethod === 'bank_transfer' ? 'radio-button-on' : 'radio-button-off'}
                    size={18}
                    color={paymentMethod === 'bank_transfer' ? COLORS.primary : COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={[styles.formSectionHeader, { marginTop: 18 }]}>2. REPAYMENT AMOUNT</Text>

              {/* Quick option buttons */}
              <View style={styles.quickOptionsRow}>
                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => handleSelectQuickAmount('installment')}
                >
                  <Text style={styles.quickBtnText}>Full Installment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => handleSelectQuickAmount('half')}
                >
                  <Text style={styles.quickBtnText}>50% Installment</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.quickBtn}
                  onPress={() => handleSelectQuickAmount('full')}
                >
                  <Text style={styles.quickBtnText}>Clear Full Loan</Text>
                </TouchableOpacity>
              </View>

              <InputField
                label="Amount to Pay (KES)"
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g. 13750"
                keyboardType="numeric"
                iconName="cash-outline"
                required
              />

              {/* Live Preview Box */}
              {parsedAmount > 0 && selectedLoan && (
                <View style={styles.previewBox}>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Current Balance:</Text>
                    <Text style={styles.previewVal}>
                      {formatCurrency(selectedLoan.outstandingBalance)}
                    </Text>
                  </View>
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabel}>Payment Amount:</Text>
                    <Text style={[styles.previewVal, { color: COLORS.accentDark }]}>
                      - {formatCurrency(parsedAmount)}
                    </Text>
                  </View>
                  <View style={styles.previewDivider} />
                  <View style={styles.previewRow}>
                    <Text style={styles.previewLabelBold}>Remaining Balance:</Text>
                    <Text style={styles.previewValBold}>
                      {formatCurrency(remainingAfterPayment)}
                    </Text>
                  </View>
                  {remainingAfterPayment === 0 && (
                    <View style={styles.clearedBadge}>
                      <Ionicons name="sparkles" size={14} color="#15803D" />
                      <Text style={styles.clearedText}>This payment will fully settle the loan!</Text>
                    </View>
                  )}
                </View>
              )}

              <Button
                title={`Pay ${formatCurrency(parsedAmount || 0)}`}
                onPress={handleRepay}
                loading={loading}
                variant="accent"
                size="lg"
                iconName="lock-closed"
                fullWidth
                style={{ marginTop: 14 }}
              />
            </View>

            {/* Repayments History */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Repayment History</Text>
              <Text style={styles.sectionSubtitle}>
                Verified payments recorded for your loans
              </Text>

              {myRepayments.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="repeat-outline" size={26} color={COLORS.textMuted} />
                  <Text style={styles.emptyText}>No repayment history yet.</Text>
                </View>
              ) : (
                <View style={styles.repayList}>
                  {myRepayments.map((rep, idx) => (
                    <View
                      key={rep.id}
                      style={[
                        styles.repayRow,
                        idx < myRepayments.length - 1 && styles.repayRowBorder,
                      ]}
                    >
                      <View style={styles.repayIconCircle}>
                        <Ionicons name="checkmark-done" size={18} color={COLORS.accentDark} />
                      </View>
                      <View style={styles.repayInfo}>
                        <Text style={styles.repayTitle}>
                          Loan #{rep.loanNumber}
                        </Text>
                        <Text style={styles.repayMeta}>
                          {formatDate(rep.date)} • Ref: {rep.referenceNumber}
                        </Text>
                        {rep.notes && (
                          <Text style={styles.repayNotes}>{rep.notes}</Text>
                        )}
                      </View>
                      <View style={styles.repayAmountCol}>
                        <Text style={styles.repayAmount}>
                          {formatCurrency(rep.amount)}
                        </Text>
                        <Text style={styles.repayRemaining}>
                          Bal: {formatCurrency(rep.remainingBalance)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
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
  selectorSection: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  loansScroll: {
    flexDirection: 'row',
  },
  loanPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    marginRight: 8,
  },
  loanPillActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  loanPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  loanPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  summaryCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 18,
    ...SHADOWS.medium,
    marginBottom: 16,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summarySub: {
    fontSize: 12,
    color: '#FEF3C7',
    fontWeight: '600',
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  duePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FEF3C7',
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FDE68A',
    letterSpacing: 0.6,
  },
  balanceVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 2,
  },
  installmentVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
    marginBottom: 20,
  },
  formSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  methodList: {
    gap: 8,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  methodOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F8FAFC',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  methodDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  quickOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
  previewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -4,
    marginBottom: 10,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  previewLabel: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
  },
  previewVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  previewDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 6,
  },
  previewLabelBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  previewValBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  clearedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 6,
    borderRadius: 6,
    marginTop: 8,
    gap: 6,
  },
  clearedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
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
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 8,
  },
  repayList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  repayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  repayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  repayIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  repayInfo: {
    flex: 1,
  },
  repayTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  repayMeta: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  repayNotes: {
    fontSize: 10.5,
    color: COLORS.secondary,
    marginTop: 1,
  },
  repayAmountCol: {
    alignItems: 'flex-end',
  },
  repayAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  repayRemaining: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});


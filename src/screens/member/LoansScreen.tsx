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
import { EmptyState } from '../../components/common/EmptyState';
import { Loan, LoanRepaymentFrequency, SACCOProduct } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface LoansScreenProps {
  onBack: () => void;
  onNavigateToRepay: (loan?: Loan) => void;
}

export const LoansScreen: React.FC<LoansScreenProps> = ({ onBack, onNavigateToRepay }) => {
  const {
    myLoans,
    products,
    availableLoanLimit,
    applyForLoan,
    isLoading,
  } = useSACCO();

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedLoanDetail, setSelectedLoanDetail] = useState<Loan | null>(null);

  // Application Form State
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || 'prod-normal'
  );
  const [requestedAmount, setRequestedAmount] = useState('50000');
  const [durationMonths, setDurationMonths] = useState('12');
  const [frequency, setFrequency] = useState<LoanRepaymentFrequency>('monthly');
  const [purpose, setPurpose] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // Selected product object
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Real-time calculations
  const parsedAmount = parseFloat(requestedAmount.replace(/,/g, '')) || 0;
  const parsedDuration = parseInt(durationMonths, 10) || 12;
  const annualRate = (selectedProduct?.interestRate || 10) / 100;
  const calculatedInterest = Math.round(parsedAmount * annualRate * (parsedDuration / 12));
  const calculatedTotal = parsedAmount + calculatedInterest;
  const calculatedInstallment = parsedDuration > 0 ? Math.round(calculatedTotal / parsedDuration) : 0;

  // Active & Pending vs Completed Loans
  const activeAndPendingLoans = myLoans.filter(
    (l) => l.status === 'active' || l.status === 'pending' || l.status === 'approved'
  );
  const pastLoans = myLoans.filter(
    (l) => l.status === 'completed' || l.status === 'rejected'
  );

  const handleApply = async () => {
    if (parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please specify a valid loan amount.');
      return;
    }
    if (parsedAmount > availableLoanLimit) {
      Alert.alert(
        'Limit Exceeded',
        `Your borrowing limit is ${formatCurrency(availableLoanLimit)}. Deposit more savings to qualify for higher amounts.`
      );
      return;
    }
    if (!purpose.trim()) {
      Alert.alert('Purpose Required', 'Please enter the purpose of this loan.');
      return;
    }

    setApplyLoading(true);
    const res = await applyForLoan(
      selectedProductId,
      parsedAmount,
      parsedDuration,
      frequency,
      purpose.trim()
    );
    setApplyLoading(false);

    if (res.success) {
      setApplyModalVisible(false);
      setPurpose('');
      Alert.alert(
        'Application Submitted! 📋',
        res.message,
        [{ text: 'Understood' }]
      );
    } else {
      Alert.alert('Application Error', res.message);
    }
  };

  const getStatusVariant = (status: Loan['status']) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Loan Management"
        subtitle="Borrowing Portfolio & Credit Facilities"
        onBack={onBack}
        rightAction={{
          icon: 'add-circle',
          color: COLORS.primary,
          onPress: () => setApplyModalVisible(true),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Loan Limit Card */}
        <LinearGradient
          colors={['#1E3A5F', '#0F2942']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.limitCard}
        >
          <View style={styles.limitHeader}>
            <View>
              <Text style={styles.limitLabel}>AVAILABLE BORROWING LIMIT</Text>
              <Text style={styles.limitAmount}>{formatCurrency(availableLoanLimit)}</Text>
            </View>
            <TouchableOpacity
              style={styles.applyPill}
              onPress={() => setApplyModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="flash" size={14} color="#0F2942" />
              <Text style={styles.applyPillText}>Apply Loan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.limitFooter}>
            <Ionicons name="information-circle-outline" size={15} color="#93C5FD" />
            <Text style={styles.limitFooterText}>
              Limit is calculated at 3× your savings minus active loans.
            </Text>
          </View>
        </LinearGradient>

        {/* Section: Active & Pending Loans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active & Pending Loans</Text>
          <Text style={styles.sectionCount}>{activeAndPendingLoans.length} Loans</Text>
        </View>

        {activeAndPendingLoans.length === 0 ? (
          <EmptyState
            icon="cash-outline"
            title="No Active Loans"
            description="You do not have any active loans. You can apply for development, emergency, or education facilities."
            actionTitle="Apply for a Loan"
            onAction={() => setApplyModalVisible(true)}
          />
        ) : (
          activeAndPendingLoans.map((loan) => {
            const progress =
              loan.totalRepayment > 0
                ? Math.min(100, Math.round((loan.amountRepaid / loan.totalRepayment) * 100))
                : 0;

            return (
              <TouchableOpacity
                key={loan.id}
                style={styles.loanCard}
                onPress={() => setSelectedLoanDetail(loan)}
                activeOpacity={0.8}
              >
                <View style={styles.loanCardHeader}>
                  <View>
                    <Text style={styles.loanProductName}>{loan.productName}</Text>
                    <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                  </View>
                  <Badge label={loan.status} variant={getStatusVariant(loan.status)} />
                </View>

                <View style={styles.loanNumbersGrid}>
                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Borrowed</Text>
                    <Text style={styles.numberVal}>
                      {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                    </Text>
                  </View>

                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Outstanding</Text>
                    <Text style={[styles.numberVal, { color: COLORS.danger }]}>
                      {formatCurrency(loan.outstandingBalance)}
                    </Text>
                  </View>

                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Installment</Text>
                    <Text style={styles.numberVal}>
                      {formatCurrency(loan.monthlyInstallment)}/mo
                    </Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Repayment Progress</Text>
                    <Text style={styles.progressPercent}>{progress}%</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                  </View>
                </View>

                <View style={styles.loanCardFooter}>
                  <View style={styles.footerDate}>
                    <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
                    <Text style={styles.footerDateText}>
                      Next Due: {formatDate(loan.nextRepaymentDate || '') || 'Pending Approval'}
                    </Text>
                  </View>

                  {loan.status === 'active' && (
                    <TouchableOpacity
                      style={styles.cardPayBtn}
                      onPress={() => onNavigateToRepay(loan)}
                    >
                      <Text style={styles.cardPayBtnText}>Make Repayment</Text>
                      <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Section: Past Loan History */}
        {pastLoans.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Loan History</Text>
              <Text style={styles.sectionCount}>{pastLoans.length} Settled</Text>
            </View>

            {pastLoans.map((loan) => (
              <TouchableOpacity
                key={loan.id}
                style={[styles.loanCard, { opacity: 0.85 }]}
                onPress={() => setSelectedLoanDetail(loan)}
              >
                <View style={styles.loanCardHeader}>
                  <View>
                    <Text style={styles.loanProductName}>{loan.productName}</Text>
                    <Text style={styles.loanNumber}>{loan.loanNumber}</Text>
                  </View>
                  <Badge label={loan.status} variant={getStatusVariant(loan.status)} />
                </View>
                <View style={styles.loanNumbersGrid}>
                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Amount</Text>
                    <Text style={styles.numberVal}>
                      {formatCurrency(loan.approvedAmount || loan.requestedAmount)}
                    </Text>
                  </View>
                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Total Repaid</Text>
                    <Text style={[styles.numberVal, { color: COLORS.accentDark }]}>
                      {formatCurrency(loan.amountRepaid)}
                    </Text>
                  </View>
                  <View style={styles.numberItem}>
                    <Text style={styles.numberLabel}>Closed Date</Text>
                    <Text style={styles.numberVal}>
                      {formatDate(loan.dateCompleted || loan.dateApplied)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* SACCO Available Loan Products List */}
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionTitle}>SACCO Credit Products</Text>
          <Text style={styles.sectionSubtitle}>
            Choose from low-interest member financing solutions
          </Text>

          {products.map((prod) => (
            <View key={prod.id} style={styles.productCard}>
              <View style={styles.prodTop}>
                <View style={styles.prodIconCircle}>
                  <Ionicons name="cash" size={20} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.prodName}>{prod.name}</Text>
                  <Text style={styles.prodRate}>{prod.interestRate}% p.a. Reducing Rate</Text>
                </View>
                <TouchableOpacity
                  style={styles.prodApplyBtn}
                  onPress={() => {
                    setSelectedProductId(prod.id);
                    setApplyModalVisible(true);
                  }}
                >
                  <Text style={styles.prodApplyText}>Select</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.prodDesc}>{prod.description}</Text>
              <View style={styles.prodMetaRow}>
                <Text style={styles.prodMetaText}>
                  Limit: {formatCurrency(prod.minAmount)} - {formatCurrency(prod.maxAmount)}
                </Text>
                <Text style={styles.prodMetaText}>
                  Tenure: {prod.minDurationMonths} - {prod.maxDurationMonths} mos
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* LOAN APPLICATION MODAL */}
      <CustomModal
        visible={applyModalVisible}
        onClose={() => setApplyModalVisible(false)}
        title="Apply for a SACCO Loan"
        subtitle="Instant qualification calculation & transparent terms"
      >
        {/* Product selector chips */}
        <Text style={styles.modalSectionLabel}>1. SELECT PRODUCT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.prodScroll}>
          {products.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.prodChip,
                selectedProductId === p.id && styles.prodChipActive,
              ]}
              onPress={() => setSelectedProductId(p.id)}
            >
              <Text
                style={[
                  styles.prodChipText,
                  selectedProductId === p.id && styles.prodChipTextActive,
                ]}
              >
                {p.name} ({p.interestRate}%)
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.modalSectionLabel, { marginTop: 14 }]}>2. LOAN DETAILS</Text>

        <InputField
          label="Requested Principal Amount (KES)"
          value={requestedAmount}
          onChangeText={setRequestedAmount}
          placeholder="e.g. 100000"
          keyboardType="numeric"
          iconName="cash-outline"
          helperText={`Your max eligible limit: ${formatCurrency(availableLoanLimit)}`}
          required
        />

        <View style={styles.formRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <InputField
              label="Tenure (Months)"
              value={durationMonths}
              onChangeText={setDurationMonths}
              placeholder="e.g. 12"
              keyboardType="number-pad"
              iconName="time-outline"
              required
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <View style={{ marginBottom: 6 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.textPrimary }}>
                Frequency
              </Text>
            </View>
            <View style={styles.freqRow}>
              {(['monthly', 'bi-weekly'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.freqBtn,
                    frequency === f && styles.freqBtnActive,
                  ]}
                  onPress={() => setFrequency(f)}
                >
                  <Text
                    style={[
                      styles.freqBtnText,
                      frequency === f && styles.freqBtnTextActive,
                    ]}
                  >
                    {f === 'monthly' ? 'Monthly' : 'Bi-Wk'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <InputField
          label="Purpose of Loan"
          value={purpose}
          onChangeText={setPurpose}
          placeholder="e.g. Business inventory, hospital bill, school tuition"
          iconName="briefcase-outline"
          required
        />

        {/* REAL-TIME LOAN CALCULATOR CARD */}
        <View style={styles.calculatorCard}>
          <View style={styles.calcTitleRow}>
            <Ionicons name="calculator" size={16} color={COLORS.primary} />
            <Text style={styles.calcTitle}>Loan Repayment Summary</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Principal Borrowed:</Text>
            <Text style={styles.calcVal}>{formatCurrency(parsedAmount)}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Interest Rate:</Text>
            <Text style={styles.calcVal}>{selectedProduct.interestRate}% Annual</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Calculated Interest:</Text>
            <Text style={styles.calcVal}>{formatCurrency(calculatedInterest)}</Text>
          </View>

          <View style={styles.calcDivider} />

          <View style={styles.calcRow}>
            <Text style={styles.calcLabelBold}>Total Repayment:</Text>
            <Text style={styles.calcValBold}>{formatCurrency(calculatedTotal)}</Text>
          </View>

          <View style={styles.calcHighlightBox}>
            <Text style={styles.calcHighlightLabel}>Estimated Monthly Installment:</Text>
            <Text style={styles.calcHighlightVal}>{formatCurrency(calculatedInstallment)}/mo</Text>
          </View>
        </View>

        <Button
          title="Submit Loan Application"
          onPress={handleApply}
          loading={applyLoading}
          variant="primary"
          size="lg"
          iconName="send-outline"
          fullWidth
          style={{ marginTop: 14 }}
        />
      </CustomModal>

      {/* LOAN DETAIL / SCHEDULE MODAL */}
      {selectedLoanDetail && (
        <CustomModal
          visible={!!selectedLoanDetail}
          onClose={() => setSelectedLoanDetail(null)}
          title={`Loan Details #${selectedLoanDetail.loanNumber}`}
          subtitle={selectedLoanDetail.productName}
        >
          <View style={styles.detailHeader}>
            <Badge
              label={selectedLoanDetail.status}
              variant={getStatusVariant(selectedLoanDetail.status)}
            />
            <Text style={styles.detailPurpose}>Purpose: {selectedLoanDetail.purpose}</Text>
          </View>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Amount Requested</Text>
              <Text style={styles.detailItemVal}>
                {formatCurrency(selectedLoanDetail.requestedAmount)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Amount Approved</Text>
              <Text style={styles.detailItemVal}>
                {formatCurrency(selectedLoanDetail.approvedAmount || selectedLoanDetail.requestedAmount)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Total Repayment</Text>
              <Text style={styles.detailItemVal}>
                {formatCurrency(selectedLoanDetail.totalRepayment)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Amount Repaid</Text>
              <Text style={[styles.detailItemVal, { color: COLORS.accentDark }]}>
                {formatCurrency(selectedLoanDetail.amountRepaid)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Outstanding Balance</Text>
              <Text style={[styles.detailItemVal, { color: COLORS.danger }]}>
                {formatCurrency(selectedLoanDetail.outstandingBalance)}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Monthly Installment</Text>
              <Text style={styles.detailItemVal}>
                {formatCurrency(selectedLoanDetail.monthlyInstallment)}
              </Text>
            </View>
          </View>

          {/* Dates list */}
          <View style={styles.datesList}>
            <Text style={styles.datesLine}>• Date Applied: {formatDate(selectedLoanDetail.dateApplied)}</Text>
            {selectedLoanDetail.dateApproved && (
              <Text style={styles.datesLine}>• Date Approved: {formatDate(selectedLoanDetail.dateApproved)}</Text>
            )}
            {selectedLoanDetail.nextRepaymentDate && (
              <Text style={styles.datesLine}>• Next Repayment Due: {formatDate(selectedLoanDetail.nextRepaymentDate)}</Text>
            )}
            {selectedLoanDetail.rejectionReason && (
              <Text style={[styles.datesLine, { color: COLORS.danger }]}>
                • Rejection Reason: {selectedLoanDetail.rejectionReason}
              </Text>
            )}
          </View>

          {selectedLoanDetail.status === 'active' && (
            <Button
              title="Make Repayment for this Loan"
              onPress={() => {
                const target = selectedLoanDetail;
                setSelectedLoanDetail(null);
                onNavigateToRepay(target);
              }}
              variant="accent"
              size="lg"
              fullWidth
              style={{ marginTop: 14 }}
            />
          )}
        </CustomModal>
      )}
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
  limitCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.medium,
    marginBottom: 18,
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#93C5FD',
    letterSpacing: 0.8,
  },
  limitAmount: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  applyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#67E8F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  applyPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F2942',
  },
  limitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  limitFooterText: {
    fontSize: 11,
    color: '#CBD5E1',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  sectionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  loanCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...SHADOWS.small,
  },
  loanCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  loanProductName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  loanNumber: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  loanNumbersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: BORDER_RADIUS.md,
    padding: 12,
    marginBottom: 12,
  },
  numberItem: {
    flex: 1,
  },
  numberLabel: {
    fontSize: 10.5,
    color: COLORS.textSecondary,
  },
  numberVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 4,
  },
  loanCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  footerDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerDateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  cardPayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accentDark,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  cardPayBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  productCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  prodTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prodIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prodName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  prodRate: {
    fontSize: 11.5,
    color: COLORS.accentDark,
    fontWeight: '600',
    marginTop: 1,
  },
  prodApplyBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  prodApplyText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  prodDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    lineHeight: 16,
  },
  prodMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  prodMetaText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  prodScroll: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  prodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    backgroundColor: '#FFFFFF',
    marginRight: 8,
  },
  prodChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  prodChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  prodChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
  },
  freqRow: {
    flexDirection: 'row',
    height: 48,
    gap: 6,
  },
  freqBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
  },
  freqBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  freqBtnText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  freqBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  calculatorCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  calcTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  calcTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  calcLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  calcVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  calcLabelBold: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  calcValBold: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  calcDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: 6,
  },
  calcHighlightBox: {
    backgroundColor: '#ECFDF5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  calcHighlightLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#065F46',
  },
  calcHighlightVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#065F46',
  },
  detailHeader: {
    marginBottom: 12,
  },
  detailPurpose: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginVertical: 10,
  },
  detailItem: {
    width: '47%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
  },
  detailItemLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  detailItemVal: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  datesList: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  datesLine: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
});


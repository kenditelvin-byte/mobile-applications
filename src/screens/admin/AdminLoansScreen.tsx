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
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { EmptyState } from '../../components/common/EmptyState';
import { Loan, LoanStatus } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface AdminLoansScreenProps {
  onBack: () => void;
}

export const AdminLoansScreen: React.FC<AdminLoansScreenProps> = ({ onBack }) => {
  const { allLoans, approveLoan, rejectLoan } = useSACCO();

  const [statusFilter, setStatusFilter] = useState<'all' | LoanStatus>('all');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // Review Form
  const [approvedAmount, setApprovedAmount] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewMode, setReviewMode] = useState<'view' | 'approve' | 'reject'>('view');
  const [actionLoading, setActionLoading] = useState(false);

  const filteredLoans = allLoans.filter((l) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    return true;
  });

  const openLoanModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setApprovedAmount(loan.requestedAmount.toString());
    setAdminNotes('Credit risk assessed and qualified by committee.');
    setRejectionReason('Insufficient savings collateral / high existing debt ratio.');
    setReviewMode('view');
  };

  const handleConfirmApproval = async () => {
    if (!selectedLoan) return;
    const num = parseFloat(approvedAmount.replace(/,/g, ''));
    if (isNaN(num) || num <= 0) {
      Alert.alert('Invalid Amount', 'Please provide a valid approved loan amount.');
      return;
    }

    setActionLoading(true);
    const res = await approveLoan(selectedLoan.id, num, adminNotes);
    setActionLoading(false);

    if (res.success) {
      setSelectedLoan(null);
      Alert.alert('Loan Approved & Disbursed! 🎉', res.message);
    } else {
      Alert.alert('Approval Error', res.message);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedLoan) return;
    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a justification for rejecting this loan.');
      return;
    }

    setActionLoading(true);
    const res = await rejectLoan(selectedLoan.id, rejectionReason.trim());
    setActionLoading(false);

    if (res.success) {
      setSelectedLoan(null);
      Alert.alert('Application Rejected', res.message);
    } else {
      Alert.alert('Action Error', res.message);
    }
  };

  const getStatusVariant = (status: LoanStatus) => {
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
        title="Loan Applications Desk"
        subtitle="Credit Appraisal & Disbursal Committee"
        onBack={onBack}
      />

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {(['all', 'pending', 'active', 'completed', 'rejected'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, statusFilter === tab && styles.filterChipActive]}
              onPress={() => setStatusFilter(tab)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  statusFilter === tab && styles.filterChipTextActive,
                ]}
              >
                {tab === 'all' ? 'All Loans' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredLoans.length === 0 ? (
          <EmptyState
            icon="cash-outline"
            title="No Loans in Queue"
            description="There are currently no loan applications matching this filter."
          />
        ) : (
          filteredLoans.map((loan) => (
            <TouchableOpacity
              key={loan.id}
              style={styles.loanCard}
              onPress={() => openLoanModal(loan)}
              activeOpacity={0.8}
            >
              <View style={styles.loanHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{loan.memberName}</Text>
                  <Text style={styles.memberMeta}>
                    {loan.memberNumber} • {loan.productName}
                  </Text>
                </View>
                <Badge label={loan.status} variant={getStatusVariant(loan.status)} />
              </View>

              <View style={styles.loanMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Requested</Text>
                  <Text style={styles.metricVal}>{formatCurrency(loan.requestedAmount)}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Duration</Text>
                  <Text style={styles.metricVal}>{loan.durationMonths} Mos</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Outstanding</Text>
                  <Text style={[styles.metricVal, { color: COLORS.danger }]}>
                    {formatCurrency(loan.outstandingBalance)}
                  </Text>
                </View>
              </View>

              <View style={styles.purposeRow}>
                <Ionicons name="document-text-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.purposeText} numberOfLines={1}>
                  {loan.purpose}
                </Text>
              </View>

              <View style={styles.loanFooter}>
                <Text style={styles.appliedDate}>Applied: {formatDate(loan.dateApplied)}</Text>
                <View style={styles.reviewBtn}>
                  <Text style={styles.reviewBtnText}>
                    {loan.status === 'pending' ? 'Review & Approve' : 'View Details'}
                  </Text>
                  <Ionicons name="chevron-forward" size={12} color={COLORS.primary} />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* LOAN REVIEW MODAL */}
      {selectedLoan && (
        <CustomModal
          visible={!!selectedLoan}
          onClose={() => setSelectedLoan(null)}
          title={`Loan #${selectedLoan.loanNumber}`}
          subtitle={`${selectedLoan.memberName} (${selectedLoan.memberNumber})`}
        >
          {reviewMode === 'view' && (
            <View>
              <View style={styles.modalStatusRow}>
                <Badge
                  label={selectedLoan.status.toUpperCase()}
                  variant={getStatusVariant(selectedLoan.status)}
                />
                <Text style={styles.modalRate}>{selectedLoan.interestRate}% Interest Rate</Text>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.gridBox}>
                  <Text style={styles.boxLabel}>Requested Amount</Text>
                  <Text style={styles.boxVal}>{formatCurrency(selectedLoan.requestedAmount)}</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.boxLabel}>Total Repayable</Text>
                  <Text style={styles.boxVal}>{formatCurrency(selectedLoan.totalRepayment)}</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.boxLabel}>Monthly Installment</Text>
                  <Text style={styles.boxVal}>{formatCurrency(selectedLoan.monthlyInstallment)}</Text>
                </View>
                <View style={styles.gridBox}>
                  <Text style={styles.boxLabel}>Tenure Period</Text>
                  <Text style={styles.boxVal}>{selectedLoan.durationMonths} Months</Text>
                </View>
              </View>

              <View style={styles.purposeBlock}>
                <Text style={styles.purposeBlockLabel}>Member Declared Purpose:</Text>
                <Text style={styles.purposeBlockText}>{selectedLoan.purpose}</Text>
              </View>

              {selectedLoan.adminNotes && (
                <View style={[styles.purposeBlock, { backgroundColor: '#F0FDF4' }]}>
                  <Text style={[styles.purposeBlockLabel, { color: '#166534' }]}>Admin Notes:</Text>
                  <Text style={styles.purposeBlockText}>{selectedLoan.adminNotes}</Text>
                </View>
              )}

              {selectedLoan.rejectionReason && (
                <View style={[styles.purposeBlock, { backgroundColor: '#FEF2F2' }]}>
                  <Text style={[styles.purposeBlockLabel, { color: '#991B1B' }]}>Rejection Reason:</Text>
                  <Text style={styles.purposeBlockText}>{selectedLoan.rejectionReason}</Text>
                </View>
              )}

              {/* Action buttons if pending */}
              {selectedLoan.status === 'pending' && (
                <View style={styles.decisionRow}>
                  <Button
                    title="Reject Loan"
                    onPress={() => setReviewMode('reject')}
                    variant="danger"
                    size="md"
                    iconName="close-circle-outline"
                    style={{ flex: 1, marginRight: 6 }}
                  />
                  <Button
                    title="Approve Loan"
                    onPress={() => setReviewMode('approve')}
                    variant="accent"
                    size="md"
                    iconName="checkmark-circle-outline"
                    style={{ flex: 1, marginLeft: 6 }}
                  />
                </View>
              )}
            </View>
          )}

          {reviewMode === 'approve' && (
            <View>
              <Text style={styles.formHeader}>APPROVE & DISBURSE LOAN</Text>
              <InputField
                label="Approved Principal Amount (KES)"
                value={approvedAmount}
                onChangeText={setApprovedAmount}
                placeholder="Amount"
                keyboardType="numeric"
                iconName="cash-outline"
                required
              />
              <InputField
                label="Credit Committee Review Notes"
                value={adminNotes}
                onChangeText={setAdminNotes}
                placeholder="Notes regarding borrower creditworthiness"
                iconName="document-text-outline"
                multiline
                numberOfLines={3}
              />
              <Button
                title="Confirm Disbursal & Notify Member"
                onPress={handleConfirmApproval}
                loading={actionLoading}
                variant="accent"
                size="lg"
                iconName="checkmark-done"
                fullWidth
              />
              <Button
                title="Back to Review"
                onPress={() => setReviewMode('view')}
                variant="ghost"
                size="sm"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </View>
          )}

          {reviewMode === 'reject' && (
            <View>
              <Text style={[styles.formHeader, { color: COLORS.danger }]}>REJECT LOAN APPLICATION</Text>
              <InputField
                label="Reason for Rejection"
                value={rejectionReason}
                onChangeText={setRejectionReason}
                placeholder="Provide clear rationale for the member"
                iconName="alert-circle-outline"
                multiline
                numberOfLines={3}
                required
              />
              <Button
                title="Confirm Rejection"
                onPress={handleConfirmRejection}
                loading={actionLoading}
                variant="danger"
                size="lg"
                iconName="close"
                fullWidth
              />
              <Button
                title="Back to Review"
                onPress={() => setReviewMode('view')}
                variant="ghost"
                size="sm"
                fullWidth
                style={{ marginTop: 8 }}
              />
            </View>
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
  filterTabs: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  memberName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  memberMeta: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  loanMetrics: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  metricItem: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  purposeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  purposeText: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    flex: 1,
  },
  loanFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  appliedDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.primary,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalRate: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  gridBox: {
    width: '47%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
  },
  boxLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  boxVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  purposeBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  purposeBlockLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  purposeBlockText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    lineHeight: 16,
  },
  decisionRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  formHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSACCO } from '../../context/SACCOContext';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { SavingsGrowthChart } from '../../components/common/SavingsGrowthChart';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface DashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onNavigate }) => {
  const { currentUser, logout } = useAuth();
  const {
    savings,
    shares,
    myLoans,
    myTransactions,
    unreadNotifsCount,
    availableLoanLimit,
    announcements,
    refreshData,
    isLoading,
  } = useSACCO();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const savingsBalance = savings?.currentBalance || 0;
  const activeLoans = myLoans.filter((l) => l.status === 'active');
  const outstandingLoansTotal = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalContributions = (savings?.totalDeposited || 0) + (shares?.totalValue || 0);

  // Next repayment alert
  const upcomingLoan = activeLoans.find((l) => l.nextRepaymentDate);

  // Recent 4 transactions
  const recentTransactions = myTransactions.slice(0, 4);

  return (
    <View style={styles.container}>
      {/* Top App Header */}
      <View style={styles.topBar}>
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => onNavigate('Profile')} activeOpacity={0.8}>
            {currentUser?.avatarUrl ? (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>
                  {currentUser?.fullName?.charAt(0) || 'M'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.nameBlock}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userName} numberOfLines={1}>
              {currentUser?.fullName || 'SACCO Member'}
            </Text>
            <View style={styles.memberPill}>
              <Text style={styles.memberNumberText}>{currentUser?.memberNumber}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.actionIconBtn}
            onPress={() => onNavigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
            {unreadNotifsCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadNotifsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionIconBtn, { marginLeft: 8 }]}
            onPress={() => onNavigate('Profile')}
          >
            <Ionicons name="settings-outline" size={20} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Main Financial Master Card */}
        <LinearGradient
          colors={['#0F2942', '#1E3A5F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.masterCard}
        >
          <View style={styles.masterHeader}>
            <View>
              <Text style={styles.masterLabel}>TOTAL SAVINGS BALANCE</Text>
              <Text style={styles.masterBalance}>{formatCurrency(savingsBalance)}</Text>
            </View>
            <View style={styles.statusPill}>
              <View style={styles.greenPulse} />
              <Text style={styles.statusPillText}>ACTIVE MEMBER</Text>
            </View>
          </View>

          <View style={styles.masterDivider} />

          <View style={styles.masterMetricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Available Loan Limit</Text>
              <Text style={styles.metricValue}>{formatCurrency(availableLoanLimit)}</Text>
            </View>
            <View style={styles.metricBorder} />
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Outstanding Loans</Text>
              <Text style={[styles.metricValue, outstandingLoansTotal > 0 && { color: '#F87171' }]}>
                {formatCurrency(outstandingLoansTotal)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Action Shortcuts */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onNavigate('Savings')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="arrow-down-circle" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.actionLabel}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onNavigate('Loans')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="cash-outline" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.actionLabel}>Apply Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onNavigate('Repayment')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="repeat-outline" size={24} color={COLORS.gold} />
            </View>
            <Text style={styles.actionLabel}>Repay Loan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onNavigate('Shares')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="pie-chart-outline" size={24} color={COLORS.purple} />
            </View>
            <Text style={styles.actionLabel}>Shares</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onNavigate('Transactions')}
            activeOpacity={0.7}
          >
            <View style={[styles.actionCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="receipt-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionLabel}>Statement</Text>
          </TouchableOpacity>
        </View>

        {/* Loan Repayment Alert Banner (if active loan due) */}
        {upcomingLoan && (
          <TouchableOpacity
            style={styles.repayAlertCard}
            onPress={() => onNavigate('Repayment')}
            activeOpacity={0.8}
          >
            <View style={styles.alertIconCircle}>
              <Ionicons name="calendar" size={20} color="#D97706" />
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.alertTitle}>Loan Installment Due</Text>
              <Text style={styles.alertSubtitle}>
                {formatCurrency(upcomingLoan.monthlyInstallment)} due by {formatDate(upcomingLoan.nextRepaymentDate || '')}
              </Text>
            </View>
            <View style={styles.alertActionBtn}>
              <Text style={styles.alertActionText}>Pay Now</Text>
              <Ionicons name="chevron-forward" size={14} color="#B45309" />
            </View>
          </TouchableOpacity>
        )}

        {/* Secondary KPI Cards */}
        <View style={styles.statsRow}>
          <StatCard
            label="Total Shares Capital"
            value={formatCurrency(shares?.totalValue || 0)}
            icon="wallet-outline"
            color={COLORS.purple}
            subValue={`${shares?.totalShares || 0} units owned`}
            onPress={() => onNavigate('Shares')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Total Contributions"
            value={formatCurrency(totalContributions)}
            icon="shield-checkmark-outline"
            color={COLORS.accent}
            subValue="Savings + Shares"
            onPress={() => onNavigate('Savings')}
          />
        </View>

        {/* Savings Growth Chart */}
        <SavingsGrowthChart currentBalance={savingsBalance} />

        {/* Recent Transactions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => onNavigate('Transactions')}>
            <Text style={styles.sectionLink}>View All ({myTransactions.length})</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={28} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No recent transactions found.</Text>
          </View>
        ) : (
          <View style={styles.txListCard}>
            {recentTransactions.map((tx, idx) => {
              const isCredit = tx.type === 'deposit' || tx.type === 'loan_disbursement';
              const isRepayment = tx.type === 'loan_repayment';
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={[
                    styles.txRow,
                    idx < recentTransactions.length - 1 && styles.txRowBorder,
                  ]}
                  onPress={() => onNavigate('Transactions')}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.txIcon,
                      {
                        backgroundColor: isCredit
                          ? '#ECFDF5'
                          : isRepayment
                          ? '#FEF3C7'
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        tx.type === 'deposit'
                          ? 'arrow-down'
                          : tx.type === 'loan_repayment'
                          ? 'repeat'
                          : tx.type === 'loan_disbursement'
                          ? 'cash'
                          : tx.type === 'share_contribution'
                          ? 'pie-chart'
                          : 'arrow-up'
                      }
                      size={18}
                      color={
                        isCredit
                          ? COLORS.accent
                          : isRepayment
                          ? COLORS.gold
                          : COLORS.primary
                      }
                    />
                  </View>

                  <View style={styles.txDetails}>
                    <Text style={styles.txTitle} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txSubtitle}>
                      {formatDate(tx.date)} • {tx.time}
                    </Text>
                  </View>

                  <View style={styles.txAmountBlock}>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: isCredit ? COLORS.accentDark : COLORS.textPrimary },
                      ]}
                    >
                      {isCredit ? '+' : '-'} {formatCurrency(tx.amount)}
                    </Text>
                    <Badge
                      label={tx.status}
                      variant={tx.status === 'completed' ? 'success' : 'warning'}
                      size="sm"
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* SACCO Announcements Banner */}
        {announcements.length > 0 && (
          <View style={styles.announcementCard}>
            <View style={styles.announcementHeader}>
              <View style={styles.announcementTag}>
                <Ionicons name="megaphone" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={styles.announcementTagText}>SACCO NOTICE</Text>
              </View>
              <Text style={styles.announcementDate}>{formatDate(announcements[0].date)}</Text>
            </View>
            <Text style={styles.announcementTitle}>{announcements[0].title}</Text>
            <Text style={styles.announcementBody} numberOfLines={3}>
              {announcements[0].content}
            </Text>
          </View>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  nameBlock: {
    flex: 1,
  },
  greetingText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  memberPill: {
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  memberNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: COLORS.danger,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  masterCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.large,
    marginBottom: 20,
  },
  masterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  masterLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  masterBalance: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
    letterSpacing: -0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  greenPulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700',
  },
  masterDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 16,
  },
  masterMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricItem: {
    flex: 1,
  },
  metricBorder: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 12,
  },
  metricLabel: {
    fontSize: 11,
    color: '#CBD5E1',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
    marginBottom: 16,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  repayAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 16,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#92400E',
  },
  alertSubtitle: {
    fontSize: 11.5,
    color: '#B45309',
    marginTop: 2,
  },
  alertActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    marginRight: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.secondary,
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
  txListCard: {
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
    paddingVertical: 13,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  txIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  txSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmountBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  announcementCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 18,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  announcementTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  announcementDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  announcementBody: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
});


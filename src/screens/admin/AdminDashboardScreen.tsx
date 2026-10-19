import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useSACCO } from '../../context/SACCOContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface AdminDashboardScreenProps {
  onNavigate: (screen: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onNavigate }) => {
  const { currentUser, logout, switchDemoUser } = useAuth();
  const { colors, isDark } = useTheme();
  const {
    allMembers,
    allLoans,
    allTransactions,
    allRepayments,
    refreshData,
    isLoading,
  } = useSACCO();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const pendingLoans = allLoans.filter((l) => l.status === 'pending');
  const activeLoans = allLoans.filter((l) => l.status === 'active');
  const pendingMembers = allMembers.filter((m) => m.status === 'pending');
  const totalActiveMembers = allMembers.filter((m) => m.status === 'active' && m.role === 'member').length;

  const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalDisbursed = allLoans
    .filter((l) => l.status === 'active' || l.status === 'completed')
    .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
  const totalRepayments = allRepayments.reduce((sum, r) => sum + r.amount, 0);

  // Recovery Rate calculation
  const totalDueOrRepaid = totalRepayments + totalOutstanding;
  const recoveryRate = totalDueOrRepaid > 0 ? Math.round((totalRepayments / totalDueOrRepaid) * 100) : 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Admin Control Center"
        subtitle="PESA PAP SACCO Operations & Governance"
        rightAction={{
          icon: 'log-out-outline',
          color: COLORS.danger,
          onPress: logout,
        }}
        secondaryRightAction={{
          icon: 'person-outline',
          color: COLORS.primary,
          onPress: () => switchDemoUser('member'),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing || isLoading} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Admin Header Banner */}
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.adminBanner}
        >
          <View style={styles.bannerTop}>
            <View>
              <Text style={styles.bannerRole}>EXECUTIVE MANAGEMENT PORTAL</Text>
              <Text style={styles.bannerAdminName}>{currentUser?.fullName}</Text>
            </View>
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#60A5FA" />
              <Text style={styles.adminBadgeText}>SUPER ADMIN</Text>
            </View>
          </View>

          <View style={styles.bannerDivider} />

          <View style={styles.bannerStatsRow}>
            <View style={styles.bannerStatCol}>
              <Text style={styles.bannerStatLabel}>Total Loan Portfolio</Text>
              <Text style={styles.bannerStatVal}>{formatCurrency(totalDisbursed)}</Text>
            </View>
            <View style={styles.bannerBorder} />
            <View style={styles.bannerStatCol}>
              <Text style={styles.bannerStatLabel}>Active Outstanding</Text>
              <Text style={[styles.bannerStatVal, { color: '#F87171' }]}>
                {formatCurrency(totalOutstanding)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Action Pending Alerts */}
        {(pendingLoans.length > 0 || pendingMembers.length > 0) && (
          <View style={styles.alertsContainer}>
            {pendingLoans.length > 0 && (
              <TouchableOpacity
                style={styles.alertCard}
                onPress={() => onNavigate('AdminLoans')}
                activeOpacity={0.8}
              >
                <View style={styles.alertIconCircle}>
                  <Ionicons name="hourglass" size={18} color="#D97706" />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={styles.alertTitle}>
                    {pendingLoans.length} Loan Application{pendingLoans.length > 1 ? 's' : ''} Awaiting Review
                  </Text>
                  <Text style={styles.alertSubtitle}>Review credit committee approvals</Text>
                </View>
                <View style={styles.alertAction}>
                  <Text style={styles.alertActionText}>Review</Text>
                  <Ionicons name="chevron-forward" size={14} color="#92400E" />
                </View>
              </TouchableOpacity>
            )}

            {pendingMembers.length > 0 && (
              <TouchableOpacity
                style={[styles.alertCard, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}
                onPress={() => onNavigate('AdminMembers')}
                activeOpacity={0.8}
              >
                <View style={[styles.alertIconCircle, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="person-add" size={18} color={COLORS.secondary} />
                </View>
                <View style={{ flex: 1, marginHorizontal: 10 }}>
                  <Text style={[styles.alertTitle, { color: '#1E40AF' }]}>
                    {pendingMembers.length} Member Registration{pendingMembers.length > 1 ? 's' : ''} Pending
                  </Text>
                  <Text style={[styles.alertSubtitle, { color: '#2563EB' }]}>Verify national IDs and KYC</Text>
                </View>
                <View style={[styles.alertAction, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.alertActionText, { color: '#1E40AF' }]}>Verify</Text>
                  <Ionicons name="chevron-forward" size={14} color="#1E40AF" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Admin Navigation Hub Grid */}
        <Text style={styles.sectionHeader}>ADMIN MANAGEMENT MODULES</Text>
        <View style={styles.menuGrid}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminMembers')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={24} color={COLORS.secondary} />
            </View>
            <Text style={styles.menuTitle}>Members</Text>
            <Text style={styles.menuSub}>{allMembers.length} Accounts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminLoans')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="cash" size={24} color={COLORS.gold} />
            </View>
            <Text style={styles.menuTitle}>Loans Desk</Text>
            <Text style={styles.menuSub}>{pendingLoans.length} Pending</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminTransactions')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="receipt" size={24} color={COLORS.accent} />
            </View>
            <Text style={styles.menuTitle}>Transactions</Text>
            <Text style={styles.menuSub}>Audit Ledger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminProducts')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="layers" size={24} color={COLORS.purple} />
            </View>
            <Text style={styles.menuTitle}>Products</Text>
            <Text style={styles.menuSub}>Rates & Terms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminAnnouncements')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="megaphone" size={24} color="#EA580C" />
            </View>
            <Text style={styles.menuTitle}>Notices</Text>
            <Text style={styles.menuSub}>Broadcast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => onNavigate('AdminReports')}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="bar-chart" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.menuTitle}>Analytics</Text>
            <Text style={styles.menuSub}>SACCO KPIs</Text>
          </TouchableOpacity>
        </View>

        {/* High Level KPI Metrics */}
        <Text style={[styles.sectionHeader, { marginTop: 18 }]}>PORTFOLIO PERFORMANCE</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Active Members"
            value={totalActiveMembers.toString()}
            icon="people-outline"
            color={COLORS.secondary}
            subValue="Verified SACCO base"
            onPress={() => onNavigate('AdminMembers')}
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Recovery Health"
            value={`${recoveryRate}%`}
            icon="shield-checkmark-outline"
            color={COLORS.accent}
            subValue="Repayment index"
            onPress={() => onNavigate('AdminReports')}
          />
        </View>

        {/* Global Recent Activity Stream */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.sectionTitle}>Live Audit Trail</Text>
            <TouchableOpacity onPress={() => onNavigate('AdminTransactions')}>
              <Text style={styles.viewAllText}>View All ({allTransactions.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.activityCard}>
            {allTransactions.slice(0, 5).map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.activityRow,
                  idx < 4 && styles.activityRowBorder,
                ]}
              >
                <View style={styles.activityIcon}>
                  <Ionicons
                    name={
                      tx.type === 'deposit'
                        ? 'arrow-down'
                        : tx.type === 'loan_repayment'
                        ? 'repeat'
                        : tx.type === 'loan_disbursement'
                        ? 'cash'
                        : 'document'
                    }
                    size={16}
                    color={COLORS.primary}
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName} numberOfLines={1}>
                    {tx.memberName} ({tx.memberNumber})
                  </Text>
                  <Text style={styles.activityDesc} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {formatDate(tx.date)} {tx.time} • Ref: {tx.referenceNumber}
                  </Text>
                </View>
                <Text style={styles.activityAmount}>{formatCurrency(tx.amount)}</Text>
              </View>
            ))}
          </View>
        </View>
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
  adminBanner: {
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    ...SHADOWS.large,
    marginBottom: 16,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  bannerRole: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  bannerAdminName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 3,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  adminBadgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '700',
  },
  bannerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginVertical: 14,
  },
  bannerStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerStatCol: {
    flex: 1,
  },
  bannerBorder: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 12,
  },
  bannerStatLabel: {
    fontSize: 10.5,
    color: '#94A3B8',
  },
  bannerStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  alertsContainer: {
    marginBottom: 14,
    gap: 8,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: BORDER_RADIUS.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  alertIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  alertSubtitle: {
    fontSize: 11,
    color: '#B45309',
    marginTop: 1,
  },
  alertAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 2,
  },
  alertActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  menuItem: {
    width: '31.3%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  menuSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activitySection: {
    marginTop: 4,
  },
  activityHeader: {
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
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  activityCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  activityDesc: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  activityMeta: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginLeft: 8,
  },
});


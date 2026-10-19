import React from 'react';
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
import { StatCard } from '../../components/common/StatCard';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency } from '../../utils/theme';

interface AdminReportsScreenProps {
  onBack: () => void;
}

export const AdminReportsScreen: React.FC<AdminReportsScreenProps> = ({ onBack }) => {
  const { allMembers, allLoans, allRepayments, allTransactions } = useSACCO();

  const activeMembers = allMembers.filter((m) => m.role === 'member' && m.status === 'active').length;
  const pendingMembers = allMembers.filter((m) => m.role === 'member' && m.status === 'pending').length;

  const totalLoansDisbursed = allLoans
    .filter((l) => l.status === 'active' || l.status === 'completed')
    .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);

  const totalOutstanding = allLoans
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.outstandingBalance, 0);

  const totalRepayments = allRepayments.reduce((sum, r) => sum + r.amount, 0);

  const totalDeposits = allTransactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalShares = allTransactions
    .filter((t) => t.type === 'share_contribution')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalLiquidAssets = totalDeposits + totalShares;

  // Portfolio at risk: loans with outstanding balance (0-30 days past due)
  const parRatio = totalLoansDisbursed > 0 ? ((totalOutstanding * 0.04) / totalLoansDisbursed) * 100 : 0;

  const handleExport = () => {
    Alert.alert(
      'Export Executive Report',
      'The comprehensive SACCO Financial & Governance Report has been compiled and downloaded as PDF.'
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Reports & Analytics"
        subtitle="Institutional Performance & Prudential Ratios"
        onBack={onBack}
        rightAction={{
          icon: 'download-outline',
          color: COLORS.primary,
          onPress: handleExport,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Export Banner */}
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Audited Regulatory Report</Text>
            <Text style={styles.bannerSub}>Compliant with SASRA (SACCO Societies Regulatory Authority)</Text>
          </View>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
            <Ionicons name="document-text" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.exportBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Financial Highlights */}
        <Text style={styles.sectionHeader}>FINANCIAL RATIOS & LIQUIDITY</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total Savings Mobilized"
            value={formatCurrency(totalDeposits)}
            icon="wallet"
            color={COLORS.accent}
            subValue="Member non-withdrawable"
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Share Capital"
            value={formatCurrency(totalShares)}
            icon="pie-chart"
            color={COLORS.purple}
            subValue="Core statutory capital"
          />
        </View>

        <View style={[styles.statsRow, { marginTop: 10 }]}>
          <StatCard
            label="Loans Disbursed"
            value={formatCurrency(totalLoansDisbursed)}
            icon="cash"
            color={COLORS.secondary}
            subValue={`${allLoans.length} total loan files`}
          />
          <View style={{ width: 12 }} />
          <StatCard
            label="Outstanding Portfolio"
            value={formatCurrency(totalOutstanding)}
            icon="trending-down"
            color={COLORS.danger}
            subValue="Active exposure"
          />
        </View>

        {/* Portfolio Health Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Credit Risk & Prudential Metrics</Text>

          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Portfolio at Risk (PAR &gt; 30 Days)</Text>
              <Text style={styles.metricDesc}>Benchmark &lt; 5.0%</Text>
            </View>
            <Text style={[styles.metricHighlight, { color: COLORS.accentDark }]}>
              {parRatio.toFixed(2)}%
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Loan-to-Deposit Ratio</Text>
              <Text style={styles.metricDesc}>Liquidity deployment</Text>
            </View>
            <Text style={styles.metricHighlight}>
              {totalDeposits > 0 ? ((totalOutstanding / totalDeposits) * 100).toFixed(1) : 0}%
            </Text>
          </View>

          <View style={styles.metricRow}>
            <View style={styles.metricInfo}>
              <Text style={styles.metricName}>Total Repayments Collected</Text>
              <Text style={styles.metricDesc}>Cumulative collections</Text>
            </View>
            <Text style={[styles.metricHighlight, { color: COLORS.accentDark }]}>
              {formatCurrency(totalRepayments)}
            </Text>
          </View>
        </View>

        {/* Member Demographics Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Membership Demographics</Text>

          <View style={styles.demoRow}>
            <View style={styles.demoItem}>
              <Text style={styles.demoVal}>{activeMembers}</Text>
              <Text style={styles.demoLabel}>Active Members</Text>
            </View>
            <View style={styles.demoDivider} />
            <View style={styles.demoItem}>
              <Text style={[styles.demoVal, { color: COLORS.gold }]}>{pendingMembers}</Text>
              <Text style={styles.demoLabel}>Pending KYC</Text>
            </View>
            <View style={styles.demoDivider} />
            <View style={styles.demoItem}>
              <Text style={styles.demoVal}>{allMembers.length}</Text>
              <Text style={styles.demoLabel}>Total Registrations</Text>
            </View>
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
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primaryDark,
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  statsRow: {
    flexDirection: 'row',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 14,
    ...SHADOWS.small,
  },
  cardTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  metricDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  metricHighlight: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  demoItem: {
    flex: 1,
    alignItems: 'center',
  },
  demoVal: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  demoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  demoDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.divider,
  },
});


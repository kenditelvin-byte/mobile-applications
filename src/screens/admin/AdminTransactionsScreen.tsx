import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { TransactionType } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface AdminTransactionsScreenProps {
  onBack: () => void;
}

export const AdminTransactionsScreen: React.FC<AdminTransactionsScreenProps> = ({ onBack }) => {
  const { allTransactions } = useSACCO();

  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'loan_repayment', label: 'Repayments' },
    { id: 'loan_disbursement', label: 'Disbursals' },
    { id: 'share_contribution', label: 'Shares' },
    { id: 'withdrawal', label: 'Withdrawals' },
  ];

  const filtered = allTransactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const matchName = tx.memberName.toLowerCase().includes(q);
      const matchNum = tx.memberNumber.toLowerCase().includes(q);
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchRef = tx.referenceNumber.toLowerCase().includes(q);
      return matchName || matchNum || matchDesc || matchRef;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        title="SACCO Audit Ledger"
        subtitle="Universal Real-time Transaction Stream"
        onBack={onBack}
      />

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search member name, ID, or reference..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {filterTabs.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tabChip, filterType === t.id && styles.tabChipActive]}
              onPress={() => setFilterType(t.id)}
            >
              <Text style={[styles.tabChipText, filterType === t.id && styles.tabChipTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Matching Audit Records"
            description="No transactions found matching your criteria."
          />
        ) : (
          <View style={styles.listCard}>
            {filtered.map((tx, idx) => (
              <View
                key={tx.id}
                style={[
                  styles.txRow,
                  idx < filtered.length - 1 && styles.txRowBorder,
                ]}
              >
                <View style={styles.txIconBox}>
                  <Ionicons
                    name={
                      tx.type === 'deposit'
                        ? 'arrow-down'
                        : tx.type === 'loan_repayment'
                        ? 'repeat'
                        : tx.type === 'loan_disbursement'
                        ? 'cash'
                        : 'document-text'
                    }
                    size={16}
                    color={COLORS.primary}
                  />
                </View>

                <View style={styles.txInfo}>
                  <Text style={styles.txName} numberOfLines={1}>
                    {tx.memberName} ({tx.memberNumber})
                  </Text>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.txMeta}>
                    Ref: {tx.referenceNumber} • {formatDate(tx.date)} {tx.time}
                  </Text>
                </View>

                <View style={styles.txAmountCol}>
                  <Text style={styles.txAmount}>{formatCurrency(tx.amount)}</Text>
                  <Badge label={tx.type.replace('_', ' ')} variant="neutral" size="sm" />
                </View>
              </View>
            ))}
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: COLORS.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  tabsWrapper: {
    backgroundColor: COLORS.surface,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSubtle,
  },
  tabChipActive: {
    backgroundColor: COLORS.primary,
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  listCard: {
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
  txIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  txDesc: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  txMeta: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txAmountCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { CustomModal } from '../../components/common/CustomModal';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { Transaction, TransactionType } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatCurrency, formatDate } from '../../utils/theme';

interface TransactionsScreenProps {
  onBack: () => void;
}

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ onBack }) => {
  const { myTransactions } = useSACCO();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'deposit', label: 'Deposits' },
    { id: 'loan_repayment', label: 'Repayments' },
    { id: 'loan_disbursement', label: 'Loans' },
    { id: 'share_contribution', label: 'Shares' },
    { id: 'withdrawal', label: 'Withdrawals' },
  ];

  const filteredTransactions = myTransactions.filter((tx) => {
    // Type filter
    if (selectedType !== 'all' && tx.type !== selectedType) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDesc = tx.description.toLowerCase().includes(q);
      const matchNum = tx.transactionNumber.toLowerCase().includes(q);
      const matchRef = tx.referenceNumber.toLowerCase().includes(q);
      const matchAmt = tx.amount.toString().includes(q);
      return matchDesc || matchNum || matchRef || matchAmt;
    }

    return true;
  });

  const getTxIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return { icon: 'arrow-down' as const, bg: '#ECFDF5', color: COLORS.accentDark, sign: '+' };
      case 'loan_disbursement':
        return { icon: 'cash' as const, bg: '#EFF6FF', color: COLORS.secondary, sign: '+' };
      case 'loan_repayment':
        return { icon: 'repeat' as const, bg: '#FEF3C7', color: COLORS.gold, sign: '-' };
      case 'share_contribution':
        return { icon: 'pie-chart' as const, bg: '#F3E8FF', color: COLORS.purple, sign: '-' };
      case 'withdrawal':
        return { icon: 'arrow-up' as const, bg: '#FEE2E2', color: COLORS.danger, sign: '-' };
      default:
        return { icon: 'swap-horizontal' as const, bg: '#F1F5F9', color: COLORS.primary, sign: '' };
    }
  };

  const handleCopyReceipt = () => {
    Alert.alert('Copied to Clipboard', `Reference: ${selectedTx?.referenceNumber}`);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Transaction History"
        subtitle="Audited Financial Ledger"
        onBack={onBack}
      />

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search description, reference, or amount..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs Horizontal Scroll */}
      <View style={styles.tabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabChip,
                selectedType === tab.id && styles.tabChipActive,
              ]}
              onPress={() => setSelectedType(tab.id)}
            >
              <Text
                style={[
                  styles.tabChipText,
                  selectedType === tab.id && styles.tabChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredTransactions.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No Transactions Found"
            description={
              searchQuery
                ? `No transactions matched your search query "${searchQuery}".`
                : 'No transactions recorded for the selected filter.'
            }
          />
        ) : (
          <View style={styles.listCard}>
            {filteredTransactions.map((tx, idx) => {
              const meta = getTxIcon(tx.type);
              return (
                <TouchableOpacity
                  key={tx.id}
                  style={[
                    styles.txRow,
                    idx < filteredTransactions.length - 1 && styles.txRowBorder,
                  ]}
                  onPress={() => setSelectedTx(tx)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.txIconBox, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.color} />
                  </View>

                  <View style={styles.txMainInfo}>
                    <Text style={styles.txDescription} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txReference}>
                      Ref: {tx.referenceNumber} • {formatDate(tx.date)} {tx.time}
                    </Text>
                  </View>

                  <View style={styles.txEndBlock}>
                    <Text
                      style={[
                        styles.txAmount,
                        { color: meta.sign === '+' ? COLORS.accentDark : COLORS.textPrimary },
                      ]}
                    >
                      {meta.sign} {formatCurrency(tx.amount)}
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
      </ScrollView>

      {/* TRANSACTION RECEIPT MODAL */}
      {selectedTx && (
        <CustomModal
          visible={!!selectedTx}
          onClose={() => setSelectedTx(null)}
          title="Transaction Receipt"
          subtitle={selectedTx.transactionNumber}
        >
          <View style={styles.receiptContainer}>
            <View style={styles.receiptHeader}>
              <View style={styles.successCheckCircle}>
                <Ionicons name="checkmark" size={26} color="#FFFFFF" />
              </View>
              <Text style={styles.receiptAmount}>
                {formatCurrency(selectedTx.amount)}
              </Text>
              <Badge
                label={selectedTx.status.toUpperCase()}
                variant="success"
              />
            </View>

            <View style={styles.receiptDetails}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction ID</Text>
                <Text style={styles.receiptVal}>{selectedTx.transactionNumber}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Reference Number</Text>
                <Text style={styles.receiptValBold}>{selectedTx.referenceNumber}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Transaction Type</Text>
                <Text style={styles.receiptVal}>
                  {selectedTx.type.replace('_', ' ').toUpperCase()}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Description</Text>
                <Text style={styles.receiptValDesc}>{selectedTx.description}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Date & Time</Text>
                <Text style={styles.receiptVal}>
                  {formatDate(selectedTx.date)} at {selectedTx.time}
                </Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Member Name</Text>
                <Text style={styles.receiptVal}>{selectedTx.memberName}</Text>
              </View>

              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Member Number</Text>
                <Text style={styles.receiptVal}>{selectedTx.memberNumber}</Text>
              </View>
            </View>

            <View style={styles.receiptActions}>
              <Button
                title="Copy Reference"
                onPress={handleCopyReceipt}
                variant="outline"
                size="md"
                iconName="copy-outline"
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Close Receipt"
                onPress={() => setSelectedTx(null)}
                variant="primary"
                size="md"
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
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
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
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
    paddingVertical: 14,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  txIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txMainInfo: {
    flex: 1,
  },
  txDescription: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  txReference: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  txEndBlock: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  txAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  receiptContainer: {
    alignItems: 'center',
  },
  receiptHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  successCheckCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  receiptAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  receiptDetails: {
    width: '100%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: BORDER_RADIUS.md,
    padding: 14,
    marginBottom: 18,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  receiptLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    flex: 1,
  },
  receiptVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  receiptValBold: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'right',
  },
  receiptValDesc: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  receiptActions: {
    flexDirection: 'row',
    width: '100%',
  },
});


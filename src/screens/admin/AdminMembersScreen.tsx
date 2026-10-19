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
import { Button } from '../../components/common/Button';
import { CustomModal } from '../../components/common/CustomModal';
import { EmptyState } from '../../components/common/EmptyState';
import { User, AccountStatus } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatDate } from '../../utils/theme';

interface AdminMembersScreenProps {
  onBack: () => void;
}

export const AdminMembersScreen: React.FC<AdminMembersScreenProps> = ({ onBack }) => {
  const { allMembers, approveMember, rejectMember } = useSACCO();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AccountStatus>('all');
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const filteredMembers = allMembers.filter((m) => {
    // Role filter - only members
    if (m.role !== 'member') return false;

    // Status filter
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.fullName.toLowerCase().includes(q);
      const matchNum = m.memberNumber.toLowerCase().includes(q);
      const matchId = m.nationalId.includes(q);
      const matchPhone = m.phone.includes(q);
      return matchName || matchNum || matchId || matchPhone;
    }

    return true;
  });

  const handleApprove = async (member: User) => {
    setActionLoading(true);
    const res = await approveMember(member.id);
    setActionLoading(false);
    setSelectedMember(null);
    Alert.alert('Status Updated', res.message);
  };

  const handleSuspend = async (member: User) => {
    Alert.alert(
      'Confirm Suspension',
      `Are you sure you want to suspend membership for ${member.fullName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend Account',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const res = await rejectMember(member.id, 'Administrative suspension');
            setActionLoading(false);
            setSelectedMember(null);
            Alert.alert('Account Suspended', res.message);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Member Directory"
        subtitle="KYC Review & Account Governance"
        onBack={onBack}
      />

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, ID number, or member #..."
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

      {/* Status Filter Chips */}
      <View style={styles.filterTabs}>
        {(['all', 'active', 'pending', 'suspended'] as const).map((tab) => (
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
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Member List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredMembers.length === 0 ? (
          <EmptyState
            icon="people-outline"
            title="No Members Found"
            description="No members found matching your search and filter criteria."
          />
        ) : (
          <View style={styles.listCard}>
            {filteredMembers.map((member, idx) => (
              <TouchableOpacity
                key={member.id}
                style={[
                  styles.memberRow,
                  idx < filteredMembers.length - 1 && styles.memberRowBorder,
                ]}
                onPress={() => setSelectedMember(member)}
                activeOpacity={0.7}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {member.fullName.charAt(0)}
                  </Text>
                </View>

                <View style={styles.memberInfo}>
                  <Text style={styles.memberName} numberOfLines={1}>
                    {member.fullName}
                  </Text>
                  <Text style={styles.memberDetails}>
                    {member.memberNumber} • ID: {member.nationalId}
                  </Text>
                  <Text style={styles.memberPhone}>{member.phone}</Text>
                </View>

                <View style={styles.badgeCol}>
                  <Badge
                    label={member.status}
                    variant={
                      member.status === 'active'
                        ? 'success'
                        : member.status === 'pending'
                        ? 'warning'
                        : 'danger'
                    }
                    size="sm"
                  />
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={COLORS.textMuted}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <CustomModal
          visible={!!selectedMember}
          onClose={() => setSelectedMember(null)}
          title={selectedMember.fullName}
          subtitle={`Member File: ${selectedMember.memberNumber}`}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalStatusRow}>
              <Badge
                label={selectedMember.status.toUpperCase()}
                variant={
                  selectedMember.status === 'active'
                    ? 'success'
                    : selectedMember.status === 'pending'
                    ? 'warning'
                    : 'danger'
                }
              />
              <Text style={styles.modalJoinDate}>
                Registered: {formatDate(selectedMember.createdAt)}
              </Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>National ID Number</Text>
                <Text style={styles.gridVal}>{selectedMember.nationalId}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Mobile Phone</Text>
                <Text style={styles.gridVal}>{selectedMember.phone}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Email Address</Text>
                <Text style={styles.gridVal}>{selectedMember.email}</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Gender & DOB</Text>
                <Text style={styles.gridVal}>
                  {selectedMember.gender.toUpperCase()} • {selectedMember.dob}
                </Text>
              </View>

              <View style={[styles.gridItem, { width: '100%' }]}>
                <Text style={styles.gridLabel}>Residential Address</Text>
                <Text style={styles.gridVal}>{selectedMember.address}</Text>
              </View>
            </View>

            {/* Admin actions */}
            <View style={styles.actionsBox}>
              {selectedMember.status === 'pending' && (
                <Button
                  title="Approve Member Account"
                  onPress={() => handleApprove(selectedMember)}
                  loading={actionLoading}
                  variant="accent"
                  size="lg"
                  iconName="checkmark-circle"
                  fullWidth
                />
              )}

              {selectedMember.status === 'active' && (
                <Button
                  title="Suspend Member Account"
                  onPress={() => handleSuspend(selectedMember)}
                  loading={actionLoading}
                  variant="danger"
                  size="md"
                  iconName="ban-outline"
                  fullWidth
                />
              )}

              {selectedMember.status === 'suspended' && (
                <Button
                  title="Reinstate & Activate Member"
                  onPress={() => handleApprove(selectedMember)}
                  loading={actionLoading}
                  variant="primary"
                  size="md"
                  iconName="refresh"
                  fullWidth
                />
              )}
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
  searchContainer: {
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
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
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
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    ...SHADOWS.small,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
  },
  memberRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  memberDetails: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  memberPhone: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  badgeCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  modalContent: {
    paddingTop: 4,
  },
  modalStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalJoinDate: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  gridItem: {
    width: '47%',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 8,
    padding: 10,
  },
  gridLabel: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  gridVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  actionsBox: {
    marginTop: 4,
  },
});


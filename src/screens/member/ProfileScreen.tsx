import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSACCO } from '../../context/SACCOContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../../components/common/Header';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { COLORS, BORDER_RADIUS, SHADOWS, formatDate } from '../../utils/theme';

interface ProfileScreenProps {
  onBack: () => void;
  onNavigateToAdmin?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onBack,
  onNavigateToAdmin,
}) => {
  const { currentUser, logout, updateProfile, changePassword, switchDemoUser } = useAuth();
  const { resetDatabaseToDemo } = useSACCO();
  const { colors, isDark, toggleTheme, themeMode } = useTheme();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Edit Form State
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Change Password State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [changingPass, setChangingPass] = useState(false);

  const avatarOptions = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  ];

  const handleSaveProfile = async () => {
    if (!phone.trim() || !email.trim() || !address.trim()) {
      Alert.alert('Validation Error', 'Please fill in all contact fields.');
      return;
    }

    setSavingProfile(true);
    const success = await updateProfile({
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      address: address.trim(),
    });
    setSavingProfile(false);

    if (success) {
      setEditModalVisible(false);
      Alert.alert('Profile Updated', 'Your profile details have been saved successfully.');
    } else {
      Alert.alert('Update Failed', 'Unable to update profile at this time.');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert('Fields Required', 'Please complete all password fields.');
      return;
    }
    if (newPass.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setChangingPass(true);
    const res = await changePassword(currentPass, newPass);
    setChangingPass(false);

    if (res.success) {
      setPasswordModalVisible(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      Alert.alert('Security Notice', res.message);
    } else {
      Alert.alert('Change Password Error', res.message);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    await updateProfile({ avatarUrl: url });
    setAvatarModalVisible(false);
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Demo Database',
      'This will reset all members, savings, loans, and transactions back to the clean seed state. Perfect for demonstration!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Database',
          style: 'destructive',
          onPress: async () => {
            await resetDatabaseToDemo();
            Alert.alert('Database Reset', 'Demo database restored.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="Member Profile"
        subtitle="Account Details & KYC Verification"
        onBack={onBack}
        rightAction={{
          icon: 'log-out-outline',
          color: COLORS.danger,
          onPress: logout,
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarWrapper}>
            {currentUser?.avatarUrl ? (
              <Image source={{ uri: currentUser.avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarFallbackText}>
                  {currentUser?.fullName?.charAt(0) || 'M'}
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.avatarCameraBtn}
              onPress={() => setAvatarModalVisible(true)}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <Text style={styles.fullName}>{currentUser?.fullName}</Text>
          <Text style={styles.memberNum}>{currentUser?.memberNumber}</Text>

          <View style={styles.badgeRow}>
            <Badge
              label={currentUser?.status === 'active' ? 'ACTIVE & VERIFIED' : 'PENDING APPROVAL'}
              variant={currentUser?.status === 'active' ? 'success' : 'warning'}
            />
            <View style={{ width: 8 }} />
            <Badge label="TIER 1 SAVER" variant="primary" />
          </View>
        </View>

        {/* Membership Details */}
        <View style={styles.infoCard}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.infoTitle}>Membership Information</Text>
            <TouchableOpacity onPress={() => setEditModalVisible(true)}>
              <Text style={styles.editBtnText}>Edit Info</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Member ID Number:</Text>
            <Text style={styles.value}>{currentUser?.memberNumber}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>National ID / Passport:</Text>
            <Text style={styles.value}>{currentUser?.nationalId}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Phone Number:</Text>
            <Text style={styles.value}>{currentUser?.phone}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email Address:</Text>
            <Text style={styles.value}>{currentUser?.email}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date of Birth:</Text>
            <Text style={styles.value}>{currentUser?.dob || 'Not provided'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Gender:</Text>
            <Text style={styles.value}>
              {currentUser?.gender ? currentUser.gender.toUpperCase() : 'MALE'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Physical Address:</Text>
            <Text style={[styles.value, { flex: 1, textAlign: 'right' }]}>
              {currentUser?.address}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Date Joined:</Text>
            <Text style={styles.value}>{formatDate(currentUser?.createdAt || '')}</Text>
          </View>
        </View>

        {/* Security & Access Settings */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Account Security & Controls</Text>

          {/* Theme Mode Toggle Row */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.settingLeft}>
              <Ionicons
                name={isDark ? 'sunny' : 'moon'}
                size={20}
                color={isDark ? '#FBBF24' : COLORS.primary}
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.settingTitle}>
                  {isDark ? 'Dark Mode Active' : 'Light Mode Active'}
                </Text>
                <Text style={styles.settingSubtitle}>
                  Tap to switch to {isDark ? 'Light' : 'Dark'} theme
                </Text>
              </View>
            </View>
            <View style={[styles.themePill, { backgroundColor: isDark ? '#334155' : '#EFF6FF' }]}>
              <Text style={[styles.themePillText, { color: isDark ? '#FBBF24' : COLORS.primary }]}>
                {themeMode.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setPasswordModalVisible(true)}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="key-outline" size={20} color={COLORS.primary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.settingTitle}>Change Password</Text>
                <Text style={styles.settingSubtitle}>Update your sign in credentials</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Quick switch to Admin portal */}
          <TouchableOpacity
            style={styles.settingRow}
            onPress={async () => {
              await switchDemoUser('admin');
              if (onNavigateToAdmin) onNavigateToAdmin();
            }}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.accentDark} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.settingTitle}>Switch to Administrator Portal</Text>
                <Text style={styles.settingSubtitle}>Review member loans and system KPIs</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Reset Demo Data Button */}
          <TouchableOpacity style={styles.settingRow} onPress={handleResetData}>
            <View style={styles.settingLeft}>
              <Ionicons name="refresh-circle-outline" size={20} color={COLORS.gold} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.settingTitle}>Reset Demo Data</Text>
                <Text style={styles.settingSubtitle}>Restore initial sample records</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <Button
          title="Sign Out of SACCO"
          onPress={logout}
          variant="danger"
          size="lg"
          iconName="log-out-outline"
          fullWidth
          style={{ marginTop: 8 }}
        />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <CustomModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        title="Edit Profile Information"
        subtitle="Keep your communication records up to date"
      >
        <InputField
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="+254 700 000 000"
          keyboardType="phone-pad"
          iconName="call-outline"
          required
        />

        <InputField
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="member@example.com"
          keyboardType="email-address"
          iconName="mail-outline"
          required
          autoCapitalize="none"
        />

        <InputField
          label="Residential / Postal Address"
          value={address}
          onChangeText={setAddress}
          placeholder="Street, City, Box"
          iconName="location-outline"
          required
        />

        <Button
          title="Save Changes"
          onPress={handleSaveProfile}
          loading={savingProfile}
          variant="primary"
          size="lg"
          iconName="checkmark"
          fullWidth
          style={{ marginTop: 10 }}
        />
      </CustomModal>

      {/* CHANGE PASSWORD MODAL */}
      <CustomModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
        title="Change Password"
        subtitle="Ensure your new password contains 6+ characters"
      >
        <InputField
          label="Current Password"
          value={currentPass}
          onChangeText={setCurrentPass}
          placeholder="Enter current password"
          iconName="lock-closed-outline"
          secureTextEntry
          required
        />

        <InputField
          label="New Password"
          value={newPass}
          onChangeText={setNewPass}
          placeholder="Minimum 6 characters"
          iconName="lock-closed-outline"
          secureTextEntry
          required
        />

        <InputField
          label="Confirm New Password"
          value={confirmPass}
          onChangeText={setConfirmPass}
          placeholder="Re-type new password"
          iconName="lock-closed-outline"
          secureTextEntry
          required
        />

        <Button
          title="Update Password"
          onPress={handleChangePassword}
          loading={changingPass}
          variant="accent"
          size="lg"
          fullWidth
          style={{ marginTop: 10 }}
        />
      </CustomModal>

      {/* AVATAR CHOOSER MODAL */}
      <CustomModal
        visible={avatarModalVisible}
        onClose={() => setAvatarModalVisible(false)}
        title="Choose Profile Avatar"
        subtitle="Select your preferred profile photograph"
      >
        <View style={styles.avatarsGrid}>
          {avatarOptions.map((url, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.avatarChoice}
              onPress={() => handleSelectAvatar(url)}
            >
              <Image source={{ uri: url }} style={styles.avatarChoiceImg} />
            </TouchableOpacity>
          ))}
        </View>
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
  profileHeaderCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.small,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  avatarFallback: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  avatarCameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fullName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  memberNum: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  themePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  themePillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  avatarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  avatarChoice: {
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    borderRadius: 35,
    padding: 2,
  },
  avatarChoiceImg: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
});


import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../../utils/theme';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register } = useAuth();
  const { colors, isDark } = useTheme();

  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    else if (fullName.trim().split(' ').length < 2) {
      newErrors.fullName = 'Please enter both first and last name.';
    }

    if (!nationalId.trim()) newErrors.nationalId = 'National ID / Passport is required.';
    else if (nationalId.trim().length < 6) {
      newErrors.nationalId = 'National ID must be at least 6 digits.';
    }

    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    else if (!/^\+?[0-9\s-]{9,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid telephone number (e.g. +254 712 345678).';
    }

    if (!email.trim()) newErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!dob.trim()) newErrors.dob = 'Date of birth is required (YYYY-MM-DD).';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(dob.trim())) {
      newErrors.dob = 'Use format YYYY-MM-DD (e.g. 1995-04-12).';
    }

    if (!address.trim()) newErrors.address = 'Physical/Postal address is required.';

    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      newErrors.terms = 'You must accept the SACCO membership bylaws.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    const res = await register({
      memberNumber: '', // auto-generated
      fullName: fullName.trim(),
      nationalId: nationalId.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      gender,
      dob: dob.trim(),
      address: address.trim(),
      password,
    });
    setLoading(false);

    if (res.success && res.user) {
      Alert.alert(
        'Registration Successful! 🎉',
        `Welcome to PESA PAP SACCO! Your assigned Member Number is: ${res.user.memberNumber}. You can now start saving and accessing credit facilities.`,
        [{ text: 'Continue to Dashboard' }]
      );
    } else {
      Alert.alert('Registration Error', res.message || 'Unable to complete registration.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onNavigateToLogin}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={[styles.backBtnText, { color: colors.textPrimary }]}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.titleArea}>
          <Text style={[styles.mainTitle, { color: colors.textPrimary }]}>Member Registration</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Join PESA PAP SACCO to unlock financial security, high-yield savings, and affordable credit.
          </Text>
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          {/* Section: Personal Details */}
          <Text style={styles.sectionHeader}>1. PERSONAL DETAILS</Text>

          <InputField
            label="Full Legal Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. David Kiprono Cheruiyot"
            iconName="person-outline"
            error={errors.fullName}
            required
            autoCapitalize="words"
          />

          <InputField
            label="National ID / Passport Number"
            value={nationalId}
            onChangeText={setNationalId}
            placeholder="e.g. 29876543"
            iconName="card-outline"
            keyboardType="number-pad"
            error={errors.nationalId}
            required
          />

          {/* Gender Selector */}
          <View style={styles.genderContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>Gender</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderChip,
                    gender === g && styles.genderChipSelected,
                  ]}
                  onPress={() => setGender(g)}
                >
                  <Ionicons
                    name={
                      gender === g
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={16}
                    color={gender === g ? COLORS.primary : COLORS.textMuted}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.genderChipText,
                      gender === g && styles.genderChipTextSelected,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <InputField
            label="Date of Birth"
            value={dob}
            onChangeText={setDob}
            placeholder="YYYY-MM-DD (e.g. 1992-08-23)"
            iconName="calendar-outline"
            error={errors.dob}
            required
          />

          {/* Section: Contact & Residence */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>2. CONTACT & LOCATION</Text>

          <InputField
            label="Mobile Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. +254 712 345 678"
            iconName="call-outline"
            keyboardType="phone-pad"
            error={errors.phone}
            required
          />

          <InputField
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="e.g. member@example.com"
            iconName="mail-outline"
            keyboardType="email-address"
            error={errors.email}
            required
            autoCapitalize="none"
          />

          <InputField
            label="Residential / Postal Address"
            value={address}
            onChangeText={setAddress}
            placeholder="e.g. Upper Hill, P.O. Box 45000, Nairobi"
            iconName="location-outline"
            error={errors.address}
            required
          />

          {/* Section: Security */}
          <Text style={[styles.sectionHeader, { marginTop: 16 }]}>3. ACCOUNT SECURITY</Text>

          <InputField
            label="Create Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Minimum 6 characters"
            iconName="lock-closed-outline"
            secureTextEntry
            error={errors.password}
            helperText="Include letters and numbers for strong security"
            required
          />

          <InputField
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            iconName="lock-closed-outline"
            secureTextEntry
            error={errors.confirmPassword}
            required
          />

          {/* Terms checkbox */}
          <TouchableOpacity
            style={styles.termsRow}
            onPress={() => setAgreeTerms(!agreeTerms)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={agreeTerms ? 'checkbox' : 'square-outline'}
              size={20}
              color={agreeTerms ? COLORS.accent : COLORS.textMuted}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.termsText}>
              I declare that the information provided is accurate and agree to abide by the SACCO Bylaws & Cooperative Act.
            </Text>
          </TouchableOpacity>
          {errors.terms && <Text style={styles.termsError}>{errors.terms}</Text>}

          <Button
            title="Complete Registration"
            onPress={handleRegister}
            loading={loading}
            variant="accent"
            size="lg"
            iconName="checkmark-circle-outline"
            fullWidth
            style={{ marginTop: 18 }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 44,
    paddingBottom: 40,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  titleArea: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  sectionHeader: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.accentDark,
    letterSpacing: 1,
    marginBottom: 12,
  },
  genderContainer: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  requiredAsterisk: {
    color: COLORS.danger,
    marginLeft: 3,
    fontSize: 13,
    fontWeight: '700',
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#FFFFFF',
  },
  genderChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  genderChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  genderChipTextSelected: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  termsText: {
    flex: 1,
    fontSize: 11.5,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  termsError: {
    fontSize: 11,
    color: COLORS.danger,
    marginTop: 4,
    fontWeight: '500',
  },
});


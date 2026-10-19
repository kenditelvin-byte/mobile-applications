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
import { InputField } from '../../components/common/InputField';
import { Button } from '../../components/common/Button';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../../utils/theme';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
}) => {
  const { resetPassword } = useAuth();

  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = () => {
    setError('');
    if (!identifier.trim()) {
      setError('Please provide your registered Email or Member Number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('verify');
      Alert.alert(
        'Verification Code Sent',
        'A 6-digit verification code has been dispatched to your registered phone/email (Demo OTP: 458921).'
      );
    }, 700);
  };

  const handleVerifyOtp = () => {
    setError('');
    if (otp.trim() !== '458921' && otp.trim().length !== 6) {
      setError('Invalid code. Please enter the demo OTP: 458921');
      return;
    }
    setStep('reset');
  };

  const handleResetPassword = async () => {
    setError('');
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(identifier, newPassword);
    setLoading(false);

    if (res.success) {
      Alert.alert('Password Updated', res.message, [
        { text: 'Back to Sign In', onPress: onNavigateToLogin },
      ]);
    } else {
      setError(res.message || 'Password reset failed.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
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
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
          <Text style={styles.backBtnText}>Back to Sign In</Text>
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Ionicons name="key-outline" size={32} color={COLORS.primary} />
        </View>

        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
          {step === 'request' && 'Enter your registered details to receive an authentication OTP.'}
          {step === 'verify' && 'Enter the 6-digit authentication OTP sent to your contact.'}
          {step === 'reset' && 'Create and confirm your new secure password.'}
        </Text>

        <View style={styles.card}>
          {!!error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.danger} style={{ marginRight: 6 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {step === 'request' && (
            <>
              <InputField
                label="Email or Member Number"
                value={identifier}
                onChangeText={setIdentifier}
                placeholder="e.g. david.kiprono@gmail.com"
                iconName="mail-outline"
                required
                autoCapitalize="none"
              />
              <Button
                title="Send Verification Code"
                onPress={handleRequestOtp}
                loading={loading}
                variant="primary"
                size="lg"
                iconName="paper-plane-outline"
                fullWidth
              />
            </>
          )}

          {step === 'verify' && (
            <>
              <InputField
                label="Verification Code (Demo: 458921)"
                value={otp}
                onChangeText={setOtp}
                placeholder="6-digit OTP"
                iconName="shield-checkmark-outline"
                keyboardType="number-pad"
                required
              />
              <Button
                title="Verify OTP"
                onPress={handleVerifyOtp}
                variant="accent"
                size="lg"
                fullWidth
              />
              <TouchableOpacity
                onPress={() => setStep('request')}
                style={{ alignSelf: 'center', marginTop: 14 }}
              >
                <Text style={styles.resendText}>Change Identifier / Resend</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 'reset' && (
            <>
              <InputField
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Minimum 6 characters"
                iconName="lock-closed-outline"
                secureTextEntry
                required
              />
              <InputField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                iconName="lock-closed-outline"
                secureTextEntry
                required
              />
              <Button
                title="Save New Password"
                onPress={handleResetPassword}
                loading={loading}
                variant="primary"
                size="lg"
                fullWidth
              />
            </>
          )}
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
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 6,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 22,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '500',
    flex: 1,
  },
  resendText: {
    fontSize: 12.5,
    color: COLORS.secondary,
    fontWeight: '600',
  },
});


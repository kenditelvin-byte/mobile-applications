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

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const { login, switchDemoUser } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();

  const [identifier, setIdentifier] = useState('david.kiprono@gmail.com');
  const [password, setPassword] = useState('Member123!');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');
    if (!identifier.trim()) {
      setErrorMessage('Please enter your Member Number, Email or National ID.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await login(identifier, password);
    setLoading(false);

    if (!res.success) {
      setErrorMessage(res.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickDemo = async (role: 'member' | 'admin' | 'pending') => {
    setLoading(true);
    await switchDemoUser(role);
    setLoading(false);
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
        {/* Top Bar with Dark/Light Mode Switcher */}
        <View style={styles.topBarRow}>
          <TouchableOpacity
            style={[styles.themeToggleBtn, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
            onPress={toggleTheme}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#FBBF24' : colors.primary}
            />
            <Text style={[styles.themeToggleText, { color: colors.textPrimary }]}>
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brand Header */}
        <View style={styles.headerArea}>
          <View style={styles.logoCircle}>
            <Ionicons name="shield-checkmark" size={38} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: isDark ? colors.primary : COLORS.primary }]}>PESA PAP SACCO</Text>
          <Text style={styles.brandSubtitle}>Savings & Credit Cooperative Society</Text>
          <Text style={styles.tagline}>Empowering Financial Growth Together</Text>
        </View>

        {/* Login Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Account Sign In</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
            Access your savings, loans, and investment portfolio
          </Text>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.danger} style={{ marginRight: 8 }} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          )}

          <InputField
            label="Member Number, Email or ID"
            value={identifier}
            onChangeText={setIdentifier}
            placeholder="e.g. SACCO-MBR-1042 or email"
            iconName="person-outline"
            required
            autoCapitalize="none"
          />

          <InputField
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your secure password"
            iconName="lock-closed-outline"
            secureTextEntry
            required
          />

          <TouchableOpacity
            onPress={onNavigateToForgotPassword}
            style={styles.forgotBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Sign In to Account"
            onPress={handleLogin}
            loading={loading}
            variant="primary"
            size="lg"
            iconName="log-in-outline"
            fullWidth
            style={styles.signInBtn}
          />

          {/* Quick Demo Switcher for Evaluator/Lecturer */}
          <View style={styles.demoSection}>
            <View style={styles.demoDividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.demoDividerText}>1-CLICK DEMO ACCESS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoButtonsRow}>
              <TouchableOpacity
                style={[styles.demoPill, { borderColor: COLORS.accentDark }]}
                onPress={() => handleQuickDemo('member')}
              >
                <Ionicons name="person" size={13} color={COLORS.accentDark} />
                <Text style={[styles.demoPillText, { color: COLORS.accentDark }]}>Member Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { borderColor: COLORS.primary }]}
                onPress={() => handleQuickDemo('admin')}
              >
                <Ionicons name="shield-outline" size={13} color={COLORS.primary} />
                <Text style={[styles.demoPillText, { color: COLORS.primary }]}>Admin Demo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.demoPill, { borderColor: COLORS.gold }]}
                onPress={() => handleQuickDemo('pending')}
              >
                <Ionicons name="time-outline" size={13} color={COLORS.gold} />
                <Text style={[styles.demoPillText, { color: COLORS.gold }]}>Pending Mbr</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Register Footer */}
          <View style={styles.registerRow}>
            <Text style={styles.registerPrompt}>New to the SACCO? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.registerLink}>Register as Member</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security badge */}
        <View style={styles.securityRow}>
          <Ionicons name="lock-closed" size={14} color={COLORS.textMuted} />
          <Text style={styles.securityText}>256-bit Bank Grade Encrypted Connection</Text>
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
  topBarRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  themeToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  themeToggleText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  headerArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentDark,
    marginTop: 2,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...SHADOWS.medium,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.dangerBg,
    borderRadius: BORDER_RADIUS.sm,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorBannerText: {
    fontSize: 12,
    color: COLORS.danger,
    fontWeight: '600',
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 18,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 12.5,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  signInBtn: {
    marginBottom: 14,
  },
  demoSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  demoDividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: COLORS.surface,
  },
  demoPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    marginLeft: 4,
  },
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  registerPrompt: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentDark,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  securityText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});


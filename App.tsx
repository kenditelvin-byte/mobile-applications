import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { SACCOProvider, useSACCO } from './src/context/SACCOContext';

// Auth Screens
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { RegisterScreen } from './src/screens/auth/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/auth/ForgotPasswordScreen';

// Member Screens
import { DashboardScreen } from './src/screens/member/DashboardScreen';
import { SavingsScreen } from './src/screens/member/SavingsScreen';
import { LoansScreen } from './src/screens/member/LoansScreen';
import { RepaymentScreen } from './src/screens/member/RepaymentScreen';
import { TransactionsScreen } from './src/screens/member/TransactionsScreen';
import { SharesScreen } from './src/screens/member/SharesScreen';
import { NotificationsScreen } from './src/screens/member/NotificationsScreen';
import { ProfileScreen } from './src/screens/member/ProfileScreen';

// Admin Screens
import { AdminDashboardScreen } from './src/screens/admin/AdminDashboardScreen';
import { AdminMembersScreen } from './src/screens/admin/AdminMembersScreen';
import { AdminLoansScreen } from './src/screens/admin/AdminLoansScreen';
import { AdminTransactionsScreen } from './src/screens/admin/AdminTransactionsScreen';
import { AdminProductsScreen } from './src/screens/admin/AdminProductsScreen';
import { AdminAnnouncementsScreen } from './src/screens/admin/AdminAnnouncementsScreen';
import { AdminReportsScreen } from './src/screens/admin/AdminReportsScreen';

import { Loan } from './src/types';
import { COLORS, SHADOWS } from './src/utils/theme';

type AuthRoute = 'login' | 'register' | 'forgot_password';
type MemberTab = 'Dashboard' | 'Savings' | 'Loans' | 'Transactions' | 'Profile';
type MemberSubRoute = 'Repayment' | 'Shares' | 'Notifications';

type AdminTab = 'AdminDashboard' | 'AdminMembers' | 'AdminLoans' | 'AdminTransactions' | 'AdminReports';
type AdminSubRoute = 'AdminProducts' | 'AdminAnnouncements';

const NavigationContainer: React.FC = () => {
  const { currentUser, role, isLoading } = useAuth();
  const { unreadNotifsCount } = useSACCO();
  const { colors, isDark } = useTheme();

  // Auth navigation state
  const [authRoute, setAuthRoute] = useState<AuthRoute>('login');

  // Member navigation state
  const [memberTab, setMemberTab] = useState<MemberTab>('Dashboard');
  const [memberSubRoute, setMemberSubRoute] = useState<MemberSubRoute | null>(null);
  const [repayTargetLoan, setRepayTargetLoan] = useState<Loan | undefined>(undefined);

  // Admin navigation state
  const [adminTab, setAdminTab] = useState<AdminTab>('AdminDashboard');
  const [adminSubRoute, setAdminSubRoute] = useState<AdminSubRoute | null>(null);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Initializing PESA PAP SACCO...
        </Text>
      </View>
    );
  }

  // 1. Unauthenticated Flow
  if (!currentUser) {
    if (authRoute === 'register') {
      return <RegisterScreen onNavigateToLogin={() => setAuthRoute('login')} />;
    }
    if (authRoute === 'forgot_password') {
      return <ForgotPasswordScreen onNavigateToLogin={() => setAuthRoute('login')} />;
    }
    return (
      <LoginScreen
        onNavigateToRegister={() => setAuthRoute('register')}
        onNavigateToForgotPassword={() => setAuthRoute('forgot_password')}
      />
    );
  }

  // 2. Administrator Flow
  if (role === 'admin') {
    const handleAdminNavigate = (screen: string) => {
      if (screen === 'AdminProducts' || screen === 'AdminAnnouncements') {
        setAdminSubRoute(screen);
      } else if (
        screen === 'AdminDashboard' ||
        screen === 'AdminMembers' ||
        screen === 'AdminLoans' ||
        screen === 'AdminTransactions' ||
        screen === 'AdminReports'
      ) {
        setAdminSubRoute(null);
        setAdminTab(screen as AdminTab);
      }
    };

    const renderAdminContent = () => {
      if (adminSubRoute === 'AdminProducts') {
        return <AdminProductsScreen onBack={() => setAdminSubRoute(null)} />;
      }
      if (adminSubRoute === 'AdminAnnouncements') {
        return <AdminAnnouncementsScreen onBack={() => setAdminSubRoute(null)} />;
      }

      switch (adminTab) {
        case 'AdminMembers':
          return <AdminMembersScreen onBack={() => setAdminTab('AdminDashboard')} />;
        case 'AdminLoans':
          return <AdminLoansScreen onBack={() => setAdminTab('AdminDashboard')} />;
        case 'AdminTransactions':
          return <AdminTransactionsScreen onBack={() => setAdminTab('AdminDashboard')} />;
        case 'AdminReports':
          return <AdminReportsScreen onBack={() => setAdminTab('AdminDashboard')} />;
        case 'AdminDashboard':
        default:
          return <AdminDashboardScreen onNavigate={handleAdminNavigate} />;
      }
    };

    return (
      <View style={[styles.appShell, { backgroundColor: colors.background }]}>
        <View style={styles.screenArea}>{renderAdminContent()}</View>

        {/* Admin Bottom Navigation Bar */}
        {!adminSubRoute && (
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.divider,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setAdminTab('AdminDashboard')}
            >
              <Ionicons
                name={adminTab === 'AdminDashboard' ? 'speedometer' : 'speedometer-outline'}
                size={22}
                color={adminTab === 'AdminDashboard' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: adminTab === 'AdminDashboard' ? colors.primary : colors.textMuted },
                  adminTab === 'AdminDashboard' && styles.tabLabelActive,
                ]}
              >
                Overview
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setAdminTab('AdminMembers')}
            >
              <Ionicons
                name={adminTab === 'AdminMembers' ? 'people' : 'people-outline'}
                size={22}
                color={adminTab === 'AdminMembers' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: adminTab === 'AdminMembers' ? colors.primary : colors.textMuted },
                  adminTab === 'AdminMembers' && styles.tabLabelActive,
                ]}
              >
                Members
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setAdminTab('AdminLoans')}
            >
              <Ionicons
                name={adminTab === 'AdminLoans' ? 'cash' : 'cash-outline'}
                size={22}
                color={adminTab === 'AdminLoans' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: adminTab === 'AdminLoans' ? colors.primary : colors.textMuted },
                  adminTab === 'AdminLoans' && styles.tabLabelActive,
                ]}
              >
                Loans Desk
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setAdminTab('AdminTransactions')}
            >
              <Ionicons
                name={adminTab === 'AdminTransactions' ? 'receipt' : 'receipt-outline'}
                size={22}
                color={adminTab === 'AdminTransactions' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: adminTab === 'AdminTransactions' ? colors.primary : colors.textMuted },
                  adminTab === 'AdminTransactions' && styles.tabLabelActive,
                ]}
              >
                Audit Trail
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.tabItem}
              onPress={() => setAdminTab('AdminReports')}
            >
              <Ionicons
                name={adminTab === 'AdminReports' ? 'bar-chart' : 'bar-chart-outline'}
                size={22}
                color={adminTab === 'AdminReports' ? colors.primary : colors.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: adminTab === 'AdminReports' ? colors.primary : colors.textMuted },
                  adminTab === 'AdminReports' && styles.tabLabelActive,
                ]}
              >
                Reports
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // 3. Member Flow
  const handleMemberNavigate = (screen: string) => {
    if (screen === 'Repayment') {
      setRepayTargetLoan(undefined);
      setMemberSubRoute('Repayment');
    } else if (screen === 'Shares') {
      setMemberSubRoute('Shares');
    } else if (screen === 'Notifications') {
      setMemberSubRoute('Notifications');
    } else if (
      screen === 'Dashboard' ||
      screen === 'Savings' ||
      screen === 'Loans' ||
      screen === 'Transactions' ||
      screen === 'Profile'
    ) {
      setMemberSubRoute(null);
      setMemberTab(screen as MemberTab);
    }
  };

  const renderMemberContent = () => {
    if (memberSubRoute === 'Repayment') {
      return (
        <RepaymentScreen
          onBack={() => setMemberSubRoute(null)}
          initialLoan={repayTargetLoan}
        />
      );
    }
    if (memberSubRoute === 'Shares') {
      return <SharesScreen onBack={() => setMemberSubRoute(null)} />;
    }
    if (memberSubRoute === 'Notifications') {
      return (
        <NotificationsScreen
          onBack={() => setMemberSubRoute(null)}
          onNavigateToScreen={(s) => {
            setMemberSubRoute(null);
            handleMemberNavigate(s);
          }}
        />
      );
    }

    switch (memberTab) {
      case 'Savings':
        return <SavingsScreen onBack={() => setMemberTab('Dashboard')} />;
      case 'Loans':
        return (
          <LoansScreen
            onBack={() => setMemberTab('Dashboard')}
            onNavigateToRepay={(loan) => {
              setRepayTargetLoan(loan);
              setMemberSubRoute('Repayment');
            }}
          />
        );
      case 'Transactions':
        return <TransactionsScreen onBack={() => setMemberTab('Dashboard')} />;
      case 'Profile':
        return (
          <ProfileScreen
            onBack={() => setMemberTab('Dashboard')}
          />
        );
      case 'Dashboard':
      default:
        return <DashboardScreen onNavigate={handleMemberNavigate} />;
    }
  };

  return (
    <View style={[styles.appShell, { backgroundColor: colors.background }]}>
      <View style={styles.screenArea}>{renderMemberContent()}</View>

      {/* Member Bottom Tab Navigation Bar */}
      {!memberSubRoute && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: colors.surface,
              borderTopColor: colors.divider,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setMemberTab('Dashboard')}
          >
            <Ionicons
              name={memberTab === 'Dashboard' ? 'grid' : 'grid-outline'}
              size={22}
              color={memberTab === 'Dashboard' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: memberTab === 'Dashboard' ? colors.primary : colors.textMuted },
                memberTab === 'Dashboard' && styles.tabLabelActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setMemberTab('Savings')}
          >
            <Ionicons
              name={memberTab === 'Savings' ? 'wallet' : 'wallet-outline'}
              size={22}
              color={memberTab === 'Savings' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: memberTab === 'Savings' ? colors.primary : colors.textMuted },
                memberTab === 'Savings' && styles.tabLabelActive,
              ]}
            >
              Savings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setMemberTab('Loans')}
          >
            <Ionicons
              name={memberTab === 'Loans' ? 'cash' : 'cash-outline'}
              size={22}
              color={memberTab === 'Loans' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: memberTab === 'Loans' ? colors.primary : colors.textMuted },
                memberTab === 'Loans' && styles.tabLabelActive,
              ]}
            >
              Loans
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setMemberTab('Transactions')}
          >
            <Ionicons
              name={memberTab === 'Transactions' ? 'receipt' : 'receipt-outline'}
              size={22}
              color={memberTab === 'Transactions' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: memberTab === 'Transactions' ? colors.primary : colors.textMuted },
                memberTab === 'Transactions' && styles.tabLabelActive,
              ]}
            >
              Statement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => setMemberTab('Profile')}
          >
            <Ionicons
              name={memberTab === 'Profile' ? 'person' : 'person-outline'}
              size={22}
              color={memberTab === 'Profile' ? colors.primary : colors.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: memberTab === 'Profile' ? colors.primary : colors.textMuted },
                memberTab === 'Profile' && styles.tabLabelActive,
              ]}
            >
              Profile
            </Text>
            {unreadNotifsCount > 0 && <View style={styles.tabDot} />}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const AppShellWithTheme: React.FC = () => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.surface }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AuthProvider>
        <SACCOProvider>
          <NavigationContainer />
        </SACCOProvider>
      </AuthProvider>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppShellWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  appShell: {
    flex: 1,
  },
  screenArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    height: Platform.OS === 'ios' ? 70 : 60,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 14 : 6,
    paddingTop: 6,
    ...SHADOWS.medium,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10.5,
    marginTop: 3,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  tabDot: {
    position: 'absolute',
    top: 4,
    right: 22,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.danger,
  },
});

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSACCO } from '../../context/SACCOContext';
import { Header } from '../../components/common/Header';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { NotificationItem } from '../../types';
import { COLORS, BORDER_RADIUS, SHADOWS, formatDate } from '../../utils/theme';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigateToScreen: (screen: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  onBack,
  onNavigateToScreen,
}) => {
  const {
    myNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSACCO();

  const [filterUnread, setFilterUnread] = useState(false);

  const displayedNotifications = myNotifications.filter((n) => {
    if (filterUnread) return !n.isRead;
    return true;
  });

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle' as const, color: COLORS.accent, bg: '#ECFDF5' };
      case 'alert':
        return { icon: 'alert-circle' as const, color: COLORS.danger, bg: '#FEE2E2' };
      case 'warning':
        return { icon: 'warning' as const, color: COLORS.gold, bg: '#FEF3C7' };
      case 'info':
      default:
        return { icon: 'information-circle' as const, color: COLORS.primary, bg: '#EFF6FF' };
    }
  };

  const handlePressNotification = async (item: NotificationItem) => {
    if (!item.isRead) {
      await markNotificationRead(item.id);
    }
    if (item.linkScreen) {
      onNavigateToScreen(item.linkScreen);
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Notifications"
        subtitle="Real-time SACCO Alerts & Statements"
        onBack={onBack}
        rightAction={{
          icon: 'checkmark-done-outline',
          color: COLORS.primary,
          onPress: markAllNotificationsRead,
        }}
      />

      {/* Filter toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.notifCount}>
          {displayedNotifications.length} Alert{displayedNotifications.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.filterToggle, filterUnread && styles.filterToggleActive]}
          onPress={() => setFilterUnread(!filterUnread)}
        >
          <Ionicons
            name={filterUnread ? 'checkbox' : 'square-outline'}
            size={16}
            color={filterUnread ? COLORS.primary : COLORS.textMuted}
          />
          <Text style={[styles.filterText, filterUnread && styles.filterTextActive]}>
            Unread Only
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {displayedNotifications.length === 0 ? (
          <EmptyState
            icon="notifications-off-outline"
            title="No Notifications"
            description={
              filterUnread
                ? 'All caught up! You have read all your notifications.'
                : 'No alerts in your inbox at this time.'
            }
          />
        ) : (
          <View style={styles.listCard}>
            {displayedNotifications.map((notif, idx) => {
              const meta = getNotifIcon(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifRow,
                    idx < displayedNotifications.length - 1 && styles.notifRowBorder,
                    !notif.isRead && styles.unreadRow,
                  ]}
                  onPress={() => handlePressNotification(notif)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={20} color={meta.color} />
                  </View>

                  <View style={styles.textCol}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !notif.isRead && { fontWeight: '800' },
                        ]}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      {!notif.isRead && <View style={styles.unreadDot} />}
                    </View>

                    <Text style={styles.notifMessage} numberOfLines={3}>
                      {notif.message}
                    </Text>

                    <View style={styles.metaRow}>
                      <Text style={styles.metaTime}>
                        {formatDate(notif.date)} at {notif.time}
                      </Text>
                      {notif.linkScreen && (
                        <View style={styles.linkPill}>
                          <Text style={styles.linkText}>View {notif.linkScreen}</Text>
                          <Ionicons name="arrow-forward" size={11} color={COLORS.secondary} />
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
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
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  notifCount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  filterToggleActive: {
    backgroundColor: '#EFF6FF',
  },
  filterText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.primary,
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
  notifRow: {
    flexDirection: 'row',
    paddingVertical: 14,
  },
  notifRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  unreadRow: {
    backgroundColor: '#FAFCFF',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.secondary,
    marginLeft: 6,
  },
  notifMessage: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  metaTime: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  linkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  linkText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.secondary,
  },
});


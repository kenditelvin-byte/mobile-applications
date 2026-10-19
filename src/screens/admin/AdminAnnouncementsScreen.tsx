import React, { useState } from 'react';
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
import { Badge } from '../../components/common/Badge';
import { InputField } from '../../components/common/InputField';
import { CustomModal } from '../../components/common/CustomModal';
import { COLORS, BORDER_RADIUS, SHADOWS, formatDate } from '../../utils/theme';

interface AdminAnnouncementsScreenProps {
  onBack: () => void;
}

export const AdminAnnouncementsScreen: React.FC<AdminAnnouncementsScreenProps> = ({ onBack }) => {
  const { announcements, createAnnouncement } = useSACCO();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal');
  const [loading, setLoading] = useState(false);

  const handlePost = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and announcement message.');
      return;
    }

    setLoading(true);
    const res = await createAnnouncement(title.trim(), content.trim(), priority);
    setLoading(false);

    if (res.success) {
      setModalVisible(false);
      setTitle('');
      setContent('');
      Alert.alert(
        'Announcement Broadcasted',
        'Official notice published and alert notification pushed to all active members.'
      );
    } else {
      Alert.alert('Error', 'Unable to broadcast announcement.');
    }
  };

  const getPriorityVariant = (p: 'normal' | 'high' | 'urgent') => {
    switch (p) {
      case 'urgent':
        return 'danger';
      case 'high':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="SACCO Announcements"
        subtitle="Broadcast Messages & Official Notices"
        onBack={onBack}
        rightAction={{
          icon: 'megaphone',
          color: COLORS.primary,
          onPress: () => setModalVisible(true),
        }}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Button
          title="Create New Announcement"
          onPress={() => setModalVisible(true)}
          variant="primary"
          size="lg"
          iconName="megaphone-outline"
          fullWidth
          style={{ marginBottom: 16 }}
        />

        <Text style={styles.sectionHeader}>PUBLISHED ANNOUNCEMENTS ({announcements.length})</Text>

        {announcements.map((item) => (
          <View key={item.id} style={styles.anncCard}>
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <Badge label={item.priority.toUpperCase()} variant={getPriorityVariant(item.priority)} size="sm" />
                <Text style={styles.authorText}>By {item.author}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>

            <Text style={styles.anncTitle}>{item.title}</Text>
            <Text style={styles.anncContent}>{item.content}</Text>
          </View>
        ))}
      </ScrollView>

      {/* CREATE ANNOUNCEMENT MODAL */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Broadcast Announcement"
        subtitle="Will be displayed to all members in dashboard and alerts"
      >
        <Text style={styles.modalSectionLabel}>PRIORITY LEVEL</Text>
        <View style={styles.priorityRow}>
          {(['normal', 'high', 'urgent'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityBtn,
                priority === p && styles.priorityBtnActive,
              ]}
              onPress={() => setPriority(p)}
            >
              <Text
                style={[
                  styles.priorityBtnText,
                  priority === p && styles.priorityBtnTextActive,
                ]}
              >
                {p.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <InputField
          label="Announcement Title"
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Dividend Distribution Notice 2026"
          iconName="newspaper-outline"
          required
        />

        <InputField
          label="Full Message Content"
          value={content}
          onChangeText={setContent}
          placeholder="Write the full announcement text here..."
          iconName="chatbox-ellipses-outline"
          multiline
          numberOfLines={4}
          required
        />

        <Button
          title="Broadcast to All Members"
          onPress={handlePost}
          loading={loading}
          variant="accent"
          size="lg"
          iconName="paper-plane"
          fullWidth
          style={{ marginTop: 12 }}
        />
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
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  anncCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  anncTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  anncContent: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  priorityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1.2,
    borderColor: COLORS.cardBorder,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  priorityBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#EFF6FF',
  },
  priorityBtnText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  priorityBtnTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
});


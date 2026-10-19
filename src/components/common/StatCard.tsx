import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, BORDER_RADIUS, SHADOWS } from '../../utils/theme';

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  subValue?: string;
  subValueColor?: string;
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  subValue,
  subValueColor,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const themeColor = color || colors.primary;

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.cardBorder,
        },
        !isDark && SHADOWS.small,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${themeColor}20` }]}>
          <Ionicons name={icon} size={20} color={themeColor} />
        </View>
        {onPress && (
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </View>
      <Text style={[styles.value, { color: colors.textPrimary }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[styles.label, { color: colors.textSecondary }]} numberOfLines={1}>
        {label}
      </Text>
      {subValue && (
        <Text
          style={[styles.subValue, { color: subValueColor || colors.textMuted }]}
          numberOfLines={1}
        >
          {subValue}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.touchable}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.touchable}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
    minWidth: 140,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 14,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  subValue: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});

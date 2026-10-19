import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../utils/theme';

interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  size = 'md',
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: '#DCFCE7', text: '#15803D', dot: '#22C55E' };
      case 'warning':
        return { bg: '#FEF3C7', text: '#B45309', dot: '#F59E0B' };
      case 'danger':
        return { bg: '#FEE2E2', text: '#B91C1C', dot: '#EF4444' };
      case 'info':
        return { bg: '#DBEAFE', text: '#1D4ED8', dot: '#3B82F6' };
      case 'primary':
        return { bg: '#E0E7FF', text: '#3730A3', dot: '#6366F1' };
      default:
        return { bg: '#F1F5F9', text: '#475569', dot: '#94A3B8' };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, isSm && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }, isSm && styles.textSm]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 9,
    fontWeight: '700',
  },
});


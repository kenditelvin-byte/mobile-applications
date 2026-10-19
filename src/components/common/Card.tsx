import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { BORDER_RADIUS, SHADOWS } from '../../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'subtle';
  padding?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'elevated',
  padding = 16,
}) => {
  const { colors, isDark } = useTheme();

  const getContainerStyle = () => {
    switch (variant) {
      case 'outlined':
        return [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            padding,
          },
          style,
        ];
      case 'subtle':
        return [
          styles.card,
          {
            backgroundColor: colors.surfaceSubtle,
            borderWidth: 0,
            padding,
          },
          style,
        ];
      default:
        return [
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.cardBorder,
            borderWidth: 1,
            padding,
          },
          !isDark && SHADOWS.small,
          style,
        ];
    }
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={getContainerStyle()}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={getContainerStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS.lg,
  },
});

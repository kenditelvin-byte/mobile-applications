import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardTypeOptions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, BORDER_RADIUS } from '../../utils/theme';

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  iconName?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  style?: ViewStyle;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  iconName,
  error,
  helperText,
  required = false,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  autoCapitalize = 'none',
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(!secureTextEntry);

  const isPassword = secureTextEntry;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
        {required && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: isDark ? colors.surfaceSubtle : '#FFFFFF',
            borderColor: error ? colors.danger : isFocused ? colors.primary : colors.cardBorder,
          },
          isFocused && styles.inputFocused,
          !!error && (isDark ? styles.inputErrorDark : styles.inputErrorLight),
          disabled && { backgroundColor: isDark ? '#1E293B' : colors.surfaceSubtle },
          multiline && { height: numberOfLines * 24 + 20, alignItems: 'flex-start' },
        ]}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={error ? colors.danger : isFocused ? colors.primary : colors.textMuted}
            style={[styles.leftIcon, multiline && { marginTop: 12 }]}
          />
        )}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            { color: colors.textPrimary },
            multiline && { textAlignVertical: 'top', paddingTop: 10 },
          ]}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={19}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {!!error && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={13} color={colors.danger} style={{ marginRight: 4 }} />
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        </View>
      )}

      {!error && !!helperText && (
        <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  requiredAsterisk: {
    color: '#EF4444',
    marginLeft: 3,
    fontSize: 13,
    fontWeight: '700',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: BORDER_RADIUS.md,
    height: 48,
    paddingHorizontal: 12,
  },
  inputFocused: {
    borderWidth: 1.5,
  },
  inputErrorLight: {
    backgroundColor: '#FFF8F8',
  },
  inputErrorDark: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  leftIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  rightIcon: {
    padding: 4,
    marginLeft: 6,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11.5,
    marginTop: 4,
  },
});

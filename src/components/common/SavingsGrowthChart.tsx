import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { COLORS, BORDER_RADIUS, formatCurrency } from '../../utils/theme';

interface MonthData {
  month: string;
  amount: number;
  isProjected?: boolean;
}

interface SavingsGrowthChartProps {
  currentBalance: number;
  data?: MonthData[];
}

export const SavingsGrowthChart: React.FC<SavingsGrowthChartProps> = ({
  currentBalance,
  data,
}) => {
  const { colors, isDark } = useTheme();

  // Default realistic 6-month growth trail up to current balance
  const defaultData: MonthData[] = [
    { month: 'Oct', amount: Math.max(10000, Math.round(currentBalance * 0.45)) },
    { month: 'Nov', amount: Math.max(15000, Math.round(currentBalance * 0.58)) },
    { month: 'Dec', amount: Math.max(20000, Math.round(currentBalance * 0.72)) },
    { month: 'Jan', amount: Math.max(25000, Math.round(currentBalance * 0.81)) },
    { month: 'Feb', amount: Math.max(30000, Math.round(currentBalance * 0.92)) },
    { month: 'Mar', amount: currentBalance },
  ];

  const chartData = data || defaultData;
  const maxVal = Math.max(...chartData.map((d) => d.amount), 1);
  const [selectedIdx, setSelectedIdx] = useState<number>(chartData.length - 1);

  const selectedItem = chartData[selectedIdx] || chartData[chartData.length - 1];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Savings Growth Trajectory</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>6-Month Accumulated Trend</Text>
        </View>
        <View style={styles.trendPill}>
          <Ionicons name="trending-up" size={14} color={colors.accent} />
          <Text style={styles.trendText}>+18.4% YoY</Text>
        </View>
      </View>

      {/* Selected tooltip */}
      <View style={[styles.selectedBox, { backgroundColor: colors.surfaceSubtle }]}>
        <Text style={[styles.selectedLabel, { color: colors.textSecondary }]}>{selectedItem.month} Balance:</Text>
        <Text style={[styles.selectedValue, { color: colors.textPrimary }]}>{formatCurrency(selectedItem.amount)}</Text>
      </View>

      {/* Bars Chart */}
      <View style={[styles.chartArea, { borderBottomColor: colors.divider }]}>
        {chartData.map((item, index) => {
          const heightPercent = Math.max(15, Math.round((item.amount / maxVal) * 100));
          const isSelected = index === selectedIdx;

          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              onPress={() => setSelectedIdx(index)}
              style={styles.barColumn}
            >
              <View style={[styles.barTrack, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isSelected ? colors.accent : isDark ? colors.secondary : colors.primaryLight,
                      opacity: isSelected ? 1 : 0.65,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.monthLabel,
                  { color: isSelected ? colors.textPrimary : colors.textMuted },
                  isSelected && { fontWeight: '700' },
                ]}
              >
                {item.month}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    marginVertical: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 14.5,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 11.5,
    marginTop: 2,
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginLeft: 4,
  },
  selectedBox: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  selectedValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 24,
    height: 90,
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  monthLabel: {
    fontSize: 11,
    marginTop: 6,
    fontWeight: '500',
  },
});

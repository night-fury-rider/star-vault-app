import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../theme';
import { ThemeName } from '../../../theme';
import { Typography } from '../../../theme';

const THEMES: { name: ThemeName; label: string; color: string; bg: string }[] =
  [
    {
      name: 'pink',
      label: '🌸 Pink',
      color: '#E91E8C',
      bg: '#FFF0F6',
    },
    {
      name: 'skyblue',
      label: '🩵 Sky Blue',
      color: '#0288D1',
      bg: '#F0F8FF',
    },
    {
      name: 'orange',
      label: '🍊 Faint Orange',
      color: '#F57C00',
      bg: '#FFF8F0',
    },
  ];

const SettingsScreen = () => {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Section Title */}
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        APPEARANCE
      </Text>

      {/* Theme Cards */}
      <View style={styles.themeList}>
        {THEMES.map(t => {
          const isSelected = themeName === t.name;
          return (
            <TouchableOpacity
              key={t.name}
              onPress={() => setTheme(t.name)}
              style={[
                styles.themeCard,
                {
                  backgroundColor: t.bg,
                  borderColor: isSelected ? t.color : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
            >
              {/* Color Preview */}
              <View style={[styles.colorDot, { backgroundColor: t.color }]} />

              {/* Label */}
              <Text
                style={[
                  styles.themeLabel,
                  {
                    color: isSelected ? t.color : theme.text.primary,
                    fontWeight: isSelected ? '700' : '400',
                  },
                ]}
              >
                {t.label}
              </Text>

              {/* Selected Checkmark */}
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: t.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Current Theme Info */}
      <View
        style={[
          styles.infoBox,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.infoText, { color: theme.text.secondary }]}>
          Current theme:{' '}
          <Text style={[styles.infoValue, { color: theme.primary }]}>
            {THEMES.find(t => t.name === themeName)?.label}
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
  },
  themeList: {
    gap: 12,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 14,
  },
  themeLabel: {
    flex: 1,
    fontSize: 16,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  infoBox: {
    marginTop: 24,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoValue: {
    fontWeight: '700',
  },
});

export default SettingsScreen;

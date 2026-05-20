import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTheme } from '../../../theme';
import { ThemeName } from '../../../theme';
import { Typography } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { setUnlocked } from '../../../store/slices/access-slice';
import StorageService from '../../../services/StorageService';

// The disguised secret — looks like a CDN endpoint URL
const ENDPOINT_SECRET = 'https://cdn.starvault.io/v1/feed';
const ACCESS_KEY = 'starvault_access';

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

type EndpointStatus = 'idle' | 'connected' | 'unreachable';

const SettingsScreen = () => {
  const { theme, themeName, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isUnlocked = useAppSelector(state => state.access.isUnlocked);

  const [endpointValue, setEndpointValue] = useState('');
  const [endpointStatus, setEndpointStatus] = useState<EndpointStatus>('idle');

  const handleApplyEndpoint = () => {
    const trimmed = endpointValue.trim();

    if (trimmed === '') {
      setEndpointStatus('idle');
      dispatch(setUnlocked(false));
      StorageService.set(ACCESS_KEY, false);
      return;
    }

    if (trimmed === ENDPOINT_SECRET) {
      setEndpointStatus('connected');
      dispatch(setUnlocked(true));
      StorageService.set(ACCESS_KEY, true);
    } else {
      setEndpointStatus('unreachable');
      dispatch(setUnlocked(false));
      StorageService.set(ACCESS_KEY, false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset endpoint',
      'This will disconnect the content feed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setEndpointValue('');
            setEndpointStatus('idle');
            dispatch(setUnlocked(false));
            StorageService.set(ACCESS_KEY, false);
          },
        },
      ],
    );
  };

  const statusLabel: Record<EndpointStatus, string> = {
    idle: 'Not configured',
    connected: 'Connected',
    unreachable: 'Unreachable',
  };

  const statusColor: Record<EndpointStatus, string> = {
    idle: theme.text.muted,
    connected: theme.status.success,
    unreachable: theme.status.error,
  };

  const statusDot: Record<EndpointStatus, string> = {
    idle: '○',
    connected: '●',
    unreachable: '●',
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── APPEARANCE ───────────────────────────────── */}
      <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
        APPEARANCE
      </Text>

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
              <View style={[styles.colorDot, { backgroundColor: t.color }]} />
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
              {isSelected && (
                <View style={[styles.checkmark, { backgroundColor: t.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── DEVELOPER ────────────────────────────────── */}
      <Text
        style={[styles.sectionTitle, { color: theme.text.secondary, marginTop: 28 }]}
      >
        DEVELOPER
      </Text>

      <View
        style={[
          styles.devCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.devLabel, { color: theme.text.primary }]}>
          Content delivery endpoint
        </Text>
        <Text style={[styles.devDesc, { color: theme.text.muted }]}>
          Base URL used to resolve media assets and catalogue feeds. Contact
          support to obtain your organisation's endpoint.
        </Text>

        <TextInput
          style={[
            styles.endpointInput,
            {
              backgroundColor: theme.background,
              borderColor:
                endpointStatus === 'connected'
                  ? theme.status.success
                  : endpointStatus === 'unreachable'
                  ? theme.status.error
                  : theme.border,
              color: theme.text.primary,
            },
          ]}
          value={endpointValue}
          onChangeText={setEndpointValue}
          placeholder="https://cdn.example.com/v1/feed"
          placeholderTextColor={theme.text.muted}
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          keyboardType="url"
          returnKeyType="done"
          onSubmitEditing={handleApplyEndpoint}
        />

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={styles.statusLeft}>
            <Text style={[styles.statusDot, { color: statusColor[endpointStatus] }]}>
              {statusDot[endpointStatus]}
            </Text>
            <Text style={[styles.statusText, { color: statusColor[endpointStatus] }]}>
              {statusLabel[endpointStatus]}
            </Text>
          </View>

          <View style={styles.actionButtons}>
            {endpointStatus === 'connected' && (
              <TouchableOpacity
                style={[styles.actionBtn, { borderColor: theme.status.error }]}
                onPress={handleReset}
              >
                <Text style={[styles.actionBtnText, { color: theme.status.error }]}>
                  Reset
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: theme.primary }]}
              onPress={handleApplyEndpoint}
            >
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Version note */}
        <Text style={[styles.versionNote, { color: theme.text.muted }]}>
          API version: v1 · Build a3f9c12
        </Text>
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
  // ── Developer section ──
  devCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 0,
  },
  devLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  devDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  endpointInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'Courier',
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    fontSize: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  versionNote: {
    fontSize: 11,
    marginTop: 2,
  },
  // ── Info box ──
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

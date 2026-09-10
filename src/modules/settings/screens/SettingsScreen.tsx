import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { version as APP_VERSION } from '../../../../package.json';
import { useTheme } from '../../../theme';
import { ThemeName } from '../../../theme';
import { Typography } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { setUnlocked } from '../../../store/slices/access-slice';
import StorageService from '../../../services/StorageService';
import { ExportService } from '../../../services/ExportService';
import { ImportService } from '../../../services/ImportService';
import { fetchAllStars } from '../../../store/thunks/star-thunks';
import { fetchAllMovies } from '../../../store/thunks/movie-thunks';
import { DEVELOPER_OPTIONS_TAP_COUNT } from '../../../constants/app-constants';

const ENDPOINT_SECRET = 'dragon';
const ACCESS_KEY = 'starvault_access';

const THEMES: { name: ThemeName; label: string; color: string; bg: string }[] =
  [
    { name: 'pink', label: '🌸 Pink', color: '#E91E8C', bg: '#FFF0F6' },
    { name: 'skyblue', label: '🩵 Sky Blue', color: '#0288D1', bg: '#F0F8FF' },
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
  const currentSpace = isUnlocked ? 'private' : 'public';

  const [endpointValue, setEndpointValue] = useState('');
  const [endpointStatus, setEndpointStatus] = useState<EndpointStatus>('idle');
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── Developer options reveal ─────────────────────────────
  const [devTapCount, setDevTapCount] = useState(0);
  const [devOptionsVisible, setDevOptionsVisible] = useState(false);

  const handleVersionTap = () => {
    // Already visible or unlocked — nothing to do
    if (devOptionsVisible || isUnlocked) return;
    const next = devTapCount + 1;
    if (next >= DEVELOPER_OPTIONS_TAP_COUNT) {
      setDevOptionsVisible(true);
      setDevTapCount(0);
    } else {
      setDevTapCount(next);
    }
  };

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
      // Hide developer options once unlocked — no longer needed
      setDevOptionsVisible(false);
      setDevTapCount(0);
    } else {
      setEndpointStatus('unreachable');
      dispatch(setUnlocked(false));
      StorageService.set(ACCESS_KEY, false);
    }
  };

  const handleReset = () => {
    Alert.alert('Reset endpoint', 'This will disconnect the content feed.', [
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
    ]);
  };

  const handleSwitchToPublic = () => {
    dispatch(setUnlocked(false));
    StorageService.set(ACCESS_KEY, false);
    setEndpointStatus('idle');
    setEndpointValue('');
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const summary = await ExportService.getSummary(currentSpace);
      Alert.alert(
        'Export Data',
        `This will export:\n\n• ${summary.stars} star${
          summary.stars !== 1 ? 's' : ''
        }\n• ${summary.movies} movie${summary.movies !== 1 ? 's' : ''}\n• ${
          summary.links
        } star-movie link${
          summary.links !== 1 ? 's' : ''
        }\n\nNote: Media files are not included.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setExporting(false),
          },
          {
            text: 'Export',
            onPress: async () => {
              try {
                await ExportService.exportAll(currentSpace);
              } catch (e: any) {
                Alert.alert(
                  'Export Failed',
                  e?.message ?? 'Something went wrong.',
                );
              } finally {
                setExporting(false);
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not prepare export.');
      setExporting(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);

      // Step 1: Pick file
      let localUri: string;
      try {
        localUri = await ImportService.pickFile();
      } catch (e: any) {
        // User cancelled picker — not an error
        if (
          e?.code === 'DOCUMENT_PICKER_CANCELED' ||
          e?.message?.includes('cancel')
        ) {
          return;
        }
        throw e;
      }

      // Step 2: Read and validate
      const data = await ImportService.readAndValidate(localUri);

      // Step 3: Confirm with summary
      const { tables } = data;
      Alert.alert(
        'Import Data',
        `Found:\n\n• ${tables.Person.length} star${
          tables.Person.length !== 1 ? 's' : ''
        }\n• ${tables.Movie.length} movie${
          tables.Movie.length !== 1 ? 's' : ''
        }\n• ${tables.StarMovie.length} star-movie link${
          tables.StarMovie.length !== 1 ? 's' : ''
        }\n\nExisting records with matching IDs will be updated. New records will be added.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setImporting(false),
          },
          {
            text: 'Import',
            onPress: async () => {
              try {
                const result = await ImportService.importAll(
                  data,
                  currentSpace,
                );
                await Promise.all([
                  dispatch(fetchAllStars(currentSpace)),
                  dispatch(fetchAllMovies(currentSpace)),
                ]);
                Alert.alert(
                  'Import Complete',
                  `Imported:\n\n• ${result.stars} star${
                    result.stars !== 1 ? 's' : ''
                  }\n• ${result.movies} movie${
                    result.movies !== 1 ? 's' : ''
                  }\n• ${result.links} link${result.links !== 1 ? 's' : ''}`,
                );
              } catch (e: any) {
                Alert.alert(
                  'Import Failed',
                  e?.message ?? 'Something went wrong.',
                );
              } finally {
                setImporting(false);
              }
            },
          },
        ],
      );
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not read file.');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteAll = () => {
    Alert.alert(
      isUnlocked ? 'Delete All Private Data' : 'Delete All Data',
      `This will permanently delete all stars, movies, and links${
        isUnlocked ? ' in Private Mode' : ''
      }. This cannot be undone.${
        isUnlocked
          ? '\n\nExport your data first if you want to restore it later.'
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await ExportService.deleteAll(currentSpace);
              await Promise.all([
                dispatch(fetchAllStars(currentSpace)),
                dispatch(fetchAllMovies(currentSpace)),
              ]);
              Alert.alert('Done', 'All data has been deleted.');
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Could not delete data.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const isBusy = exporting || importing || deleting;

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

      {/* ── MODE — Private Mode only ─────────────────── */}
      {isUnlocked && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text.secondary, marginTop: 28 },
            ]}
          >
            MODE
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.modeRow}>
              <View style={styles.modeInfo}>
                <Text style={[styles.modeLabel, { color: theme.text.primary }]}>
                  🔓 Private Mode
                </Text>
                <Text style={[styles.modeDesc, { color: theme.text.muted }]}>
                  All features are available.
                </Text>
              </View>
              <View
                style={[
                  styles.modeBadge,
                  { backgroundColor: theme.status.success + '22' },
                ]}
              >
                <Text
                  style={[
                    styles.modeBadgeText,
                    { color: theme.status.success },
                  ]}
                >
                  Private
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.switchBtn, { borderColor: theme.status.error }]}
              onPress={handleSwitchToPublic}
            >
              <Text
                style={[styles.switchBtnText, { color: theme.status.error }]}
              >
                Lock This Device
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── DATA (Export/Import) — Private Mode only ──── */}
      {isUnlocked && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text.secondary, marginTop: 28 },
            ]}
          >
            DATA
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            {/* Export */}
            <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
              Export Data
            </Text>
            <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
              Export all stars, movies, and their links as a JSON file. Media
              files are not included.
            </Text>
            <TouchableOpacity
              style={[
                styles.actionFullBtn,
                {
                  backgroundColor: exporting
                    ? theme.primaryLight
                    : theme.primary,
                },
              ]}
              onPress={handleExport}
              disabled={isBusy}
            >
              {exporting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionFullBtnText}>⬆ Export JSON</Text>
              )}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Import */}
            <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
              Import Data
            </Text>
            <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
              Import a StarVault JSON export. Existing records with matching IDs
              will be updated; new records will be added.
            </Text>
            <TouchableOpacity
              style={[
                styles.actionFullBtn,
                {
                  backgroundColor: importing
                    ? theme.primaryLight
                    : theme.primary,
                },
              ]}
              onPress={handleImport}
              disabled={isBusy}
            >
              {importing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.actionFullBtnText}>⬇ Import JSON</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* ── DELETE — available in both modes ──────────── */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text.secondary, marginTop: 28 },
        ]}
      >
        {isUnlocked ? 'DANGER ZONE' : 'RESET'}
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
          Delete All {isUnlocked ? 'Private ' : ''}Data
        </Text>
        <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
          Permanently removes all stars, movies, and links.
          {isUnlocked ? ' Export first if you want to restore later.' : ''}
        </Text>
        <TouchableOpacity
          style={[
            styles.actionFullBtn,
            {
              backgroundColor: deleting
                ? theme.status.error + '88'
                : theme.status.error,
            },
          ]}
          onPress={handleDeleteAll}
          disabled={isBusy}
        >
          {deleting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.actionFullBtnText}>🗑 Delete All Data</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* ── ABOUT ─────────────────────────────────────── */}
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.text.secondary, marginTop: 28 },
        ]}
      >
        ABOUT
      </Text>
      <View
        style={[
          styles.card,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {/* Version row — tap target for developer options reveal */}
        <TouchableOpacity onPress={handleVersionTap} activeOpacity={1}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: theme.text.muted }]}>
              Version
            </Text>
            <Text style={[styles.aboutValue, { color: theme.text.primary }]}>
              {APP_VERSION}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ── DEVELOPER OPTIONS — revealed by 5 taps on version ── */}
      {devOptionsVisible && !isUnlocked && (
        <>
          <Text
            style={[
              styles.sectionTitle,
              { color: theme.text.secondary, marginTop: 28 },
            ]}
          >
            DEVELOPER OPTIONS
          </Text>
          <View
            style={[
              styles.card,
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
            <View style={styles.statusRow}>
              <View style={styles.statusLeft}>
                <Text
                  style={[
                    styles.statusDot,
                    { color: statusColor[endpointStatus] },
                  ]}
                >
                  {statusDot[endpointStatus]}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    { color: statusColor[endpointStatus] },
                  ]}
                >
                  {statusLabel[endpointStatus]}
                </Text>
              </View>
              <View style={styles.actionButtons}>
                {endpointStatus === 'connected' && (
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      { borderColor: theme.status.error },
                    ]}
                    onPress={handleReset}
                  >
                    <Text
                      style={[
                        styles.actionBtnText,
                        { color: theme.status.error },
                      ]}
                    >
                      Reset
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, { borderColor: theme.primary }]}
                  onPress={handleApplyEndpoint}
                >
                  <Text
                    style={[styles.actionBtnText, { color: theme.primary }]}
                  >
                    Apply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={[styles.versionNote, { color: theme.text.muted }]}>
              API version: v1 · Build a3f9c12
            </Text>
          </View>
        </>
      )}

      {/* ── Current Theme Info ────────────────────────── */}
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
  aboutLabel: { fontSize: 14, fontWeight: '600' },
  aboutRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  aboutValue: { fontSize: 14, fontWeight: '500' },
  actionBtn: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionFullBtn: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
  },
  actionFullBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  card: { borderRadius: 12, borderWidth: 1, marginBottom: 0, padding: 16 },
  checkmark: {
    alignItems: 'center',
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkmarkText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  colorDot: { borderRadius: 16, height: 32, marginRight: 14, width: 32 },
  container: { flex: 1 },
  content: { padding: 20 },
  dataDesc: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  dataLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  devDesc: { fontSize: 12, lineHeight: 18, marginBottom: 12 },
  devLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  divider: { height: 1, marginVertical: 16 },
  endpointInput: {
    borderRadius: 8,
    borderWidth: 1,
    fontFamily: 'Courier',
    fontSize: 13,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  infoBox: { borderRadius: 10, borderWidth: 1, marginTop: 24, padding: 14 },
  infoText: { fontSize: 14, textAlign: 'center' },
  infoValue: { fontWeight: '700' },
  modeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  modeBadgeText: { fontSize: 12, fontWeight: '700' },
  modeDesc: { fontSize: 12, marginTop: 2 },
  modeInfo: { flex: 1 },
  modeLabel: { fontSize: 15, fontWeight: '700' },
  modeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...Typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 8,
  },
  statusDot: { fontSize: 10 },
  statusLeft: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  switchBtn: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    paddingVertical: 10,
  },
  switchBtnText: { fontSize: 14, fontWeight: '600' },
  themeCard: {
    alignItems: 'center',
    borderRadius: 12,
    elevation: 2,
    flexDirection: 'row',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  themeLabel: { flex: 1, fontSize: 16 },
  themeList: { gap: 12 },
  versionNote: { fontSize: 11, marginTop: 2 },
});

export default SettingsScreen;

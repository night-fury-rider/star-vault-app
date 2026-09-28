import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { version as APP_VERSION } from '../../../../package.json';
import { useTheme } from '../../../theme';
import { ThemeName } from '../../../theme';
import { Typography } from '../../../theme';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { setUnlocked } from '../../../store/slices/access-slice';
import StorageService from '../../../services/StorageService';
import {
  deleteAll,
  exportAll,
  exportMedia,
  getMediaCount,
  getSummary,
} from '../../../services/ExportService';
import {
  importAll,
  importMedia,
  pickFile,
  readAndValidate,
} from '../../../services/ImportService';
import { fetchAllStars } from '../../../store/thunks/star-thunks';
import { fetchAllMovies } from '../../../store/thunks/movie-thunks';
import { DEVELOPER_OPTIONS_TAP_COUNT } from '../../../constants/app-constants';
import { showError, showInfo, showSuccess } from '../../../utils/toast';
import { COMMON } from '../../../constants/strings.constants';

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

const SettingsScreen = () => {
  const { theme, themeName, setTheme } = useTheme();
  const dispatch = useAppDispatch();
  const isUnlocked = useAppSelector(state => state.access.isUnlocked);
  const { top } = useSafeAreaInsets();
  const currentSpace = isUnlocked ? 'private' : 'public';

  const [exporting, setExporting] = useState(false);
  const [exportingMedia, setExportingMedia] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importingMedia, setImportingMedia] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ─── 5-tap unlock on version row ─────────────────────────
  const [devTapCount, setDevTapCount] = useState(0);

  const handleVersionTap = () => {
    if (isUnlocked) return;
    const next = devTapCount + 1;
    if (next >= DEVELOPER_OPTIONS_TAP_COUNT) {
      setDevTapCount(0);
      dispatch(setUnlocked(true));
      StorageService.set(ACCESS_KEY, true);
    } else {
      setDevTapCount(next);
    }
  };

  const handleSwitchToPublic = () => {
    dispatch(setUnlocked(false));
    StorageService.set(ACCESS_KEY, false);
    setDevTapCount(0);
  };

  const handleDeleteAll = () => {
    Alert.alert(
      isUnlocked ? 'Remove All Private Data' : 'Remove All Data',
      `This will permanently remove all stars, movies, and links${
        isUnlocked ? ' in Private Mode' : ''
      }. This cannot be undone.${
        isUnlocked
          ? '\n\nExport your data first if you want to restore it later.'
          : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteAll(currentSpace);
              await Promise.all([
                dispatch(fetchAllStars(currentSpace)),
                dispatch(fetchAllMovies(currentSpace)),
              ]);
              showSuccess('All data has been removed.');
            } catch (e: any) {
              showError(e?.message ?? 'Could not remove data.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleExport = async () => {
    try {
      const summary = await getSummary();
      if (summary.stars === 0 && summary.movies === 0) {
        showInfo('Nothing to Export', 'Add some stars or movies first.');
        return;
      }
      setExporting(true);
      await exportAll();
      showSuccess(
        `Exported ${summary.stars} stars and ${summary.movies} movies successfully`,
      );
    } catch (e: any) {
      showError(e?.message ?? 'Could not prepare export.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportMedia = async () => {
    try {
      setExportingMedia(true);
      const count = await getMediaCount();
      if (count === 0) {
        showInfo(
          'Nothing to Export',
          'Add some images to stars or movies first.',
        );
        return;
      }
      await exportMedia();
      showSuccess(`Exported media files successfully.`);
    } catch (e: any) {
      if (e?.message === 'NO_MEDIA') {
        showError('No images found to export.');
      } else {
        showError('Export Failed', e?.message ?? 'Something went wrong.');
      }
    } finally {
      setExportingMedia(false);
    }
  };

  const handleImport = async () => {
    try {
      setImporting(true);

      let localUri: string;
      try {
        localUri = await pickFile();
      } catch (e: any) {
        if (
          e?.code === 'DOCUMENT_PICKER_CANCELED' ||
          e?.message?.includes('cancel')
        ) {
          return;
        }
        throw e;
      }

      const data = await readAndValidate(localUri);
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
                const result = await importAll(data, currentSpace);
                await Promise.all([
                  dispatch(fetchAllStars(currentSpace)),
                  dispatch(fetchAllMovies(currentSpace)),
                ]);

                showSuccess(
                  'Import Complete',
                  `Imported:\n\n• ${result.stars} star${
                    result.stars !== 1 ? 's' : ''
                  }\n• ${result.movies} movie${
                    result.movies !== 1 ? 's' : ''
                  }\n• ${result.links} link${result.links !== 1 ? 's' : ''}`,
                );
              } catch (e: any) {
                showError(
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
      showError(e?.message ?? 'Could not read file.');
    } finally {
      setImporting(false);
    }
  };

  const handleImportMedia = async () => {
    try {
      setImportingMedia(true);
      const result = await importMedia();
      await Promise.all([
        dispatch(fetchAllStars(currentSpace)),
        dispatch(fetchAllMovies(currentSpace)),
      ]);
      Alert.alert(
        'Import Complete',
        `Imported ${result.imported} image${result.imported !== 1 ? 's' : ''}${
          result.skipped > 0 ? `, skipped ${result.skipped}` : ''
        }.`,
      );
    } catch (e: any) {
      if (
        e?.code === 'DOCUMENT_PICKER_CANCELED' ||
        e?.message?.includes('cancel')
      ) {
        return;
      }
      showError('Import Failed', e?.message ?? 'Something went wrong.');
    } finally {
      setImportingMedia(false);
    }
  };

  const isBusy =
    exporting || exportingMedia || importing || importingMedia || deleting;

  return (
    <View
      style={[
        styles.safeArea,
        { backgroundColor: theme.background, paddingTop: top },
      ]}
    >
      <StatusBar barStyle="dark-content" />
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
                  <View
                    style={[styles.checkmark, { backgroundColor: t.color }]}
                  >
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
                  <Text
                    style={[styles.modeLabel, { color: theme.text.primary }]}
                  >
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
              {/* Export Data */}
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

              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              {/* Export Media */}
              <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
                Export Media
              </Text>
              <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
                Export all photos and videos as a ZIP file.
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionFullBtn,
                  {
                    backgroundColor: exportingMedia
                      ? theme.primaryLight
                      : theme.primary,
                  },
                ]}
                onPress={handleExportMedia}
                disabled={isBusy}
              >
                {exportingMedia ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.actionFullBtnText}>⬆ Export Media</Text>
                )}
              </TouchableOpacity>

              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              {/* Import Data */}
              <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
                Import Data
              </Text>
              <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
                Import a {COMMON.appName} JSON export. Existing records with
                matching IDs will be updated; new records will be added.
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

              <View
                style={[styles.divider, { backgroundColor: theme.border }]}
              />

              {/* Import Media */}
              <Text style={[styles.dataLabel, { color: theme.text.primary }]}>
                Import Media
              </Text>
              <Text style={[styles.dataDesc, { color: theme.text.muted }]}>
                Import a {COMMON.appName} media ZIP. Images will be matched to
                existing stars and movies automatically.
              </Text>
              <TouchableOpacity
                style={[
                  styles.actionFullBtn,
                  {
                    backgroundColor: importingMedia
                      ? theme.primaryLight
                      : theme.primary,
                  },
                ]}
                onPress={handleImportMedia}
                disabled={isBusy}
              >
                {importingMedia ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.actionFullBtnText}>⬇ Import Media</Text>
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
          {/* Version row — silent tap target for private mode unlock */}
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
      </ScrollView>
    </View>
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
  safeArea: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 20 },
  dataDesc: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  dataLabel: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  divider: { height: 1, marginVertical: 16 },
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
});

export default SettingsScreen;

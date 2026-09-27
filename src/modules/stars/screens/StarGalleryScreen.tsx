import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../../../theme';
import {
  StarsStackParamList,
  GalleryMedia,
} from '../../../navigation/navigation-types';
import BaseFab from '../../../components/BaseFab';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import {
  fetchGallery,
  addMedia as addMediaThunk,
  deleteMediaBatch as deleteMediaBatchThunk,
} from '../../../store/thunks/gallery-thunks';
import { copyStarGalleryImage } from '../../../services/MediaStorageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { showError } from '../../../utils/toast';

type NavProp = StackNavigationProp<StarsStackParamList, 'StarGallery'>;
type RoutePropType = RouteProp<StarsStackParamList, 'StarGallery'>;

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 4) / COLUMN_COUNT;

const StarGalleryScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { star } = route.params;
  const dispatch = useAppDispatch();

  const mediaList = useAppSelector(
    state => state.gallery.mediaByStarId[star.id] || [],
  );
  const loading = useAppSelector(state => state.gallery.loading);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    dispatch(fetchGallery(star.id));
  }, [star.id, dispatch]);

  const handleAddMedia = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.9, selectionLimit: 10 },
      res => {
        const uris = res.assets?.map(a => a.uri).filter(Boolean) as string[];
        if (uris?.length) processAssets(uris, 'image');
      },
    );
  };

  // ─── processAssets ────────────────────────────────────────
  // Sequential processing — avoids race condition on ensureDir
  // when multiple images are selected at once.
  const processAssets = async (uris: string[], type: 'image' | 'video') => {
    for (const uri of uris) {
      await addMedia(uri, type);
    }
  };

  // ─── addMedia ─────────────────────────────────────────────
  // Copies to internal storage first — never stores content:// in DB.
  // Videos are not copied — URI stored as-is for now.
  const addMedia = async (uri: string, type: 'image' | 'video') => {
    try {
      let stableUri = uri;
      if (type === 'image') {
        const internalPath = await copyStarGalleryImage(uri, star.id);
        stableUri = internalPath.startsWith('file://')
          ? internalPath
          : `file://${internalPath}`;
      }
      const newMedia: GalleryMedia = {
        id: uuidv4(),
        uri: stableUri,
        type,
        createdAt: new Date().toISOString(),
      };
      dispatch(addMediaThunk({ starId: star.id, media: newMedia }));
    } catch (e: any) {
      showError(e?.message ?? 'Failed to save media.');
    }
  };

  const handleMediaPress = useCallback(
    (index: number) => {
      if (selectionMode) {
        toggleSelection(mediaList[index].id);
        return;
      }
      navigation.navigate('MediaViewer', {
        mediaList,
        initialIndex: index,
      });
    },
    [selectionMode, mediaList, navigation],
  );

  const handleLongPress = (id: string) => {
    setSelectionMode(true);
    setSelectedIds(new Set([id]));
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        if (next.size === 0) {
          setSelectionMode(false);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDeleteSelected = () => {
    Alert.alert(
      'Remove Media',
      `Remove ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            dispatch(
              deleteMediaBatchThunk({
                starId: star.id,
                mediaIds: Array.from(selectedIds),
              }),
            );
            setSelectedIds(new Set());
            setSelectionMode(false);
          },
        },
      ],
    );
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds(new Set());
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: GalleryMedia;
    index: number;
  }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.mediaItem, { opacity: isSelected ? 0.7 : 1 }]}
        onPress={() => handleMediaPress(index)}
        onLongPress={() => handleLongPress(item.id)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
        {item.type === 'video' && (
          <View style={styles.videoBadge}>
            <Text style={styles.videoBadgeText}>▶</Text>
          </View>
        )}
        {selectionMode && (
          <View
            style={[
              styles.selectionOverlay,
              {
                backgroundColor: isSelected ? 'rgba(0,0,0,0.4)' : 'transparent',
              },
            ]}
          >
            {isSelected && (
              <View
                style={[styles.checkCircle, { backgroundColor: theme.primary }]}
              >
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Selection toolbar */}
      {selectionMode && (
        <View
          style={[
            styles.toolbar,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity onPress={handleCancelSelection}>
            <Text
              style={[styles.toolbarAction, { color: theme.text.secondary }]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.toolbarCount, { color: theme.text.primary }]}>
            {selectedIds.size} selected
          </Text>
          <TouchableOpacity onPress={handleDeleteSelected}>
            <Text style={[styles.toolbarAction, { color: theme.status.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Media count */}
      {mediaList.length > 0 && !loading && (
        <Text style={[styles.countText, { color: theme.text.muted }]}>
          {mediaList.length} item{mediaList.length !== 1 ? 's' : ''}
        </Text>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}

      {/* Grid */}
      {!loading && mediaList.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🎞</Text>
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No Media Yet
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            Tap + to add photos and videos for {star.stageName}
          </Text>
        </View>
      ) : (
        <FlatList
          data={mediaList}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!selectionMode && <BaseFab onPress={handleAddMedia} icon="+" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  toolbarAction: { fontSize: 15, fontWeight: '600' },
  toolbarCount: { fontSize: 15, fontWeight: '700' },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: { paddingBottom: 100 },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    margin: 1,
    position: 'relative',
  },
  thumbnail: { width: '100%', height: '100%' },
  videoBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  videoBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default StarGalleryScreen;

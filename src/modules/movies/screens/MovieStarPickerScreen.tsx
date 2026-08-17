import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme';
import { MoviesStackParamList } from '../../../navigation/navigation-types';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { fetchAllStars } from '../../../store/thunks/star-thunks';
import {
  addStarMovie,
  removeStarMovie,
} from '../../../store/thunks/star-movie-thunks';
import { Star } from '../../stars/types/star-types';

type NavProp = StackNavigationProp<MoviesStackParamList, 'MovieStarPicker'>;
type RoutePropType = RouteProp<MoviesStackParamList, 'MovieStarPicker'>;

// ─── Snackbar ─────────────────────────────────────────────────
const SNACKBAR_DURATION = 2000;

const useSnackbar = () => {
  const [message, setMessage] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(text);
      opacity.setValue(0);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        timerRef.current = setTimeout(() => {
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => setMessage(null));
        }, SNACKBAR_DURATION);
      });
    },
    [opacity],
  );

  return { message, opacity, show };
};

// ─── Main Screen ──────────────────────────────────────────────
const MovieStarPickerScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { movie } = route.params;
  const dispatch = useAppDispatch();

  const allStars = useAppSelector(state => state.stars.list);
  const starsLoading = useAppSelector(state => state.stars.loading);

  // Read cast live from Redux so checkboxes stay in sync
  const currentMovie =
    useAppSelector(state => state.movies.list.find(m => m.id === movie.id)) ??
    movie;
  const linkedCast = currentMovie.cast ?? [];

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [changeCount, setChangeCount] = useState(0);

  const scaleAnims = useRef<Record<string, Animated.Value>>({});
  const getScaleAnim = (id: string) => {
    if (!scaleAnims.current[id]) {
      scaleAnims.current[id] = new Animated.Value(1);
    }
    return scaleAnims.current[id];
  };

  const {
    message: snackMessage,
    opacity: snackOpacity,
    show: showSnackbar,
  } = useSnackbar();

  useEffect(() => {
    dispatch(fetchAllStars());
  }, [dispatch]);

  // ── Done button in header ─────────────────────────────────
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.doneBtnText, { color: theme.primary }]}>
            {changeCount > 0 ? `Done (${changeCount})` : 'Done'}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, changeCount, theme.primary]);

  const isLinked = useCallback(
    (starId: string) => linkedCast.some(c => c.personId === starId),
    [linkedCast],
  );

  const bounceCheckbox = (starId: string) => {
    const anim = getScaleAnim(starId);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleToggle = async (star: Star) => {
    if (pendingIds.has(star.id)) return;
    setPendingIds(prev => new Set(prev).add(star.id));
    const wasLinked = isLinked(star.id);
    try {
      if (wasLinked) {
        await dispatch(removeStarMovie({ starId: star.id, movieId: movie.id }));
        showSnackbar(`"${star.stageName}" removed`);
      } else {
        await dispatch(
          addStarMovie({
            starId: star.id,
            starStageName: star.stageName,
            movie,
          }),
        );
        bounceCheckbox(star.id);
        showSnackbar(`"${star.stageName}" added ✓`);
      }
      setChangeCount(prev => prev + 1);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(star.id);
        return next;
      });
    }
  };

  const filteredStars = allStars.filter(star => {
    const q = searchQuery.toLowerCase();
    return (
      star.stageName.toLowerCase().includes(q) ||
      star.originalName?.toLowerCase().includes(q) ||
      star.countryOfOrigin?.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Star }) => {
    const linked = isLinked(item.id);
    const pending = pendingIds.has(item.id);
    const scaleAnim = getScaleAnim(item.id);

    return (
      <TouchableOpacity
        style={[
          styles.row,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
        onPress={() => handleToggle(item)}
        activeOpacity={0.7}
        disabled={pending}
      >
        <View style={[styles.avatar, { backgroundColor: theme.card }]}>
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {item.stageName.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.rowInfo}>
          <Text
            style={[styles.rowTitle, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {item.stageName}
          </Text>
          {item.originalName && (
            <Text style={[styles.rowMeta, { color: theme.text.muted }]}>
              {item.originalName}
            </Text>
          )}
        </View>

        {pending ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: linked ? theme.primary : 'transparent',
                  borderColor: linked ? theme.primary : theme.border,
                },
              ]}
            >
              {linked && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </Animated.View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search */}
      <View
        style={[
          styles.searchBar,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.searchIcon, { color: theme.text.muted }]}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.text.primary }]}
          placeholder="Search stars..."
          placeholderTextColor={theme.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Linked count */}
      <Text style={[styles.countText, { color: theme.text.muted }]}>
        {linkedCast.length} star{linkedCast.length !== 1 ? 's' : ''} linked
      </Text>

      {/* Stars are only loaded when the Stars tab is unlocked.
          Show a helpful message if the list is empty for that reason. */}
      {starsLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredStars.length === 0 ? (
        <View style={styles.centred}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            {searchQuery ? 'No matches found' : 'No stars yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            {searchQuery
              ? 'Try a different search term.'
              : 'Add stars first, then link them here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredStars}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Snackbar */}
      {snackMessage && (
        <Animated.View
          style={[
            styles.snackbar,
            { backgroundColor: theme.surface, borderColor: theme.border },
            { opacity: snackOpacity },
          ]}
        >
          <Text style={[styles.snackbarText, { color: theme.text.primary }]}>
            {snackMessage}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  avatarText: { fontSize: 16, fontWeight: '700' },
  centred: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  container: { flex: 1 },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  doneBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  doneBtnText: { fontSize: 15, fontWeight: '700' },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptySubtitle: { fontSize: 14, lineHeight: 22, textAlign: 'center' },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  listContent: { paddingBottom: 80 },
  row: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowInfo: { flex: 1, marginRight: 12 },
  rowMeta: { fontSize: 13, marginTop: 2 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  searchBar: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    marginBottom: 8,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, height: 44, padding: 0 },
  snackbar: {
    borderRadius: 10,
    borderWidth: 1,
    bottom: 32,
    elevation: 6,
    left: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    position: 'absolute',
    right: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  snackbarText: { fontSize: 14, fontWeight: '600', textAlign: 'center' },
});

export default MovieStarPickerScreen;

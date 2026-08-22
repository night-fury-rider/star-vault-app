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
import { StarsStackParamList } from '../../../navigation/navigation-types';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { fetchAllMovies } from '../../../store/thunks/movie-thunks';
import {
  addStarMovie,
  removeStarMovie,
} from '../../../store/thunks/star-movie-thunks';
import { Movie } from '../../movies/types/movie-types';

type NavProp = StackNavigationProp<StarsStackParamList, 'StarMoviePicker'>;
type RoutePropType = RouteProp<StarsStackParamList, 'StarMoviePicker'>;

// ─── Snackbar ─────────────────────────────────────────────────
interface SnackbarMessage {
  id: number;
  text: string;
}

const SNACKBAR_DURATION = 2000;

const useSnackbar = () => {
  const [message, setMessage] = useState<SnackbarMessage | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(
    (text: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setMessage({ id: Date.now(), text });
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
const StarMoviePickerScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { star } = route.params;
  const dispatch = useAppDispatch();

  const allMovies = useAppSelector(state => state.movies.list);
  const moviesLoading = useAppSelector(state => state.movies.loading);
  const linkedMovies = useAppSelector(
    state => state.starMovies.moviesByStarId[star.id] || [],
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [changeCount, setChangeCount] = useState(0);

  // Per-item checkbox bounce
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
    dispatch(fetchAllMovies());
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
    (movieId: string) => linkedMovies.some(m => m.id === movieId),
    [linkedMovies],
  );

  const bounceCheckbox = (movieId: string) => {
    const anim = getScaleAnim(movieId);
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.35,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(anim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleToggle = async (movie: Movie) => {
    if (pendingIds.has(movie.id)) {
      return;
    }
    setPendingIds(prev => new Set(prev).add(movie.id));
    const wasLinked = isLinked(movie.id);
    try {
      if (wasLinked) {
        await dispatch(
          removeStarMovie({
            starId: star.id,
            movieId: movie.id,
            space: star.space,
          }),
        );
        showSnackbar(`"${movie.title}" removed`);
      } else {
        await dispatch(
          addStarMovie({
            starId: star.id,
            starStageName: star.stageName,
            movie,
          }),
        );
        bounceCheckbox(movie.id);
        showSnackbar(`"${movie.title}" added ✓`);
      }
      setChangeCount(prev => prev + 1);
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(movie.id);
        return next;
      });
    }
  };

  const filteredMovies = allMovies.filter(movie => {
    if (movie.space !== star.space) return false;
    const q = searchQuery.toLowerCase();
    return (
      movie.title.toLowerCase().includes(q) ||
      movie.director?.toLowerCase().includes(q) ||
      movie.genre?.toLowerCase().includes(q)
    );
  });

  const renderItem = ({ item }: { item: Movie }) => {
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
        <View style={styles.rowInfo}>
          <Text
            style={[styles.rowTitle, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={[styles.rowMeta, { color: theme.text.muted }]}>
            {item.year}
            {item.genre ? ` · ${item.genre}` : ''}
          </Text>
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
          placeholder="Search movies..."
          placeholderTextColor={theme.text.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Linked count */}
      <Text style={[styles.countText, { color: theme.text.muted }]}>
        {linkedMovies.length} movie{linkedMovies.length !== 1 ? 's' : ''} linked
      </Text>

      {/* List */}
      {moviesLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredMovies.length === 0 ? (
        <View style={styles.centred}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            {searchQuery ? 'No matches found' : 'No movies yet'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.text.secondary }]}>
            {searchQuery
              ? 'Try a different search term.'
              : 'Add movies first, then link them here.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredMovies}
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
            {snackMessage.text}
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  doneBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
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
  rowMeta: { fontSize: 13 },
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
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

export default StarMoviePickerScreen;

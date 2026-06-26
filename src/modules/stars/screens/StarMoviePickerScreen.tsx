import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme';
import { StarsStackParamList } from '../../../navigation/navigation-types';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { fetchAllMovies } from '../../../store/thunks/movie-thunks';
import { addStarMovie, removeStarMovie } from '../../../store/thunks/star-movie-thunks';
import { Movie } from '../../movies/types/movie-types';

type NavProp = StackNavigationProp<StarsStackParamList, 'StarMoviePicker'>;
type RoutePropType = RouteProp<StarsStackParamList, 'StarMoviePicker'>;

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

  useEffect(() => {
    dispatch(fetchAllMovies());
  }, [dispatch]);

  const isLinked = useCallback(
    (movieId: string) => linkedMovies.some(m => m.id === movieId),
    [linkedMovies],
  );

  const handleToggle = async (movie: Movie) => {
    if (pendingIds.has(movie.id)) return;

    setPendingIds(prev => new Set(prev).add(movie.id));
    try {
      if (isLinked(movie.id)) {
        await dispatch(removeStarMovie({ starId: star.id, movieId: movie.id }));
      } else {
        await dispatch(addStarMovie({ starId: star.id, movie }));
      }
    } finally {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(movie.id);
        return next;
      });
    }
  };

  const filteredMovies = allMovies.filter(movie => {
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
            {item.year}{item.genre ? ` · ${item.genre}` : ''}
          </Text>
        </View>

        {pending ? (
          <ActivityIndicator size="small" color={theme.primary} />
        ) : (
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

      {moviesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredMovies.length === 0 ? (
        <View style={styles.emptyContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, height: 44, padding: 0 },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  listContent: { paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowInfo: { flex: 1, marginRight: 12 },
  rowTitle: { fontSize: 15, fontWeight: '600', marginBottom: 3 },
  rowMeta: { fontSize: 13 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});

export default StarMoviePickerScreen;

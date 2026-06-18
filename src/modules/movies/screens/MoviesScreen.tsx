import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useTheme } from '../../../theme';
import { Movie } from '../types/movie-types';
import { MoviesStackParamList } from '../../../navigation/navigation-types';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { fetchAllMovies, deleteMovie } from '../../../store/thunks/movie-thunks';
import BaseCard from '../../../components/BaseCard';
import BaseGridCard from '../../../components/BaseGridCard';
import BaseEmptyState from '../../../components/BaseEmptyState';
import BaseFab from '../../../components/BaseFab';
import { BaseItem } from '../../../components/base-types';

type NavProp = StackNavigationProp<MoviesStackParamList, 'MoviesList'>;
type ViewMode = 'card' | 'list';

const MoviesScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const dispatch = useAppDispatch();

  const { list: movies, loading } = useAppSelector(state => state.movies);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    console.log('🎬 MoviesScreen mounted — fetching movies');
    dispatch(fetchAllMovies());
  }, [dispatch]);

  const filteredMovies = movies.filter(movie => {
    const query = searchQuery.toLowerCase();
    return (
      movie.title.toLowerCase().includes(query) ||
      movie.director?.toLowerCase().includes(query) ||
      movie.genre?.toLowerCase().includes(query) ||
      movie.synopsis?.toLowerCase().includes(query)
    );
  });

  const toggleViewMode = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setViewMode(prev => (prev === 'card' ? 'list' : 'card'));
  };

  const handlePress = useCallback(
    (item: BaseItem) => {
      const movie = movies.find(m => m.id === item.id);
      if (!movie) {
        return;
      }
      navigation.navigate('MovieDetail', { movie });
    },
    [movies, navigation],
  );

  const handleDelete = useCallback(
    (id: string) => {
      dispatch(deleteMovie(id));
    },
    [dispatch],
  );

  const handleAdd = () => {
    navigation.navigate('AddMovie');
  };

  const toBaseItem = (movie: Movie): BaseItem => ({
    id: movie.id,
    name: movie.title,
    bio: movie.synopsis,
    imagePath: movie.imagePath,
  });

  const renderCardItem = ({ item }: { item: Movie }) => (
    <BaseGridCard
      item={toBaseItem(item)}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  );

  const renderListItem = ({ item }: { item: Movie }) => (
    <BaseCard
      item={toBaseItem(item)}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search + Toggle Row */}
      <View style={[styles.searchRow, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.searchIcon, { color: theme.text.muted }]}>
            🔍
          </Text>
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

        <TouchableOpacity
          style={[
            styles.toggleButton,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={toggleViewMode}
        >
          <Text style={styles.toggleIcon}>
            {viewMode === 'card' ? '☰' : '⊞'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      {filteredMovies.length > 0 && (
        <Text style={[styles.countText, { color: theme.text.muted }]}>
          {filteredMovies.length}{' '}
          {filteredMovies.length === 1 ? 'movie' : 'movies'}
        </Text>
      )}

      {/* List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          key={viewMode}
          data={filteredMovies}
          keyExtractor={item => item.id}
          renderItem={viewMode === 'card' ? renderCardItem : renderListItem}
          numColumns={viewMode === 'card' ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            filteredMovies.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            !loading ? (
              <BaseEmptyState
                searchQuery={searchQuery}
                entityName="movies"
                emptyMessage="Start building your movie vault by tapping the + button below."
              />
            ) : null
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            viewMode === 'list' ? () => <View style={styles.separator} /> : null
          }
          refreshing={loading}
          onRefresh={() => dispatch(fetchAllMovies())}
        />
      </Animated.View>

      <BaseFab onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, height: 44, padding: 0 },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: { fontSize: 20 },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  listContainer: { flex: 1 },
  listContent: { paddingBottom: 100, paddingTop: 4 },
  emptyList: { flexGrow: 1 },
  separator: { height: 4 },
});

export default MoviesScreen;

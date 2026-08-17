import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { useTheme } from '../../../theme';
import { MoviesStackParamList } from '../../../navigation/navigation-types';
import BaseSectionHeader from '../../../components/BaseSectionHeader';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { deleteMovie } from '../../../store/thunks/movie-thunks';
import { removeStarMovie } from '../../../store/thunks/star-movie-thunks';

type NavProp = StackNavigationProp<MoviesStackParamList, 'MovieDetail'>;
type RoutePropType = RouteProp<MoviesStackParamList, 'MovieDetail'>;

const MovieDetailScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { movie: routeMovie } = route.params;

  // Read live from Redux so cast updates reflect immediately
  const movie =
    useAppSelector(state =>
      state.movies.list.find(m => m.id === routeMovie.id),
    ) ?? routeMovie;

  const cast = movie.cast ?? [];

  useLayoutEffect(() => {
    navigation.setOptions({
      title: movie.title,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Icon name="pencil-outline" size={22} color={theme.header.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Icon name="trash-outline" size={22} color={theme.header.text} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, movie, theme]);

  const handleEdit = () => {
    Alert.alert('Edit Movie', 'Edit screen coming soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Movie',
      `Are you sure you want to delete "${movie.title}"? This will also delete all gallery media.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteMovie(movie.id));
            navigation.popToTop();
          },
        },
      ],
    );
  };

  const handleOpenGallery = () => {
    navigation.navigate('MovieGallery', { movie });
  };

  const handleOpenStarPicker = () => {
    navigation.navigate('MovieStarPicker', { movie });
  };

  const handleNavigateToStar = (personId: string, stageName: string) => {
    // Find the full star object from Redux so StarDetail has complete data
    navigation.navigate('StarDetail', {
      star: { id: personId, stageName } as any,
    });
  };

  const handleRemoveStar = (personId: string, stageName: string) => {
    Alert.alert(
      'Remove Star',
      `Remove "${stageName}" from ${movie.title}'s cast?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            dispatch(removeStarMovie({ starId: personId, movieId: movie.id })),
        },
      ],
    );
  };

  const renderInfoRow = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <View style={[styles.infoRow, { borderBottomColor: theme.border }]}>
        <Text style={[styles.infoLabel, { color: theme.text.muted }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: theme.text.primary }]}>
          {value}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero / Poster */}
      <View style={[styles.heroContainer, { backgroundColor: theme.card }]}>
        {movie.imagePath ? (
          <Image
            source={{ uri: movie.imagePath }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.heroPlaceholder, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.heroInitial, { color: theme.primary }]}>
              🎬
            </Text>
          </View>
        )}
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{movie.title}</Text>
          <View style={styles.heroBadgeRow}>
            <View
              style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
            >
              <Text style={styles.badgeText}>📅 {movie.year}</Text>
            </View>
            {movie.genre && (
              <View
                style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}
              >
                <Text style={styles.badgeText}>🎭 {movie.genre}</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Synopsis */}
        {movie.synopsis && (
          <>
            <BaseSectionHeader title="Synopsis" />
            <Text style={[styles.synopsis, { color: theme.text.secondary }]}>
              {movie.synopsis}
            </Text>
          </>
        )}

        {/* Movie Info */}
        <BaseSectionHeader title="Movie Info" />
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {renderInfoRow('Year', String(movie.year))}
          {renderInfoRow('Genre', movie.genre)}
          {renderInfoRow('Director', movie.director)}
        </View>

        {/* ── Cast ─────────────────────────────────────── */}
        <View style={styles.castSectionRow}>
          <View
            style={[
              styles.castSectionHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.castSectionTitle, { color: theme.primary }]}>
              CAST ({cast.length})
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addStarBtn, { borderColor: theme.primary }]}
            onPress={handleOpenStarPicker}
          >
            <Text style={[styles.addStarBtnText, { color: theme.primary }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {cast.length > 0 ? (
          cast.map(member => (
            <TouchableOpacity
              key={member.id}
              style={[
                styles.castCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() =>
                handleNavigateToStar(member.personId, member.stageName)
              }
              activeOpacity={0.75}
            >
              <View
                style={[styles.castAvatar, { backgroundColor: theme.card }]}
              >
                {member.imagePath ? (
                  <Image
                    source={{ uri: member.imagePath }}
                    style={styles.castAvatarImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text
                    style={[styles.castAvatarText, { color: theme.primary }]}
                  >
                    {member.stageName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.castInfo}>
                <Text
                  style={[styles.castName, { color: theme.text.primary }]}
                  numberOfLines={1}
                >
                  {member.stageName}
                </Text>
                {member.role && (
                  <Text style={[styles.castRole, { color: theme.text.muted }]}>
                    as {member.role}
                  </Text>
                )}
              </View>

              <View style={styles.castActions}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() =>
                    handleRemoveStar(member.personId, member.stageName)
                  }
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="close-circle-outline"
                    size={20}
                    color={theme.status.error}
                  />
                </TouchableOpacity>
                <Icon
                  name="chevron-forward"
                  size={18}
                  color={theme.text.muted}
                />
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity
            style={[styles.emptyCast, { backgroundColor: theme.card }]}
            onPress={handleOpenStarPicker}
            activeOpacity={0.7}
          >
            <Text style={[styles.emptyCastText, { color: theme.text.muted }]}>
              🎭 Tap "+ Add" to link stars
            </Text>
          </TouchableOpacity>
        )}

        {/* Gallery Button */}
        <TouchableOpacity
          style={[styles.galleryButton, { backgroundColor: theme.primary }]}
          onPress={handleOpenGallery}
        >
          <Text style={styles.galleryButtonText}>📸 View Gallery</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  addStarBtn: {
    alignSelf: 'flex-end',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  addStarBtnText: { fontSize: 13, fontWeight: '700' },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  bottomSpacing: { height: 40 },
  castActions: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  castAvatar: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  castAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  castAvatarText: { fontSize: 16, fontWeight: '700' },
  castCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  castInfo: { flex: 1, marginLeft: 12, marginRight: 8 },
  castName: { fontSize: 15, fontWeight: '600' },
  castRole: { fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  castSectionHeader: {
    borderBottomWidth: 2,
    flex: 1,
    marginRight: 10,
    paddingBottom: 6,
  },
  castSectionRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginTop: 8,
  },
  castSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  container: { flex: 1 },
  content: { padding: 20 },
  emptyCast: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
    padding: 20,
  },
  emptyCastText: { fontSize: 14 },
  galleryButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    padding: 14,
  },
  galleryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  headerButton: { paddingHorizontal: 10, paddingVertical: 8 },
  headerButtons: { alignItems: 'center', flexDirection: 'row' },
  heroBadgeRow: { flexDirection: 'row', gap: 8 },
  heroContainer: { height: 320, position: 'relative' },
  heroImage: { height: '100%', width: '100%' },
  heroInitial: { fontSize: 80 },
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    bottom: 0,
    left: 0,
    padding: 20,
    paddingBottom: 24,
    position: 'absolute',
    right: 0,
  },
  heroPlaceholder: {
    alignItems: 'center',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  infoRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoValue: { flex: 2, fontSize: 14, textAlign: 'right' },
  removeBtn: { padding: 2 },
  synopsis: { fontSize: 15, lineHeight: 24, marginBottom: 20 },
});

export default MovieDetailScreen;

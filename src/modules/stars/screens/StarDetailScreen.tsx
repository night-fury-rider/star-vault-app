import React, { useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { truncateHeaderTitle } from '../../../services/UtilService';
import { useTheme } from '../../../theme';
import { StarsStackParamList } from '../../../navigation/navigation-types';
import BaseSectionHeader from '../../../components/BaseSectionHeader';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { deleteStar } from '../../../store/thunks/star-thunks';
import {
  fetchStarMovies,
  removeStarMovie,
} from '../../../store/thunks/star-movie-thunks';
import {
  cmToFeetInches,
  formatBirthdayWithAge,
  kgToLbs,
} from '../../../utils/unit-utils';
import { Movie } from '../../movies/types/movie-types';

type NavProp = StackNavigationProp<StarsStackParamList, 'StarDetail'>;
type RoutePropType = RouteProp<StarsStackParamList, 'StarDetail'>;

const StarDetailScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { star: routeStar } = route.params;

  // Always read star from Redux so edits reflect immediately
  const star =
    useAppSelector(state =>
      state.stars.list.find(s => s.id === routeStar.id),
    ) ?? routeStar;

  const linkedMovies = useAppSelector(
    state => state.starMovies.moviesByStarId[star.id] || [],
  );

  // ─── Load linked movies on mount ─────────────────────────
  useEffect(() => {
    dispatch(fetchStarMovies({ starId: star.id, space: star.space }));
  }, [dispatch, star.id, star.space]);

  // ─── Header buttons ──────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      title: truncateHeaderTitle(star.stageName),
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
  }, [navigation, star, theme]);

  // ─── Actions ─────────────────────────────────────────────
  const handleEdit = () => {
    navigation.navigate('AddStar', { star });
  };

  const handleDelete = () => {
    Alert.alert(
      'Remove Star',
      `Are you sure you want to remove "${star.stageName}"? This will also remove all gallery media.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await dispatch(deleteStar(star.id));
            navigation.popToTop();
          },
        },
      ],
    );
  };

  const handleOpenWebsite = () => {
    if (star.officialWebsite) {
      Linking.openURL(star.officialWebsite);
    }
  };

  const handleOpenGallery = () => {
    navigation.navigate('StarGallery', { star });
  };

  const handleOpenMoviePicker = () => {
    navigation.navigate('StarMoviePicker', { star });
  };

  const handleNavigateToMovie = (movie: Movie) => {
    // Stay within the Stars stack — MovieDetail is registered here too,
    // so the back button correctly returns to StarDetail.
    navigation.navigate('MovieDetail', { movie });
  };

  const handleRemoveMovie = (movie: Movie) => {
    Alert.alert(
      'Remove Movie',
      `Remove "${movie.title}" from ${star.stageName}'s filmography?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () =>
            dispatch(
              removeStarMovie({
                starId: star.id,
                movieId: movie.id,
                space: star.space,
              }),
            ),
        },
      ],
    );
  };

  // ─── Render helpers ───────────────────────────────────────
  const renderInfoRow = (
    label: string,
    value?: string | null,
    index?: number,
  ) => {
    if (!value) return null;
    return (
      <View
        key={label + index}
        style={[styles.infoRow, { borderBottomColor: theme.border }]}
      >
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
      {/* ── Hero Image ──────────────────────────────────── */}
      <View style={[styles.heroContainer, { backgroundColor: theme.card }]}>
        {star.imagePath ? (
          <Image
            source={{ uri: star.imagePath }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.heroPlaceholder, { backgroundColor: theme.card }]}
          >
            <Text style={[styles.heroInitial, { color: theme.primary }]}>
              {star.stageName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View style={styles.heroOverlay}>
          <Text style={styles.heroName}>{star.stageName}</Text>
          {star.originalName && (
            <Text style={styles.heroOriginalName}>{star.originalName}</Text>
          )}
          {star.countryOfOrigin && (
            <Text style={styles.heroCountry}>🌍 {star.countryOfOrigin}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* ── Bio ─────────────────────────────────────── */}
        {star.bio && (
          <>
            <BaseSectionHeader title="About" />
            <Text style={[styles.bio, { color: theme.text.secondary }]}>
              {star.bio}
            </Text>
          </>
        )}

        {/* ── Personal Info ────────────────────────────── */}
        <BaseSectionHeader title="Personal Info" />
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          {renderInfoRow('Birthday', formatBirthdayWithAge(star.birthday))}
          {renderInfoRow('Height', cmToFeetInches(star.height))}
          {renderInfoRow('Weight', kgToLbs(star.weight))}
          {star.officialWebsite && (
            <TouchableOpacity
              style={[styles.infoRow, { borderBottomColor: theme.border }]}
              onPress={handleOpenWebsite}
            >
              <Text style={[styles.infoLabel, { color: theme.text.muted }]}>
                Website
              </Text>
              <Text
                style={[styles.infoLink, { color: theme.primary }]}
                numberOfLines={1}
              >
                {star.officialWebsite}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Custom Attributes ────────────────────────── */}
        {star.customAttributes && star.customAttributes.length > 0 && (
          <>
            <BaseSectionHeader title="Additional Info" />
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {star.customAttributes.map((attr, index) =>
                renderInfoRow(attr.key, attr.value, index),
              )}
            </View>
          </>
        )}

        {/* ── Movies ───────────────────────────────────── */}
        {/* Section header row with inline Add button */}
        <View style={styles.moviesSectionRow}>
          <View
            style={[
              styles.moviesSectionHeader,
              { borderBottomColor: theme.border },
            ]}
          >
            <Text style={[styles.moviesSectionTitle, { color: theme.primary }]}>
              MOVIES ({linkedMovies.length})
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.addMovieBtn, { borderColor: theme.primary }]}
            onPress={handleOpenMoviePicker}
          >
            <Text style={[styles.addMovieBtnText, { color: theme.primary }]}>
              + Add
            </Text>
          </TouchableOpacity>
        </View>

        {linkedMovies.length > 0 ? (
          linkedMovies.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={[
                styles.movieCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => handleNavigateToMovie(movie)}
              activeOpacity={0.75}
            >
              {/* Year badge */}
              <View style={[styles.movieYear, { backgroundColor: theme.card }]}>
                <Text style={[styles.movieYearText, { color: theme.primary }]}>
                  {movie.year}
                </Text>
              </View>

              {/* Info */}
              <View style={styles.movieInfo}>
                <Text
                  style={[styles.movieTitle, { color: theme.text.primary }]}
                  numberOfLines={1}
                >
                  {movie.title}
                </Text>
                {movie.genre && (
                  <Text style={[styles.movieMeta, { color: theme.text.muted }]}>
                    {movie.genre}
                  </Text>
                )}
              </View>

              {/* Chevron + Delete */}
              <View style={styles.movieActions}>
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemoveMovie(movie)}
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
            style={[styles.emptyMovies, { backgroundColor: theme.card }]}
            onPress={handleOpenMoviePicker}
            activeOpacity={0.7}
          >
            <Text style={[styles.emptyMoviesText, { color: theme.text.muted }]}>
              🎬 Tap "+ Add" to link movies
            </Text>
          </TouchableOpacity>
        )}

        {/* ── Gallery Button ───────────────────────────── */}
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
  addMovieBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 14,
    alignSelf: 'flex-end',
  },
  addMovieBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bio: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  bottomSpacing: {
    height: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  emptyMovies: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyMoviesText: {
    fontSize: 14,
  },
  galleryButton: {
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 20,
    padding: 14,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerButtons: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroCountry: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  heroImage: {
    height: '100%',
    width: '100%',
  },
  heroInitial: {
    fontSize: 96,
    fontWeight: '700',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroOriginalName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
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
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  infoLink: {
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  infoRow: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  infoValue: {
    flex: 2,
    fontSize: 14,
    textAlign: 'right',
  },
  movieActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  movieCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
  },
  movieInfo: {
    flex: 1,
    paddingHorizontal: 14,
  },
  movieMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  movieYear: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  movieYearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  moviesSectionHeader: {
    borderBottomWidth: 2,
    flex: 1,
    marginRight: 10,
    paddingBottom: 6,
  },
  moviesSectionRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginBottom: 0,
    marginTop: 8,
  },
  moviesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  removeBtn: {
    padding: 2,
  },
});

export default StarDetailScreen;

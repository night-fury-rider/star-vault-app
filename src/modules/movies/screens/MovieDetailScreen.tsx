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
import { useAppDispatch } from '../../../store/store-hooks';
import { deleteMovie } from '../../../store/thunks/movie-thunks';

type NavProp = StackNavigationProp<MoviesStackParamList, 'MovieDetail'>;
type RoutePropType = RouteProp<MoviesStackParamList, 'MovieDetail'>;

const MovieDetailScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { movie } = route.params;

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

  const renderInfoRow = (label: string, value?: string | null) => {
    if (!value) {
      return null;
    }
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

        {/* Gradient overlay */}
        <View style={styles.heroOverlay}>
          <Text style={styles.heroTitle}>{movie.title}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
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

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <>
            <BaseSectionHeader title={`Cast (${movie.cast.length})`} />
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {movie.cast.map(member => (
                <View
                  key={member.id}
                  style={[
                    styles.castRow,
                    { borderBottomColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.castAvatar,
                      { backgroundColor: theme.card },
                    ]}
                  >
                    <Text
                      style={[styles.castAvatarText, { color: theme.primary }]}
                    >
                      {member.stageName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.castInfo}>
                    <Text
                      style={[
                        styles.castName,
                        { color: theme.text.primary },
                      ]}
                    >
                      {member.stageName}
                    </Text>
                    {member.role && (
                      <Text
                        style={[
                          styles.castRole,
                          { color: theme.text.secondary },
                        ]}
                      >
                        as {member.role}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {movie.cast?.length === 0 && (
          <>
            <BaseSectionHeader title="Cast" />
            <View
              style={[styles.emptyCast, { backgroundColor: theme.card }]}
            >
              <Text style={[styles.emptyCastText, { color: theme.text.muted }]}>
                🎭 No cast linked yet
              </Text>
            </View>
          </>
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
  container: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  heroContainer: {
    height: 320,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInitial: {
    fontSize: 80,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  synopsis: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 20,
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
  },
  castRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  castAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  castAvatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  castInfo: {
    flex: 1,
  },
  castName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  castRole: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyCast: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyCastText: {
    fontSize: 14,
  },
  galleryButton: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  galleryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default MovieDetailScreen;

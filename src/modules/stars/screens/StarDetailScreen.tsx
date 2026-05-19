import React, { useEffect, useLayoutEffect, useState } from 'react';
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

import { useTheme } from '../../../theme';
import { StarsStackParamList } from '../../../navigation/navigation-types';
import { mockMovies, Movie } from '../../movies/data/mock-movies';
import BaseSectionHeader from '../../../components/BaseSectionHeader';
import { useAppDispatch } from '../../../store/store-hooks';
import { deleteStar } from '../../../store/thunks/star-thunks';
import {
  cmToFeetInches,
  formatBirthdayWithAge,
  kgToLbs,
} from '../../../utils/unit-utils';

type NavProp = StackNavigationProp<StarsStackParamList, 'StarDetail'>;
type RoutePropType = RouteProp<StarsStackParamList, 'StarDetail'>;

const StarDetailScreen = () => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const { star } = route.params;
  const [movies, setMovies] = useState<Movie[]>([]);

  // Load mock movies for this star
  useEffect(() => {
    const starMovies = mockMovies[star.id] || [];
    setMovies(starMovies);
  }, [star.id]);

  // Update useLayoutEffect
  useLayoutEffect(() => {
    navigation.setOptions({
      title: star.stageName,
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
            <Icon name="pencil-outline" size={22} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
            <Icon name="trash-outline" size={22} />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, star, theme]);

  const handleEdit = () => {
    Alert.alert('Edit Star', 'Edit screen coming soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Star',
      `Are you sure you want to delete "${star.stageName}"? This will also delete all gallery media.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
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

  const formatBirthday = (dateStr?: string) => {
    if (!dateStr) {
      return null;
    }
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (dateStr?: string) => {
    if (!dateStr) {
      return null;
    }
    const birth = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleOpenGallery = () => {
    navigation.navigate('StarGallery', { star });
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
      {/* Hero Image */}
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

        {/* Gradient overlay */}
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
        {/* Bio */}
        {star.bio && (
          <>
            <BaseSectionHeader title="About" />
            <Text style={[styles.bio, { color: theme.text.secondary }]}>
              {star.bio}
            </Text>
          </>
        )}

        {/* Personal Info */}
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

        {/* Custom Attributes */}
        {star.customAttributes && star.customAttributes.length > 0 && (
          <>
            <BaseSectionHeader title="Additional Info" />
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {star.customAttributes.map(attr =>
                renderInfoRow(attr.key, attr.value),
              )}
            </View>
          </>
        )}

        {/* Movies */}
        <BaseSectionHeader title={`Movies (${movies.length})`} />
        {movies.length > 0 ? (
          movies.map(movie => (
            <View
              key={movie.id}
              style={[
                styles.movieCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={[styles.movieYear, { backgroundColor: theme.card }]}>
                <Text style={[styles.movieYearText, { color: theme.primary }]}>
                  {movie.year}
                </Text>
              </View>
              <View style={styles.movieInfo}>
                <Text
                  style={[styles.movieTitle, { color: theme.text.primary }]}
                >
                  {movie.title}
                </Text>
                {movie.role && (
                  <Text
                    style={[styles.movieRole, { color: theme.text.secondary }]}
                  >
                    as {movie.role}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyMovies, { backgroundColor: theme.card }]}>
            <Text style={[styles.emptyMoviesText, { color: theme.text.muted }]}>
              🎬 No movies linked yet
            </Text>
          </View>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 96,
    fontWeight: '700',
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
  heroName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroOriginalName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  heroCountry: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  content: {
    padding: 20,
  },
  bio: {
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
  infoLink: {
    fontSize: 14,
    flex: 2,
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  movieCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  movieYear: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieYearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  movieInfo: {
    flex: 1,
    paddingHorizontal: 14,
  },
  movieTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  movieRole: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  emptyMovies: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  emptyMoviesText: {
    fontSize: 14,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default StarDetailScreen;

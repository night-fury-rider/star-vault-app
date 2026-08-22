import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useTheme } from '../../../theme';
import { MoviesStackParamList } from '../../../navigation/navigation-types';
import { Movie } from '../types/movie-types';
import BaseInput from '../../../components/BaseInput';
import BaseSectionHeader from '../../../components/BaseSectionHeader';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { createMovie, updateMovie } from '../../../store/thunks/movie-thunks';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

type NavProp = StackNavigationProp<MoviesStackParamList, 'AddMovie'>;
type RoutePropType = RouteProp<MoviesStackParamList, 'AddMovie'>;

const CURRENT_YEAR = new Date().getFullYear();

const AddMovieScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const dispatch = useAppDispatch();

  // ─── Edit mode detection ──────────────────────────────────
  const existingMovie = route.params?.movie;
  const isEditMode = !!existingMovie;

  const [title, setTitle] = useState(existingMovie?.title ?? '');
  const [year, setYear] = useState(existingMovie?.year?.toString() ?? '');
  const [genre, setGenre] = useState(existingMovie?.genre ?? '');
  const [director, setDirector] = useState(existingMovie?.director ?? '');
  const [synopsis, setSynopsis] = useState(existingMovie?.synopsis ?? '');
  const [imagePath, setImagePath] = useState<string | undefined>(
    existingMovie?.imagePath,
  );

  const [errors, setErrors] = useState<{
    title?: string;
    year?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const isUnlocked = useAppSelector(state => state.access.isUnlocked);

  const handlePickImage = () => {
    Alert.alert('Select Image', 'Choose image source', [
      {
        text: 'Camera',
        onPress: () =>
          launchCamera({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets?.[0]?.uri) {
              setImagePath(response.assets[0].uri);
            }
          }),
      },
      {
        text: 'Gallery',
        onPress: () =>
          launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
            if (response.assets?.[0]?.uri) {
              setImagePath(response.assets[0].uri);
            }
          }),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const validate = (): boolean => {
    const newErrors: { title?: string; year?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }

    const yearNum = parseInt(year, 10);
    if (!year.trim()) {
      newErrors.year = 'Year is required';
    } else if (isNaN(yearNum) || yearNum < 1888 || yearNum > CURRENT_YEAR + 5) {
      newErrors.year = `Year must be between 1888 and ${CURRENT_YEAR + 5}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        // ─── UPDATE ───────────────────────────────────────
        const updated: Movie = {
          ...existingMovie!,
          title: title.trim(),
          year: parseInt(year, 10),
          genre: genre.trim() || undefined,
          director: director.trim() || undefined,
          synopsis: synopsis.trim() || undefined,
          imagePath: imagePath || undefined,
          updatedAt: new Date().toISOString(),
        };

        console.log('✏️ Dispatching updateMovie...');
        const result = await dispatch(updateMovie(updated));

        if (updateMovie.rejected.match(result)) {
          console.error('❌ updateMovie was rejected:', result.payload);
          Alert.alert(
            'Error',
            String(result.payload) ?? 'Failed to update movie',
          );
          return;
        }

        console.log('✅ Movie updated successfully, going back');
      } else {
        // ─── CREATE ───────────────────────────────────────
        const newMovie: Movie = {
          id: uuidv4(),
          title: title.trim(),
          year: parseInt(year, 10),
          genre: genre.trim() || undefined,
          director: director.trim() || undefined,
          synopsis: synopsis.trim() || undefined,
          imagePath: imagePath || undefined,
          cast: [],
          space: isUnlocked ? 'private' : 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('🎬 Dispatching createMovie...');
        const result = await dispatch(createMovie(newMovie));

        if (createMovie.rejected.match(result)) {
          console.error('❌ createMovie was rejected:', result.payload);
          Alert.alert(
            'Error',
            String(result.payload) ?? 'Failed to save movie',
          );
          return;
        }

        console.log('✅ Movie saved successfully, going back');
      }

      navigation.goBack();
    } catch (e: any) {
      console.error('❌ handleSave caught error:', e);
      Alert.alert('Error', e?.message ?? 'Failed to save movie');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Poster Picker */}
        <TouchableOpacity
          style={[
            styles.imagePicker,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
          onPress={handlePickImage}
        >
          {imagePath ? (
            <Image source={{ uri: imagePath }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imageIcon}>🎬</Text>
              <Text
                style={[styles.imageLabel, { color: theme.text.secondary }]}
              >
                Tap to add poster
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Movie Details */}
        <BaseSectionHeader title="Movie Details" />

        <BaseInput
          label="Title"
          required
          placeholder="e.g. Inception"
          value={title}
          onChangeText={setTitle}
          error={errors.title}
          autoCapitalize="words"
        />

        <BaseInput
          label="Year"
          required
          placeholder={`e.g. ${CURRENT_YEAR}`}
          value={year}
          onChangeText={setYear}
          error={errors.year}
          keyboardType="numeric"
          maxLength={4}
        />

        <BaseInput
          label="Genre"
          placeholder="e.g. Sci-Fi, Action, Drama"
          value={genre}
          onChangeText={setGenre}
          autoCapitalize="words"
        />

        <BaseInput
          label="Director"
          placeholder="e.g. Christopher Nolan"
          value={director}
          onChangeText={setDirector}
          autoCapitalize="words"
        />

        <BaseInput
          label="Synopsis"
          placeholder="Write a short synopsis..."
          value={synopsis}
          onChangeText={setSynopsis}
          multiline
          numberOfLines={4}
          style={styles.synopsisInput}
          textAlignVertical="top"
        />

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: theme.background, borderTopColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: saving ? theme.primaryLight : theme.primary },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update Movie' : 'Save Movie'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  imagePicker: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    alignItems: 'center',
  },
  imageIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  synopsisInput: {
    height: 100,
    paddingTop: 12,
  },
  bottomSpacing: {
    height: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddMovieScreen;

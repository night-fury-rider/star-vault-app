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
import { StarsStackParamList } from '../../../navigation/navigation-types';
import { CustomAttribute, Star } from '../types/star-types';
import BaseInput from '../../../components/BaseInput';
import BaseDatePicker from '../../../components/BaseDatePicker';
import BaseSectionHeader from '../../../components/BaseSectionHeader';
import { useAppDispatch, useAppSelector } from '../../../store/store-hooks';
import { createStar, updateStar } from '../../../store/thunks/star-thunks';
import { copyStarProfile } from '../../../services/MediaStorageService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { showError } from '../../../utils/toast';

type NavProp = StackNavigationProp<StarsStackParamList, 'AddStar'>;
type RoutePropType = RouteProp<StarsStackParamList, 'AddStar'>;

const AddStarScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const dispatch = useAppDispatch();

  // ─── Edit mode detection ──────────────────────────────────
  const existingStar = route.params?.star;
  const isEditMode = !!existingStar;

  // ─── Star ID — generated upfront so it's available at pick time
  // In edit mode we use the existing ID; in create mode we generate
  // once so the profile copy uses the correct folder.
  const [starId] = useState<string>(existingStar?.id ?? uuidv4());

  // ─── Standard fields — pre-filled in edit mode ────────────
  const [stageName, setStageName] = useState(existingStar?.stageName ?? '');
  const [originalName, setOriginalName] = useState(
    existingStar?.originalName ?? '',
  );
  const [countryOfOrigin, setCountryOfOrigin] = useState(
    existingStar?.countryOfOrigin ?? '',
  );
  const [birthday, setBirthday] = useState<Date | undefined>(
    existingStar?.birthday ? new Date(existingStar.birthday) : undefined,
  );
  const [height, setHeight] = useState(existingStar?.height ?? '');
  const [weight, setWeight] = useState(existingStar?.weight ?? '');
  const [officialWebsite, setOfficialWebsite] = useState(
    existingStar?.officialWebsite ?? '',
  );
  const [bio, setBio] = useState(existingStar?.bio ?? '');
  const [imagePath, setImagePath] = useState<string | undefined>(
    existingStar?.imagePath,
  );

  // ─── Custom attributes — pre-filled in edit mode ──────────
  const [customAttributes, setCustomAttributes] = useState<CustomAttribute[]>(
    existingStar?.customAttributes ?? [],
  );

  const [errors, setErrors] = useState<{ stageName?: string }>({});
  const [saving, setSaving] = useState(false);
  const isUnlocked = useAppSelector(state => state.access.isUnlocked);

  // ─── Image picker ─────────────────────────────────────────
  // Copies picked image to internal storage immediately — never stores
  // content:// or camera temp URIs in state or DB.
  const handlePickedUri = async (uri: string) => {
    try {
      const internalPath = await copyStarProfile(uri, starId);
      // Image component needs file:// prefix for local paths
      setImagePath(
        internalPath.startsWith('file://')
          ? internalPath
          : `file://${internalPath}`,
      );
    } catch (e: any) {
      showError(e?.message ?? 'Failed to save image.');
    }
  };

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.assets?.[0]?.uri) {
        handlePickedUri(response.assets[0].uri);
      }
    });
  };

  // ─── Custom attributes ────────────────────────────────────
  const handleAddAttribute = () => {
    setCustomAttributes(prev => [
      ...prev,
      { id: uuidv4(), key: '', value: '' },
    ]);
  };

  const handleUpdateAttribute = (
    id: string,
    field: 'key' | 'value',
    text: string,
  ) => {
    setCustomAttributes(prev =>
      prev.map(attr => (attr.id === id ? { ...attr, [field]: text } : attr)),
    );
  };

  const handleRemoveAttribute = (id: string) => {
    setCustomAttributes(prev => prev.filter(attr => attr.id !== id));
  };

  // ─── Validation ───────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: { stageName?: string } = {};
    if (!stageName.trim()) {
      newErrors.stageName = 'Stage name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ─── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) {
      return;
    }
    setSaving(true);
    try {
      if (isEditMode) {
        // ─── UPDATE ───────────────────────────────────────
        const updatedStar: Star = {
          ...existingStar!,
          stageName,
          originalName: originalName || undefined,
          countryOfOrigin: countryOfOrigin || undefined,
          birthday: birthday?.toISOString() || undefined,
          height: height || undefined,
          weight: weight || undefined,
          officialWebsite: officialWebsite || undefined,
          bio: bio || undefined,
          imagePath: imagePath || undefined,
          customAttributes: customAttributes.filter(
            attr => attr.key.trim() && attr.value.trim(),
          ),
          space: existingStar!.space,
          updatedAt: new Date().toISOString(),
        };

        console.log('✏️ Dispatching updateStar...');
        const result = await dispatch(updateStar(updatedStar));

        if (updateStar.rejected.match(result)) {
          showError(String(result.payload) ?? 'Failed to update star');
          return;
        }

        navigation.goBack();
      } else {
        // ─── CREATE ───────────────────────────────────────
        const newStar: Star = {
          id: starId,
          stageName,
          originalName: originalName || undefined,
          countryOfOrigin: countryOfOrigin || undefined,
          birthday: birthday?.toISOString() || undefined,
          height: height || undefined,
          weight: weight || undefined,
          officialWebsite: officialWebsite || undefined,
          bio: bio || undefined,
          imagePath: imagePath || undefined,
          customAttributes: customAttributes.filter(
            attr => attr.key.trim() && attr.value.trim(),
          ),
          space: isUnlocked ? 'private' : 'public',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        console.log('⭐ Dispatching createStar...');
        const result = await dispatch(createStar(newStar));

        if (createStar.rejected.match(result)) {
          showError(String(result.payload) ?? 'Failed to save star');
          return;
        }

        navigation.goBack();
      }
    } catch (e: any) {
      showError(e?.message ?? 'Failed to save star');
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
        {/* Image Picker */}
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
              <Text style={styles.imageIcon}>📷</Text>
              <Text
                style={[styles.imageLabel, { color: theme.text.secondary }]}
              >
                Tap to add photo
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Standard Details */}
        <BaseSectionHeader title="Standard Details" />

        <BaseInput
          label="Stage Name"
          required
          placeholder="e.g. Leonardo DiCaprio"
          value={stageName}
          onChangeText={setStageName}
          error={errors.stageName}
          autoCapitalize="words"
        />

        <BaseInput
          label="Original Name"
          placeholder="e.g. Leonardo Wilhelm DiCaprio"
          value={originalName}
          onChangeText={setOriginalName}
          autoCapitalize="words"
        />

        <BaseInput
          label="Country of Origin"
          placeholder="e.g. United States"
          value={countryOfOrigin}
          onChangeText={setCountryOfOrigin}
          autoCapitalize="words"
        />

        <BaseDatePicker
          label="Birthday"
          value={birthday}
          onChange={setBirthday}
        />

        <BaseInput
          label="Height (cm)"
          placeholder="e.g. 183"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />

        <BaseInput
          label="Weight (kg)"
          placeholder="e.g. 80"
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
        />

        <BaseInput
          label="Official Website"
          placeholder="e.g. https://example.com"
          value={officialWebsite}
          onChangeText={setOfficialWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />

        <BaseInput
          label="Bio"
          placeholder="Write a short bio..."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
          textAlignVertical="top"
        />

        {/* Custom Attributes */}
        <BaseSectionHeader title="Custom Attributes" />

        {customAttributes.map((attr, index) => (
          <View key={attr.id} style={styles.attributeRow}>
            <View style={styles.attributeInputs}>
              <BaseInput
                label={`Key ${index + 1}`}
                placeholder="e.g. Nationality"
                value={attr.key}
                onChangeText={text =>
                  handleUpdateAttribute(attr.id, 'key', text)
                }
              />
              <BaseInput
                label={`Value ${index + 1}`}
                placeholder="e.g. American"
                value={attr.value}
                onChangeText={text =>
                  handleUpdateAttribute(attr.id, 'value', text)
                }
              />
            </View>
            <TouchableOpacity
              style={[
                styles.removeButton,
                { backgroundColor: theme.status.error },
              ]}
              onPress={() => handleRemoveAttribute(attr.id)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.addAttributeButton,
            { borderColor: theme.primary, backgroundColor: theme.card },
          ]}
          onPress={handleAddAttribute}
        >
          <Text style={[styles.addAttributeText, { color: theme.primary }]}>
            + Add Custom Attribute
          </Text>
        </TouchableOpacity>

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
              {isEditMode ? 'Update Star' : 'Save Star'}
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
    height: 200,
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
  bioInput: {
    height: 100,
    paddingTop: 12,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  attributeInputs: {
    flex: 1,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  removeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  addAttributeButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addAttributeText: {
    fontSize: 14,
    fontWeight: '600',
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

export default AddStarScreen;

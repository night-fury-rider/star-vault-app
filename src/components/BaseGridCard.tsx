import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { useTheme } from '../theme';
import { BaseItem } from './base-types';

interface Props {
  item: BaseItem;
  onPress: (item: BaseItem) => void;
  onDelete: (id: string) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_MARGIN = 6;
const NUM_COLUMNS = 2;
// Fixed width: half screen minus outer padding (16 each side) minus inner margins
const CARD_WIDTH =
  (SCREEN_WIDTH - 32 - CARD_MARGIN * NUM_COLUMNS * 2) / NUM_COLUMNS;
const TITLE_HEIGHT = 36;
const IMAGE_HEIGHT = Math.round(CARD_WIDTH * 1.5);
const CARD_HEIGHT = IMAGE_HEIGHT + TITLE_HEIGHT;

const BaseGridCard = ({ item, onPress, onDelete }: Props) => {
  const { theme } = useTheme();

  const handleLongPress = () => {
    Alert.alert('Delete', `Are you sure you want to delete "${item.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => onDelete(item.id),
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.primary,
        },
      ]}
      onPress={() => onPress(item)}
      onLongPress={handleLongPress}
      activeOpacity={0.85}
    >
      {/* Image — 80% height */}
      <View style={[styles.imageContainer, { backgroundColor: theme.card }]}>
        {item.imagePath ? (
          <Image
            source={{ uri: item.imagePath }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.avatarText, { color: theme.primary }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Title — 20% height */}
      <View style={[styles.titleContainer, { backgroundColor: theme.surface }]}>
        <Text
          style={[styles.name, { color: theme.text.primary }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    flexGrow: 0,
    flexShrink: 0,
    margin: CARD_MARGIN,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '700',
  },
  titleContainer: {
    height: TITLE_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BaseGridCard;

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useTheme } from '../theme';
import { BaseItem } from './base-types';

interface Props {
  item: BaseItem;
  onPress: (item: BaseItem) => void;
  onDelete: (id: string) => void;
}

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

const CARD_HEIGHT = 220;

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: CARD_HEIGHT,
    margin: 6,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  imageContainer: {
    height: '80%',
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
    height: '20%',
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

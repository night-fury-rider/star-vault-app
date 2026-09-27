import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { useTheme } from '../theme';
import { BaseItem } from './base-types';

interface Props {
  item: BaseItem;
  onPress: (item: BaseItem) => void;
  onDelete: (id: string) => void;
}

const SWIPE_THRESHOLD = -80;

const BaseCard = ({ item, onPress, onDelete }: Props) => {
  const { theme } = useTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > 5 && Math.abs(gestureState.dy) < 10,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          deleteOpacity.setValue(Math.min(Math.abs(gestureState.dx) / 80, 1));
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_THRESHOLD) {
          // Show delete confirmation
          Alert.alert(
            'Remove',
            `Are you sure you want to remove "${item.name}"?`,
            [
              {
                text: 'Cancel',
                style: 'cancel',
                onPress: () => resetSwipe(),
              },
              {
                text: 'Remove',
                style: 'destructive',
                onPress: () => onDelete(item.id),
              },
            ],
          );
        } else {
          resetSwipe();
        }
      },
    }),
  ).current;

  const resetSwipe = () => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(deleteOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <View style={styles.wrapper}>
      {/* Delete Background */}
      <Animated.View
        style={[
          styles.deleteBackground,
          {
            backgroundColor: theme.status.error,
            opacity: deleteOpacity,
          },
        ]}
      >
        <Text style={styles.deleteText}>🗑 Delete</Text>
      </Animated.View>

      {/* Card */}
      <Animated.View
        style={[{ transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
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
          activeOpacity={0.85}
        >
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: theme.card }]}>
            {item.imagePath ? (
              <Image
                source={{ uri: item.imagePath }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={[styles.avatarText, { color: theme.primary }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text
              style={[styles.name, { color: theme.text.primary }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.bio, { color: theme.text.secondary }]}
              numberOfLines={2}
            >
              {item.bio || 'No bio available'}
            </Text>
          </View>

          {/* Arrow */}
          <Text style={[styles.arrow, { color: theme.text.muted }]}>›</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
  },
  deleteText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    lineHeight: 18,
  },
  arrow: {
    fontSize: 24,
    marginLeft: 8,
  },
});

export default BaseCard;

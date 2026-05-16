import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StarsStackParamList } from '../../../navigation/navigation-types';

import { useTheme } from '../../../theme';
import { Star, ViewMode } from '../types/star-types';
import { mockStars } from '../data/mock-stars';
import BaseCard from '../../../components/BaseCard';
import BaseGridCard from '../../../components/BaseGridCard';
import BaseEmptyState from '../../../components/BaseEmptyState';
import BaseFab from '../../../components/BaseFab';
import { BaseItem } from '../../../components/base-types';

const StarsScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { theme } = useTheme();
  const [stars, setStars] = useState<Star[]>(mockStars);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const filteredStars = stars.filter(star => {
    const query = searchQuery.toLowerCase();
    return (
      star.stageName.toLowerCase().includes(query) ||
      star.originalName?.toLowerCase().includes(query) ||
      star.bio?.toLowerCase().includes(query)
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
      const star = stars.find(s => s.id === item.id);
      if (!star) {
        return;
      }
      navigation.navigate('StarDetail', {
        star,
        onStarUpdated: (updatedStar: Star) => {
          setStars(prev =>
            prev.map(s => (s.id === updatedStar.id ? updatedStar : s)),
          );
        },
      });
    },
    [stars, navigation],
  );

  const handleDelete = useCallback((id: string) => {
    setStars(prev => prev.filter(s => s.id !== id));
  }, []);

  const renderCardItem = ({ item }: { item: Star }) => (
    <BaseCard
      item={{ ...item, name: item.stageName }}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  );

  const renderGridItem = ({ item }: { item: Star }) => (
    <BaseGridCard
      item={{ ...item, name: item.stageName }}
      onPress={handlePress}
      onDelete={handleDelete}
    />
  );

  const handleAdd = () => {
    navigation.navigate('AddStar', {
      onStarAdded: (star: Star) => {
        setStars(prev => [star, ...prev]);
      },
    });
  };

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
            placeholder="Search stars..."
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
            {viewMode === 'list' ? '☰' : '⊞'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Count */}
      {filteredStars.length > 0 && (
        <Text style={[styles.countText, { color: theme.text.muted }]}>
          {filteredStars.length} {filteredStars.length === 1 ? 'star' : 'stars'}
        </Text>
      )}

      {/* List */}
      <Animated.View style={[styles.listContainer, { opacity: fadeAnim }]}>
        <FlatList
          key={viewMode}
          data={filteredStars}
          keyExtractor={item => item.id}
          renderItem={viewMode === 'card' ? renderGridItem : renderCardItem}
          numColumns={viewMode === 'card' ? 2 : 1}
          contentContainerStyle={[
            styles.listContent,
            filteredStars.length === 0 && styles.emptyList,
          ]}
          ListEmptyComponent={
            <BaseEmptyState
              searchQuery={searchQuery}
              entityName="stars"
              emptyMessage="Start building your star vault by tapping the + button below."
            />
          }
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={
            viewMode === 'card' ? () => <View style={styles.separator} /> : null
          }
        />
      </Animated.View>

      {/* FAB */}
      <BaseFab onPress={handleAdd} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 44,
    padding: 0,
  },
  toggleButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 4,
  },
  emptyList: {
    flexGrow: 1,
  },
  separator: {
    height: 4,
  },
});

export default StarsScreen;

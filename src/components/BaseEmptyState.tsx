import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  searchQuery?: string;
  entityName?: string;
  emptyMessage?: string;
}

const BaseEmptyState = ({
  searchQuery,
  entityName = 'items',
  emptyMessage,
}: Props) => {
  const { theme } = useTheme();
  const isSearchEmpty = searchQuery && searchQuery.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.illustration}>{isSearchEmpty ? '🔍' : '🌟'}</Text>
      <Text style={[styles.title, { color: theme.text.primary }]}>
        {isSearchEmpty ? 'No results found' : `No ${entityName} Yet`}
      </Text>
      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
        {isSearchEmpty
          ? `No ${entityName} matched "${searchQuery}". Try a different name.`
          : emptyMessage ||
            `Start adding ${entityName} by tapping the + button below.`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 80,
  },
  illustration: {
    fontSize: 72,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BaseEmptyState;

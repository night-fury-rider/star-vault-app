import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  title: string;
}

const BaseSectionHeader = ({ title }: Props) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.primary }]}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 2,
    marginBottom: 16,
    marginTop: 8,
    paddingBottom: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default BaseSectionHeader;

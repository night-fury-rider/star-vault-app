import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, Typography } from '../../../theme';

const StarsScreen = () => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[Typography.h1, { color: theme.primary }]}>⭐ Stars</Text>
      <Text
        style={[Typography.body, { color: theme.text.secondary, marginTop: 8 }]}
      >
        Your star collection lives here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default StarsScreen;

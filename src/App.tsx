import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { ThemeProvider } from './theme';
import TabNavigator from './navigation/TabNavigator';
import { store } from './store/store';
import { initDBAdapter } from './db/db-provider';
import { createTables } from './db/db-init';

// ─── Inner component — DB init lives here, inside Provider ───
const AppContent = () => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const adapter = initDBAdapter();
        await createTables(adapter);

        setDbReady(true);
      } catch (e: any) {
        console.error('❌ Setup error:', e);
        setDbError(e?.message ?? 'Failed to initialize database');
      }
    };
    setup();
  }, []);

  if (dbError) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>⚠️ {dbError}</Text>
      </View>
    );
  }

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0288D1" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

// ─── Root component — Provider is always outermost ───────────
const App = () => {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f1a',
  },
  errorText: {
    color: '#ef9a9a',
    fontSize: 14,
    textAlign: 'center',
    padding: 24,
  },
});

export default App;

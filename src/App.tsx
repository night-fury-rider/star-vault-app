import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import Toast from 'react-native-toast-message';
import { ThemeProvider } from './theme';
import TabNavigator from './navigation/TabNavigator';
import { store } from './store/store';
import { initDBAdapter } from './db/db-provider';
import { createTables, ensureSpaceColumn } from './db/db-init';
import StorageService from './services/StorageService';
import LoggerService from './services/LoggerService';
import { setUnlocked } from './store/slices/access-slice';

const ACCESS_KEY = 'starvault_access';

// ─── Inner component — DB init lives here, inside Provider ───
const AppContent = () => {
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    const setupDB = async () => {
      try {
        const adapter = initDBAdapter();
        await createTables(adapter);
        await ensureSpaceColumn(adapter, 'Person');
        await ensureSpaceColumn(adapter, 'Movie');
        setDbReady(true);
      } catch (e: any) {
        console.error('❌ Setup error:', e);
        setDbError(e?.message ?? 'Failed to initialize database');
      }
    };

    try {
      StorageService.init();
    } catch (err) {
      LoggerService.error('Error while initializing Storage Service', err);
    }

    // Hydrate access state from persisted storage
    try {
      const persisted = StorageService.get(ACCESS_KEY, 'boolean');
      if (persisted === true) {
        store.dispatch(setUnlocked(true));
      }
    } catch (err) {
      LoggerService.error('Error reading access state', err);
    }

    setupDB();
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
      <Toast />
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

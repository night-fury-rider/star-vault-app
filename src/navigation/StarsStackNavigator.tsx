import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { StarsStackParamList } from './navigation-types';
import StarsScreen from '../modules/stars/screens/StarsScreen';
import AddStarScreen from '../modules/stars/screens/AddStarScreen';
import StarDetailScreen from '../modules/stars/screens/StarDetailScreen';

const Stack = createStackNavigator<StarsStackParamList>();

const StarsStackNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.header.background },
        headerTintColor: theme.header.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen
        name="StarsList"
        component={StarsScreen}
        options={{ title: 'Stars' }}
      />
      <Stack.Screen
        name="AddStar"
        component={AddStarScreen}
        options={{ title: 'Add Star' }}
      />
      <Stack.Screen
        name="StarDetail"
        component={StarDetailScreen}
        options={{ title: '' }}
      />
    </Stack.Navigator>
  );
};

export default StarsStackNavigator;

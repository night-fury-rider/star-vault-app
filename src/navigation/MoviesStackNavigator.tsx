import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { MoviesStackParamList } from './navigation-types';
import MoviesScreen from '../modules/movies/screens/MoviesScreen';
import AddMovieScreen from '../modules/movies/screens/AddMovieScreen';
import MovieDetailScreen from '../modules/movies/screens/MovieDetailScreen';
import MovieGalleryScreen from '../modules/movies/screens/MovieGalleryScreen';
import MovieMediaViewerScreen from '../modules/movies/screens/MovieMediaViewerScreen';
import MovieStarPickerScreen from '../modules/movies/screens/MovieStarPickerScreen';
import StarDetailScreen from '../modules/stars/screens/StarDetailScreen';

const Stack = createStackNavigator<MoviesStackParamList>();

const MoviesStackNavigator = () => {
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
        name="MoviesList"
        component={MoviesScreen}
        options={{ title: 'Movies' }}
      />
      <Stack.Screen
        name="AddMovie"
        component={AddMovieScreen}
        options={{ title: 'Add Movie' }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="MovieGallery"
        component={MovieGalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <Stack.Screen
        name="MovieMediaViewer"
        component={MovieMediaViewerScreen}
        options={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
        }}
      />
      <Stack.Screen
        name="MovieStarPicker"
        component={MovieStarPickerScreen}
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

export default MoviesStackNavigator;

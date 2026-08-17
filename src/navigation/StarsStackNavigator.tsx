import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../theme';
import { StarsStackParamList } from './navigation-types';
import StarsScreen from '../modules/stars/screens/StarsScreen';
import AddStarScreen from '../modules/stars/screens/AddStarScreen';
import StarDetailScreen from '../modules/stars/screens/StarDetailScreen';
import StarGalleryScreen from '../modules/stars/screens/StarGalleryScreen';
import MediaViewerScreen from '../modules/stars/screens/MediaViewerScreen';
import StarMoviePickerScreen from '../modules/stars/screens/StarMoviePickerScreen';
import MovieDetailScreen from '../modules/movies/screens/MovieDetailScreen';
import MovieGalleryScreen from '../modules/movies/screens/MovieGalleryScreen';
import MovieMediaViewerScreen from '../modules/movies/screens/MovieMediaViewerScreen';
import MovieStarPickerScreen from '../modules/stars/screens/StarMoviePickerScreen';

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
        options={({ route }) => ({
          title: route.params?.star ? 'Edit Star' : 'Add Star',
        })}
      />
      <Stack.Screen
        name="StarDetail"
        component={StarDetailScreen}
        options={{ title: '' }}
      />
      <Stack.Screen
        name="StarGallery"
        component={StarGalleryScreen}
        options={{ title: 'Gallery' }}
      />
      <Stack.Screen
        name="MediaViewer"
        component={MediaViewerScreen}
        options={{
          headerShown: false,
          cardStyle: { backgroundColor: '#000000' },
        }}
      />
      <Stack.Screen
        name="StarMoviePicker"
        component={StarMoviePickerScreen}
        options={{ title: 'Add Movie' }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={({ route }) => ({ title: route.params.movie.title })}
      />
      <Stack.Screen
        name="MovieGallery"
        component={MovieGalleryScreen}
        options={({ route }) => ({
          title: `${route.params.movie.title} — Gallery`,
        })}
      />
      <Stack.Screen
        name="MovieStarPicker"
        component={MovieStarPickerScreen}
        options={{ title: 'Add Star' }}
      />
      <Stack.Screen
        name="MovieMediaViewer"
        component={MovieMediaViewerScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StarsStackNavigator;

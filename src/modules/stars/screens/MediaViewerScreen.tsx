import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Video from 'react-native-video';
import {
  StarsStackParamList,
  GalleryMedia,
} from '../../../navigation/navigation-types';

type RoutePropType = RouteProp<StarsStackParamList, 'MediaViewer'>;

const { width, height } = Dimensions.get('window');

const MediaViewerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<RoutePropType>();
  const { mediaList, initialIndex } = route.params;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const renderMedia = ({ item }: { item: GalleryMedia }) => {
    if (item.type === 'video') {
      return (
        <TouchableOpacity
          style={styles.mediaContainer}
          activeOpacity={1}
          onPress={() => setPaused(p => !p)}
        >
          <Video
            source={{ uri: item.uri }}
            style={styles.video}
            resizeMode="contain"
            paused={paused}
            repeat
            controls={false}
          />
          {paused && (
            <View style={styles.pauseOverlay}>
              <Text style={styles.pauseIcon}>▶</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Close button */}
      <SafeAreaView style={styles.header}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Counter */}
        <Text style={styles.counter}>
          {currentIndex + 1} / {mediaList.length}
        </Text>

        {/* Media type badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>
            {mediaList[currentIndex]?.type === 'video' ? '🎥 Video' : '🖼 Photo'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Swipeable media */}
      <FlatList
        ref={flatListRef}
        data={mediaList}
        keyExtractor={item => item.id}
        renderItem={renderMedia}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          setPaused(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  counter: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  mediaContainer: {
    width,
    height,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height,
  },
  video: {
    width,
    height,
  },
  pauseOverlay: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    marginLeft: 4,
  },
});

export default MediaViewerScreen;

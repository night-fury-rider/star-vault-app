import { Star } from '../modules/stars/types/star-types';
import { Movie } from '../modules/movies/types/movie-types';

export type StarsStackParamList = {
  StarsList: undefined;
  AddStar: { star?: Star } | undefined;
  EditStar: { star: Star; onStarUpdated: (star: Star) => void };
  StarDetail: { star: Star };
  StarGallery: { star: Star };
  MediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
  StarMoviePicker: { star: Star };
  MovieDetail: { movie: Movie };
  MovieGallery: { movie: Movie };
  MovieStarPicker: { movie: Movie };
  MovieMediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
};

export type MoviesStackParamList = {
  MoviesList: undefined;
  AddMovie: { movie?: Movie } | undefined;
  MovieDetail: { movie: Movie };
  MovieGallery: { movie: Movie };
  MovieMediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
  MovieStarPicker: { movie: Movie };
  StarDetail: { star: Star };
};

export interface GalleryMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  createdAt: string;
}

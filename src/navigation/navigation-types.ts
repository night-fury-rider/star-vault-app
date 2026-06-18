import { Star } from '../modules/stars/types/star-types';
import { Movie } from '../modules/movies/types/movie-types';

export type StarsStackParamList = {
  StarsList: undefined;
  AddStar: undefined;
  EditStar: { star: Star; onStarUpdated: (star: Star) => void };
  StarDetail: { star: Star };
  StarGallery: { star: Star };
  MediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
};

export type MoviesStackParamList = {
  MoviesList: undefined;
  AddMovie: undefined;
  EditMovie: { movie: Movie };
  MovieDetail: { movie: Movie };
  MovieGallery: { movie: Movie };
  MovieMediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
};

export interface GalleryMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  createdAt: string;
}

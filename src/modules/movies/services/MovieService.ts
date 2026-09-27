import { MovieRepository } from '../../../db/repositories/movie-repository';
import { MovieGalleryRepository } from '../../../db/repositories/movie-gallery-repository';
import { getDBAdapter } from '../../../db/db-provider';
import { Movie } from '../types/movie-types';
import { Space } from '../../stars/types/star-types';
import { GalleryMedia } from '../../../navigation/navigation-types';
import LoggerService from '../../../services/LoggerService';

const getMovieRepo = () => new MovieRepository(getDBAdapter());
const getGalleryRepo = () => new MovieGalleryRepository(getDBAdapter());

export const MovieService = {
  async getAllMovies(space: Space): Promise<Movie[]> {
    LoggerService.log('📋 MovieService.getAllMovies:', space);
    const movies = await getMovieRepo().findAll(space);
    LoggerService.log('📋 Found movies:', movies.length);
    return movies;
  },

  async getMovieById(id: string): Promise<Movie | null> {
    LoggerService.log('🔍 MovieService.getMovieById:', id);
    return getMovieRepo().findById(id);
  },

  async createMovie(movie: Movie): Promise<void> {
    LoggerService.log('🎬 MovieService.createMovie:', movie.title, movie.space);
    await getMovieRepo().insert(movie);
    LoggerService.log('✅ MovieService.createMovie done');
  },

  async updateMovie(movie: Movie): Promise<void> {
    LoggerService.log('✏️ MovieService.updateMovie:', movie.id);
    await getMovieRepo().update(movie);
    LoggerService.log('✅ MovieService.updateMovie done');
  },

  async deleteMovie(id: string): Promise<void> {
    LoggerService.log('🗑 MovieService.deleteMovie:', id);
    await getMovieRepo().delete(id);
    LoggerService.log('✅ MovieService.deleteMovie done');
  },

  async searchMovies(query: string, space: Space): Promise<Movie[]> {
    LoggerService.log('🔍 MovieService.searchMovies:', query, space);
    if (!query.trim()) {
      return getMovieRepo().findAll(space);
    }
    return getMovieRepo().search(query, space);
  },

  async getGallery(movieId: string): Promise<GalleryMedia[]> {
    LoggerService.log('🖼 MovieService.getGallery for movie:', movieId);
    const media = await getGalleryRepo().findByMovieId(movieId);
    LoggerService.log('🖼 Found media:', media.length);
    return media;
  },

  async addMedia(movieId: string, media: GalleryMedia): Promise<void> {
    LoggerService.log(
      '➕ MovieService.addMedia:',
      media.type,
      'for movie:',
      movieId,
    );
    await getGalleryRepo().insert(movieId, media);
    LoggerService.log('✅ MovieService.addMedia done');
  },

  async deleteMedia(mediaId: string): Promise<void> {
    LoggerService.log('🗑 MovieService.deleteMedia:', mediaId);
    await getGalleryRepo().delete(mediaId);
    LoggerService.log('✅ MovieService.deleteMedia done');
  },

  async deleteMediaBatch(mediaIds: string[]): Promise<void> {
    LoggerService.log('🗑 MovieService.deleteMediaBatch:', mediaIds.length);
    await getGalleryRepo().deleteBatch(mediaIds);
    LoggerService.log('✅ MovieService.deleteMediaBatch done');
  },
};

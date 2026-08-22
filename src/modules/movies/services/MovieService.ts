import { MovieRepository } from '../../../db/repositories/movie-repository';
import { MovieGalleryRepository } from '../../../db/repositories/movie-gallery-repository';
import { getDBAdapter } from '../../../db/db-provider';
import { Movie } from '../types/movie-types';
import { Space } from '../../stars/types/star-types';
import { GalleryMedia } from '../../../navigation/navigation-types';

const getMovieRepo = () => new MovieRepository(getDBAdapter());
const getGalleryRepo = () => new MovieGalleryRepository(getDBAdapter());

export const MovieService = {
  async getAllMovies(space: Space): Promise<Movie[]> {
    console.log('📋 MovieService.getAllMovies:', space);
    const movies = await getMovieRepo().findAll(space);
    console.log('📋 Found movies:', movies.length);
    return movies;
  },

  async getMovieById(id: string): Promise<Movie | null> {
    console.log('🔍 MovieService.getMovieById:', id);
    return getMovieRepo().findById(id);
  },

  async createMovie(movie: Movie): Promise<void> {
    console.log('🎬 MovieService.createMovie:', movie.title, movie.space);
    await getMovieRepo().insert(movie);
    console.log('✅ MovieService.createMovie done');
  },

  async updateMovie(movie: Movie): Promise<void> {
    console.log('✏️ MovieService.updateMovie:', movie.id);
    await getMovieRepo().update(movie);
    console.log('✅ MovieService.updateMovie done');
  },

  async deleteMovie(id: string): Promise<void> {
    console.log('🗑 MovieService.deleteMovie:', id);
    await getMovieRepo().delete(id);
    console.log('✅ MovieService.deleteMovie done');
  },

  async searchMovies(query: string, space: Space): Promise<Movie[]> {
    console.log('🔍 MovieService.searchMovies:', query, space);
    if (!query.trim()) {
      return getMovieRepo().findAll(space);
    }
    return getMovieRepo().search(query, space);
  },

  async getGallery(movieId: string): Promise<GalleryMedia[]> {
    console.log('🖼 MovieService.getGallery for movie:', movieId);
    const media = await getGalleryRepo().findByMovieId(movieId);
    console.log('🖼 Found media:', media.length);
    return media;
  },

  async addMedia(movieId: string, media: GalleryMedia): Promise<void> {
    console.log('➕ MovieService.addMedia:', media.type, 'for movie:', movieId);
    await getGalleryRepo().insert(movieId, media);
    console.log('✅ MovieService.addMedia done');
  },

  async deleteMedia(mediaId: string): Promise<void> {
    console.log('🗑 MovieService.deleteMedia:', mediaId);
    await getGalleryRepo().delete(mediaId);
    console.log('✅ MovieService.deleteMedia done');
  },

  async deleteMediaBatch(mediaIds: string[]): Promise<void> {
    console.log('🗑 MovieService.deleteMediaBatch:', mediaIds.length);
    await getGalleryRepo().deleteBatch(mediaIds);
    console.log('✅ MovieService.deleteMediaBatch done');
  },
};

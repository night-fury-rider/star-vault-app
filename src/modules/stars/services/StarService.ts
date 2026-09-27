import { StarRepository } from '../../../db/repositories/star-repository';
import { GalleryRepository } from '../../../db/repositories/gallery-repository';
import { getDBAdapter } from '../../../db/db-provider';
import { Star, Space } from '../types/star-types';
import { GalleryMedia } from '../../../navigation/navigation-types';
import LoggerService from '../../../services/LoggerService';

const getStarRepo = () => new StarRepository(getDBAdapter());
const getGalleryRepo = () => new GalleryRepository(getDBAdapter());

export const StarService = {
  async getAllStars(space: Space): Promise<Star[]> {
    LoggerService.log('📋 StarService.getAllStars:', space);
    const stars = await getStarRepo().findAll(space);
    LoggerService.log('📋 Found stars:', stars.length);
    return stars;
  },

  async getStarById(id: string): Promise<Star | null> {
    LoggerService.log('🔍 StarService.getStarById:', id);
    return getStarRepo().findById(id);
  },

  async createStar(star: Star): Promise<void> {
    LoggerService.log('⭐ StarService.createStar:', star.stageName, star.space);
    await getStarRepo().insert(star);
    LoggerService.log('✅ StarService.createStar done');
  },

  async updateStar(star: Star): Promise<void> {
    LoggerService.log('✏️ StarService.updateStar:', star.id);
    await getStarRepo().update(star);
    LoggerService.log('✅ StarService.updateStar done');
  },

  async deleteStar(id: string): Promise<void> {
    LoggerService.log('🗑 StarService.deleteStar:', id);
    await getStarRepo().delete(id);
    LoggerService.log('✅ StarService.deleteStar done');
  },

  async searchStars(query: string, space: Space): Promise<Star[]> {
    LoggerService.log('🔍 StarService.searchStars:', query, space);
    if (!query.trim()) {
      return getStarRepo().findAll(space);
    }
    return getStarRepo().search(query, space);
  },

  async getGallery(starId: string): Promise<GalleryMedia[]> {
    LoggerService.log('🖼 StarService.getGallery for star:', starId);
    const media = await getGalleryRepo().findByStarId(starId);
    LoggerService.log('🖼 Found media:', media.length);
    return media;
  },

  async addMedia(starId: string, media: GalleryMedia): Promise<void> {
    LoggerService.log(
      '➕ StarService.addMedia:',
      media.type,
      'for star:',
      starId,
    );
    await getGalleryRepo().insert(starId, media);
    LoggerService.log('✅ StarService.addMedia done');
  },

  async deleteMedia(mediaId: string): Promise<void> {
    LoggerService.log('🗑 StarService.deleteMedia:', mediaId);
    await getGalleryRepo().delete(mediaId);
    LoggerService.log('✅ StarService.deleteMedia done');
  },

  async deleteMediaBatch(mediaIds: string[]): Promise<void> {
    LoggerService.log('🗑 StarService.deleteMediaBatch:', mediaIds.length);
    await getGalleryRepo().deleteBatch(mediaIds);
    LoggerService.log('✅ StarService.deleteMediaBatch done');
  },
};

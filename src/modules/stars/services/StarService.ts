import { StarRepository } from '../../../db/repositories/star-repository';
import { GalleryRepository } from '../../../db/repositories/gallery-repository';
import { getDBAdapter } from '../../../db/db-provider';
import { Star } from '../types/star-types';
import { GalleryMedia } from '../../../navigation/navigation-types';

const getStarRepo = () => new StarRepository(getDBAdapter());
const getGalleryRepo = () => new GalleryRepository(getDBAdapter());

export const StarService = {
  async getAllStars(): Promise<Star[]> {
    console.log('📋 StarService.getAllStars');
    const stars = await getStarRepo().findAll();
    console.log('📋 Found stars:', stars.length);
    return stars;
  },

  async getStarById(id: string): Promise<Star | null> {
    console.log('🔍 StarService.getStarById:', id);
    return getStarRepo().findById(id);
  },

  async createStar(star: Star): Promise<void> {
    console.log('⭐ StarService.createStar:', star.stageName);
    await getStarRepo().insert(star);
    console.log('✅ StarService.createStar done');
  },

  async updateStar(star: Star): Promise<void> {
    console.log('✏️ StarService.updateStar:', star.id);
    await getStarRepo().update(star);
    console.log('✅ StarService.updateStar done');
  },

  async deleteStar(id: string): Promise<void> {
    console.log('🗑 StarService.deleteStar:', id);
    await getStarRepo().delete(id);
    console.log('✅ StarService.deleteStar done');
  },

  async searchStars(query: string): Promise<Star[]> {
    console.log('🔍 StarService.searchStars:', query);
    if (!query.trim()) {
      return getStarRepo().findAll();
    }
    return getStarRepo().search(query);
  },

  async getGallery(starId: string): Promise<GalleryMedia[]> {
    console.log('🖼 StarService.getGallery for star:', starId);
    const media = await getGalleryRepo().findByStarId(starId);
    console.log('🖼 Found media:', media.length);
    return media;
  },

  async addMedia(starId: string, media: GalleryMedia): Promise<void> {
    console.log('➕ StarService.addMedia:', media.type, 'for star:', starId);
    await getGalleryRepo().insert(starId, media);
    console.log('✅ StarService.addMedia done');
  },

  async deleteMedia(mediaId: string): Promise<void> {
    console.log('🗑 StarService.deleteMedia:', mediaId);
    await getGalleryRepo().delete(mediaId);
    console.log('✅ StarService.deleteMedia done');
  },

  async deleteMediaBatch(mediaIds: string[]): Promise<void> {
    console.log('🗑 StarService.deleteMediaBatch:', mediaIds.length);
    await getGalleryRepo().deleteBatch(mediaIds);
    console.log('✅ StarService.deleteMediaBatch done');
  },
};

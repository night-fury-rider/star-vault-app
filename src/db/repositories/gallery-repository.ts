import { DBAdapter } from '../adapter/db-adapter';
import { GalleryMedia } from '../../navigation/navigation-types';
import LoggerService from '../../services/LoggerService';

export class GalleryRepository {
  private adapter: DBAdapter;

  constructor(adapter: DBAdapter) {
    this.adapter = adapter;
  }

  async insert(starId: string, media: GalleryMedia): Promise<void> {
    LoggerService.log('💾 GalleryRepo.insert:', media.id, 'for star:', starId);
    await this.adapter.execute(
      `INSERT INTO StarImage (id, personId, filePath, type, createdAt)
       VALUES (?, ?, ?, ?, ?);`,
      [media.id, starId, media.uri, media.type, media.createdAt],
    );
    LoggerService.log('✅ GalleryRepo.insert done');
  }

  async findByStarId(starId: string): Promise<GalleryMedia[]> {
    LoggerService.log('💾 GalleryRepo.findByStarId:', starId);
    const result = await this.adapter.execute(
      `SELECT * FROM StarImage
       WHERE personId = ?
       ORDER BY createdAt DESC;`,
      [starId],
    );
    LoggerService.log('✅ GalleryRepo.findByStarId rows:', result.rows.length);
    LoggerService.log(
      '✅ GalleryRepo.findByStarId data:',
      JSON.stringify(result.rows),
    );
    return result.rows.map(row => ({
      id: row.id,
      uri: row.filePath,
      type: row.type as 'image' | 'video',
      createdAt: row.createdAt,
    }));
  }

  async delete(mediaId: string): Promise<void> {
    LoggerService.log('💾 GalleryRepo.delete:', mediaId);
    await this.adapter.execute(`DELETE FROM StarImage WHERE id = ?;`, [
      mediaId,
    ]);
    LoggerService.log('✅ GalleryRepo.delete done');
  }

  async deleteBatch(mediaIds: string[]): Promise<void> {
    LoggerService.log('💾 GalleryRepo.deleteBatch:', mediaIds.length);
    const placeholders = mediaIds.map(() => '?').join(', ');
    await this.adapter.execute(
      `DELETE FROM StarImage WHERE id IN (${placeholders});`,
      mediaIds,
    );
    LoggerService.log('✅ GalleryRepo.deleteBatch done');
  }

  async deleteAllForStar(starId: string): Promise<void> {
    LoggerService.log('💾 GalleryRepo.deleteAllForStar:', starId);
    await this.adapter.execute(`DELETE FROM StarImage WHERE personId = ?;`, [
      starId,
    ]);
    LoggerService.log('✅ GalleryRepo.deleteAllForStar done');
  }
}

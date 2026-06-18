import { DBAdapter } from '../adapter/db-adapter';
import { GalleryMedia } from '../../navigation/navigation-types';

export class MovieGalleryRepository {
  private adapter: DBAdapter;

  constructor(adapter: DBAdapter) {
    this.adapter = adapter;
  }

  async insert(movieId: string, media: GalleryMedia): Promise<void> {
    console.log('💾 MovieGalleryRepo.insert:', media.id, 'for movie:', movieId);
    await this.adapter.execute(
      `INSERT INTO MovieImage (id, movieId, filePath, type, createdAt)
       VALUES (?, ?, ?, ?, ?);`,
      [media.id, movieId, media.uri, media.type, media.createdAt],
    );
    console.log('✅ MovieGalleryRepo.insert done');
  }

  async findByMovieId(movieId: string): Promise<GalleryMedia[]> {
    console.log('💾 MovieGalleryRepo.findByMovieId:', movieId);
    const result = await this.adapter.execute(
      `SELECT * FROM MovieImage
       WHERE movieId = ?
       ORDER BY createdAt DESC;`,
      [movieId],
    );
    console.log('✅ MovieGalleryRepo.findByMovieId rows:', result.rows.length);
    return result.rows.map(row => ({
      id: row.id,
      uri: row.filePath,
      type: row.type as 'image' | 'video',
      createdAt: row.createdAt,
    }));
  }

  async delete(mediaId: string): Promise<void> {
    console.log('💾 MovieGalleryRepo.delete:', mediaId);
    await this.adapter.execute(`DELETE FROM MovieImage WHERE id = ?;`, [
      mediaId,
    ]);
    console.log('✅ MovieGalleryRepo.delete done');
  }

  async deleteBatch(mediaIds: string[]): Promise<void> {
    console.log('💾 MovieGalleryRepo.deleteBatch:', mediaIds.length);
    const placeholders = mediaIds.map(() => '?').join(', ');
    await this.adapter.execute(
      `DELETE FROM MovieImage WHERE id IN (${placeholders});`,
      mediaIds,
    );
    console.log('✅ MovieGalleryRepo.deleteBatch done');
  }

  async deleteAllForMovie(movieId: string): Promise<void> {
    console.log('💾 MovieGalleryRepo.deleteAllForMovie:', movieId);
    await this.adapter.execute(`DELETE FROM MovieImage WHERE movieId = ?;`, [
      movieId,
    ]);
    console.log('✅ MovieGalleryRepo.deleteAllForMovie done');
  }
}

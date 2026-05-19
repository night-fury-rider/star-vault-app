import { DBAdapter } from '../adapter/db-adapter';
import { Star, CustomAttribute } from '../../modules/stars/types/star-types';

export class StarRepository {
  private adapter: DBAdapter;

  constructor(adapter: DBAdapter) {
    this.adapter = adapter;
  }

  // ─── CREATE ───────────────────────────────────────────────
  async insert(star: Star): Promise<void> {
    await this.adapter.transaction(async tx => {
      await tx.execute(
        `INSERT INTO Person (
          id, userId, stageName, originalName, countryOfOrigin,
          birthday, height, weight, officialWebsite, bio,
          imagePath, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
        [
          star.id,
          star.userId ?? null,
          star.stageName,
          star.originalName ?? null,
          star.countryOfOrigin ?? null,
          star.birthday ?? null,
          star.height ?? null,
          star.weight ?? null,
          star.officialWebsite ?? null,
          star.bio ?? null,
          star.imagePath ?? null,
          star.createdAt,
          star.updatedAt,
        ],
      );

      // Insert custom attributes
      if (star.customAttributes && star.customAttributes.length > 0) {
        for (const attr of star.customAttributes) {
          await tx.execute(
            `INSERT INTO CustomAttribute (id, personId, key, value)
             VALUES (?, ?, ?, ?);`,
            [attr.id, star.id, attr.key, attr.value],
          );
        }
      }
    });
  }

  // ─── READ ALL ─────────────────────────────────────────────
  async findAll(): Promise<Star[]> {
    console.log('💾 StarRepo.findAll');
    const result = await this.adapter.execute(
      `SELECT * FROM Person ORDER BY stageName ASC;`,
    );

    console.log('💾 StarRepo.findAll raw result:', JSON.stringify(result));
    console.log('💾 StarRepo.findAll rows:', result.rows?.length);

    if (!result.rows || result.rows.length === 0) {
      console.log('💾 StarRepo.findAll — no rows found');
      return [];
    }

    const stars: Star[] = await Promise.all(
      result.rows.map(async row => {
        console.log('💾 Mapping row:', JSON.stringify(row));
        const attrs = await this.findCustomAttributes(row.id);
        return this.mapRowToStar(row, attrs);
      }),
    );

    console.log('💾 StarRepo.findAll mapped stars:', stars.length);
    return stars;
  }

  // ─── READ ONE ─────────────────────────────────────────────
  async findById(id: string): Promise<Star | null> {
    const result = await this.adapter.execute(
      `SELECT * FROM Person WHERE id = ?;`,
      [id],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const attrs = await this.findCustomAttributes(id);
    return this.mapRowToStar(result.rows[0], attrs);
  }

  // ─── UPDATE ───────────────────────────────────────────────
  async update(star: Star): Promise<void> {
    await this.adapter.transaction(async tx => {
      await tx.execute(
        `UPDATE Person SET
          stageName = ?,
          originalName = ?,
          countryOfOrigin = ?,
          birthday = ?,
          height = ?,
          weight = ?,
          officialWebsite = ?,
          bio = ?,
          imagePath = ?,
          updatedAt = ?
        WHERE id = ?;`,
        [
          star.stageName,
          star.originalName ?? null,
          star.countryOfOrigin ?? null,
          star.birthday ?? null,
          star.height ?? null,
          star.weight ?? null,
          star.officialWebsite ?? null,
          star.bio ?? null,
          star.imagePath ?? null,
          star.updatedAt,
          star.id,
        ],
      );

      // Replace custom attributes
      await tx.execute(`DELETE FROM CustomAttribute WHERE personId = ?;`, [
        star.id,
      ]);

      if (star.customAttributes && star.customAttributes.length > 0) {
        for (const attr of star.customAttributes) {
          await tx.execute(
            `INSERT INTO CustomAttribute (id, personId, key, value)
             VALUES (?, ?, ?, ?);`,
            [attr.id, star.id, attr.key, attr.value],
          );
        }
      }
    });
  }

  // ─── DELETE ───────────────────────────────────────────────
  async delete(id: string): Promise<void> {
    // CASCADE handles CustomAttribute, StarImage, StarMovie
    await this.adapter.execute(`DELETE FROM Person WHERE id = ?;`, [id]);
  }

  // ─── SEARCH ───────────────────────────────────────────────
  async search(query: string): Promise<Star[]> {
    const like = `%${query}%`;
    const result = await this.adapter.execute(
      `SELECT * FROM Person
       WHERE stageName LIKE ?
          OR originalName LIKE ?
          OR bio LIKE ?
       ORDER BY stageName ASC;`,
      [like, like, like],
    );

    const stars: Star[] = await Promise.all(
      result.rows.map(async row => {
        const attrs = await this.findCustomAttributes(row.id);
        return this.mapRowToStar(row, attrs);
      }),
    );

    return stars;
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────
  private async findCustomAttributes(
    personId: string,
  ): Promise<CustomAttribute[]> {
    const result = await this.adapter.execute(
      `SELECT * FROM CustomAttribute WHERE personId = ?;`,
      [personId],
    );
    return result.rows.map(row => ({
      id: row.id,
      key: row.key,
      value: row.value,
    }));
  }

  private mapRowToStar(row: any, attrs: CustomAttribute[]): Star {
    return {
      id: row.id,
      userId: row.userId ?? undefined,
      stageName: row.stageName,
      originalName: row.originalName ?? undefined,
      countryOfOrigin: row.countryOfOrigin ?? undefined,
      birthday: row.birthday ?? undefined,
      height: row.height ?? undefined,
      weight: row.weight ?? undefined,
      officialWebsite: row.officialWebsite ?? undefined,
      bio: row.bio ?? undefined,
      imagePath: row.imagePath ?? undefined,
      customAttributes: attrs,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

import ReactNativeBlobUtil from 'react-native-blob-util';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// ─── Internal storage root ────────────────────────────────────
// ReactNativeBlobUtil.fs.dirs.DocumentDir resolves to the app's
// private /files directory — never purged by OS, not visible to
// other apps without explicit sharing.
const mediaRoot = (): string =>
  `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/media`;

// ─── sanitizeSegment ─────────────────────────────────────────
// Strips everything except a-z, 0-9, and underscore.
// Blocks path traversal: dots and slashes are removed entirely.
// Result is lowercased and capped at 80 chars.
const sanitizeSegment = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_') // replace unsafe chars with _
    .replace(/_+/g, '_') // collapse consecutive underscores
    .replace(/^_|_$/g, '') // trim leading/trailing underscores
    .slice(0, 80) || 'unknown';

// ─── extractExtension ────────────────────────────────────────
// Derives file extension from URI or falls back to 'jpg'.
// Only allows known safe image/video extensions.
const ALLOWED_EXTENSIONS = new Set([
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'mp4',
  'mov',
  'mkv',
]);

const extractExtension = (uri: string): string => {
  const match = uri.split('?')[0].match(/\.([a-zA-Z0-9]+)$/);
  const ext = match?.[1]?.toLowerCase() ?? 'jpg';
  return ALLOWED_EXTENSIONS.has(ext) ? ext : 'jpg';
};

// ─── ensureDir ───────────────────────────────────────────────
const ensureDir = async (dir: string): Promise<void> => {
  const exists = await ReactNativeBlobUtil.fs.exists(dir);
  if (!exists) {
    try {
      await ReactNativeBlobUtil.fs.mkdir(dir);
    } catch (e: any) {
      // Another concurrent call may have created it between exists() and mkdir()
      // Re-check and only rethrow if it genuinely doesn't exist
      const nowExists = await ReactNativeBlobUtil.fs.exists(dir);
      if (!nowExists) {
        throw e;
      }
    }
  }
};

// ─── copyToInternal ──────────────────────────────────────────
// Core copy — reads content:// or file:// URI, writes to destPath.
const copyToInternal = async (
  sourceUri: string,
  destPath: string,
): Promise<string> => {
  await ReactNativeBlobUtil.fs.cp(sourceUri, destPath);
  return destPath;
};

// ─── copyMovieGalleryImage ───────────────────────────────────
const copyMovieGalleryImage = async (
  contentUri: string,
  movieId: string,
): Promise<string> => {
  const dir = `${mediaRoot()}/movies/${sanitizeSegment(movieId)}/gallery`;
  await ensureDir(`${mediaRoot()}`);
  await ensureDir(`${mediaRoot()}/movies`);
  await ensureDir(`${mediaRoot()}/movies/${sanitizeSegment(movieId)}`);
  await ensureDir(dir);
  const ext = extractExtension(contentUri);
  const destPath = `${dir}/${uuidv4()}.${ext}`;
  return copyToInternal(contentUri, destPath);
};

// ─── copyMovieProfile ────────────────────────────────────────
const copyMovieProfile = async (
  contentUri: string,
  movieId: string,
): Promise<string> => {
  const dir = `${mediaRoot()}/movies/${sanitizeSegment(movieId)}`;
  await ensureDir(`${mediaRoot()}`);
  await ensureDir(`${mediaRoot()}/movies`);
  await ensureDir(dir);
  const ext = extractExtension(contentUri);
  const destPath = `${dir}/profile.${ext}`;
  return copyToInternal(contentUri, destPath);
};

// ─── copyStarGalleryImage ────────────────────────────────────
const copyStarGalleryImage = async (
  contentUri: string,
  starId: string,
): Promise<string> => {
  const dir = `${mediaRoot()}/stars/${sanitizeSegment(starId)}/gallery`;
  await ensureDir(`${mediaRoot()}`);
  await ensureDir(`${mediaRoot()}/stars`);
  await ensureDir(`${mediaRoot()}/stars/${sanitizeSegment(starId)}`);
  await ensureDir(dir);
  const ext = extractExtension(contentUri);
  const destPath = `${dir}/${uuidv4()}.${ext}`;
  return copyToInternal(contentUri, destPath);
};

// ─── copyStarProfile ─────────────────────────────────────────
const copyStarProfile = async (
  contentUri: string,
  starId: string,
): Promise<string> => {
  const dir = `${mediaRoot()}/stars/${sanitizeSegment(starId)}`;
  await ensureDir(`${mediaRoot()}`);
  await ensureDir(`${mediaRoot()}/stars`);
  await ensureDir(dir);
  const ext = extractExtension(contentUri);
  const destPath = `${dir}/profile.${ext}`;
  return copyToInternal(contentUri, destPath);
};

// ─── deleteFile ──────────────────────────────────────────────
// Called when a star/movie/gallery item is deleted.
// Silently ignores missing files — safe to call unconditionally.
const deleteFile = async (internalPath: string): Promise<void> => {
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(internalPath);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(internalPath);
    }
  } catch {
    // Non-fatal — file may already be gone
  }
};

// ─── deleteStarMedia ─────────────────────────────────────────
// Deletes the entire star media folder (profile + gallery).
// Called when a star is deleted.
const deleteStarMedia = async (starId: string): Promise<void> => {
  const dir = `${mediaRoot()}/stars/${sanitizeSegment(starId)}`;
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(dir);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(dir);
    }
  } catch {
    // Non-fatal
  }
};

// ─── deleteMovieMedia ────────────────────────────────────────
// Deletes the entire movie media folder (poster + gallery).
// Called when a movie is deleted.
const deleteMovieMedia = async (movieId: string): Promise<void> => {
  const dir = `${mediaRoot()}/movies/${sanitizeSegment(movieId)}`;
  try {
    const exists = await ReactNativeBlobUtil.fs.exists(dir);
    if (exists) {
      await ReactNativeBlobUtil.fs.unlink(dir);
    }
  } catch {
    // Non-fatal
  }
};

export {
  copyMovieGalleryImage,
  copyMovieProfile,
  copyStarGalleryImage,
  copyStarProfile,
  deleteFile,
  deleteMovieMedia,
  deleteStarMedia,
};

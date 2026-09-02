import { HEADER_TITLE_MAX_LENGTH } from '../constants/app-constants';

/**
 * Truncates a string for use as a navigation header title.
 * Trims to HEADER_TITLE_MAX_LENGTH chars and appends '...' if needed,
 * so long titles never overlap header action buttons.
 */
export const truncateHeaderTitle = (title: string): string => {
  if (title.length <= HEADER_TITLE_MAX_LENGTH) {
    return title;
  }
  return title.slice(0, HEADER_TITLE_MAX_LENGTH).trimEnd() + '...';
};

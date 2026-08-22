export interface CustomAttribute {
  id: string;
  key: string;
  value: string;
}

export type Space = 'public' | 'private';

export interface Star {
  id: string;
  stageName: string;
  originalName?: string;
  countryOfOrigin?: string;
  birthday?: string;
  height?: string;
  weight?: string;
  officialWebsite?: string;
  bio?: string;
  imagePath?: string;
  customAttributes?: CustomAttribute[];
  space: Space;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export type ViewMode = 'card' | 'list';

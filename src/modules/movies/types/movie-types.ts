import { Space } from '../../stars/types/star-types';

export interface MovieCustomAttribute {
  id: string;
  key: string;
  value: string;
}

export interface MovieCast {
  id: string;
  personId: string;
  stageName: string;
  imagePath?: string;
  role?: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  genre?: string;
  director?: string;
  synopsis?: string;
  imagePath?: string;
  cast?: MovieCast[];
  customAttributes?: MovieCustomAttribute[];
  space: Space;
  createdAt: string;
  updatedAt: string;
}

export type ViewMode = 'card' | 'list';

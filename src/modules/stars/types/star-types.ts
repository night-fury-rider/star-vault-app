export interface Star {
  id: string;
  name: string;
  bio?: string;
  imagePath?: string;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

export type ViewMode = 'card' | 'list';

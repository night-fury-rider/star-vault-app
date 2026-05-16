export interface BaseItem {
  id: string;
  name: string;
  bio?: string;
  imagePath?: string;
}

export type ViewMode = 'card' | 'list';

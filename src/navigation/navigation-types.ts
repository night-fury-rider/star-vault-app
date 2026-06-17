import { Star } from '../modules/stars/types/star-types';

export type StarsStackParamList = {
  StarsList: undefined;
  AddStar: { star?: Star };
  StarDetail: { star: Star };
  StarGallery: { star: Star };
  MediaViewer: { mediaList: GalleryMedia[]; initialIndex: number };
};

export interface GalleryMedia {
  id: string;
  uri: string;
  type: 'image' | 'video';
  createdAt: string;
}

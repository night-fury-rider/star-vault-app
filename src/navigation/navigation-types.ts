import { Star } from '../modules/stars/types/star-types';

export type StarsStackParamList = {
  StarsList: undefined;
  AddStar: { onStarAdded: (star: Star) => void };
  EditStar: { star: Star; onStarUpdated: (star: Star) => void };
  StarDetail: { star: Star; onStarUpdated: (star: Star) => void };
};

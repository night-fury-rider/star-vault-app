import { Star } from '../types/star-types';

export const mockStars: Star[] = [
  {
    id: '1',
    name: 'Leonardo DiCaprio',
    bio: 'Academy Award-winning actor known for Titanic, Inception, and The Revenant.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Meryl Streep',
    bio: 'Three-time Academy Award winner widely regarded as the greatest actress of her generation.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Tom Hanks',
    bio: 'Beloved actor and filmmaker known for Forrest Gump, Cast Away, and Saving Private Ryan.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Cate Blanchett',
    bio: 'Australian actress and theatre director, winner of two Academy Awards.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Denzel Washington',
    bio: 'Two-time Academy Award winner known for Training Day, Malcolm X, and Glory.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

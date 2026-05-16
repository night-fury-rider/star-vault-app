export interface Movie {
  id: string;
  title: string;
  year: number;
  role?: string;
}

export const mockMovies: Record<string, Movie[]> = {
  '1': [
    { id: 'm1', title: 'Titanic', year: 1997, role: 'Jack Dawson' },
    { id: 'm2', title: 'Inception', year: 2010, role: 'Dom Cobb' },
    { id: 'm3', title: 'The Revenant', year: 2015, role: 'Hugh Glass' },
  ],
  '2': [
    {
      id: 'm4',
      title: 'The Devil Wears Prada',
      year: 2006,
      role: 'Miranda Priestly',
    },
    { id: 'm5', title: 'Kramer vs. Kramer', year: 1979, role: 'Joanna Kramer' },
  ],
  '3': [
    { id: 'm6', title: 'Forrest Gump', year: 1994, role: 'Forrest Gump' },
    { id: 'm7', title: 'Cast Away', year: 2000, role: 'Chuck Noland' },
    {
      id: 'm8',
      title: 'Saving Private Ryan',
      year: 1998,
      role: 'Captain Miller',
    },
  ],
};

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO date string
  time?: string; // Time string
  location: string;
  imageUrl?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string; // ISO string
  eventLink?: string;
  price?: string;
  timezone?: string;
  dateTime?: string; // ISO string
  isMultiDay?: boolean;
  numberOfDays?: number;
  endDate?: string; // ISO date string
  paused?: boolean;
  deleted?: boolean;
  isMoviePremiere?: boolean;
  trailerUrl?: string; // YouTube trailer URL
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

export interface Movie {
  id: string;
  title: string;
  logLine: string; // Short, catchy description
  synopsis: string; // Detailed description
  videoUrl: string; // YouTube or Vimeo URL
  imageUrl?: string; // Poster/thumbnail image
  creatorId: string;
  creatorName: string;
  createdAt: string; // ISO string
  category?: string; // Short Film, Web Episode, Documentary, etc.
  duration?: string; // e.g., "18 minutes"
  releaseYear?: number;
  tags?: string[];
  awards?: string[]; // Awards and recognitions
  paused?: boolean;
  deleted?: boolean;
}

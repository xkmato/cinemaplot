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
  tags?: string[]; // Event tags/categories
  followers?: string[]; // Array of user IDs who are following the event
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
  averageRating?: number; // Average rating from all reviews
  totalRatings?: number; // Total number of ratings
}

export interface Review {
  id: string;
  movieId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: string; // ISO string
}

export interface Comment {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string; // ISO string
}

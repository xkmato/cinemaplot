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
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

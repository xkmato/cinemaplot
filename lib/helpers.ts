import { Event } from './types';

// Date helpers
export const getWeekStartDate = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const isSameDay = (d1: Date, d2: Date): boolean =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

// Check if an event includes a specific date (for multi-day events)
export const eventIncludesDate = (event: Event, targetDate: Date): boolean => {
  const eventStartDate = new Date(event.date);
  const targetDateObj = new Date(targetDate);

  // For single day events
  if (!event.isMultiDay) {
    return isSameDay(eventStartDate, targetDateObj);
  }

  // For multi-day events, check if target date is within the range
  const eventEndDate = new Date(event.endDate!);
  return targetDateObj >= eventStartDate && targetDateObj <= eventEndDate;
};

// Get all dates that a multi-day event spans
export const getEventDateRange = (event: Event): Date[] => {
  const dates: Date[] = [];
  const startDate = new Date(event.date);
  const numberOfDays = event.numberOfDays || 1;

  for (let i = 0; i < numberOfDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    dates.push(currentDate);
  }

  return dates;
};

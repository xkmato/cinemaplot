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

// Check if an event is upcoming or currently ongoing
export const isEventUpcomingOrOngoing = (event: Event, today: string = new Date().toISOString().split('T')[0]): boolean => {
  const eventStartDate = event.date;
  
  // For single day events, check if the event date is today or in the future
  if (!event.isMultiDay) {
    return eventStartDate >= today;
  }
  
  // For multi-day events, check if today falls within the event's date range
  if (event.endDate) {
    return today >= eventStartDate && today <= event.endDate;
  }
  
  // Fallback: if no endDate but has numberOfDays, calculate the end date
  if (event.numberOfDays && event.numberOfDays > 1) {
    const startDate = new Date(eventStartDate);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + event.numberOfDays - 1);
    const endDateStr = endDate.toISOString().split('T')[0];
    return today >= eventStartDate && today <= endDateStr;
  }
  
  // Default behavior: treat as single day event
  return eventStartDate >= today;
};

// Check if an event is in the past (completely finished)
export const isEventInPast = (event: Event, today: string = new Date().toISOString().split('T')[0]): boolean => {
  // For single day events, check if the event date is before today
  if (!event.isMultiDay) {
    return event.date < today;
  }
  
  // For multi-day events, check if the end date is before today
  if (event.endDate) {
    return event.endDate < today;
  }
  
  // Fallback: if no endDate but has numberOfDays, calculate the end date
  if (event.numberOfDays && event.numberOfDays > 1) {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + event.numberOfDays - 1);
    const endDateStr = endDate.toISOString().split('T')[0];
    return endDateStr < today;
  }
  
  // Default behavior: treat as single day event
  return event.date < today;
};

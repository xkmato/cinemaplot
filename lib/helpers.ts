import { Event } from './types';

// Fountain file validation
export const validateFountainFile = async (file: File): Promise<{ isValid: boolean; error?: string }> => {
    // Check file extension
    if (!file.name.toLowerCase().endsWith('.fountain')) {
        return { isValid: false, error: "Only Fountain (.fountain) files are allowed for screenplays" };
    }

    // Check file size (10MB limit)
    const maxSizeInBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
        return { isValid: false, error: "File size must be less than 10MB" };
    }

    // Read and validate file content
    try {
        const content = await file.text();
        
        // Check if file is empty
        if (!content.trim()) {
            return { isValid: false, error: "The Fountain file appears to be empty" };
        }

        // Check for binary content (which shouldn't be in a text file)
        if (content.includes('\x00') || content.includes('\uFFFD')) {
            return { isValid: false, error: "This file appears to contain binary data. Fountain files should be plain text." };
        }

        const lines = content.split('\n');
        
        // Check for common Fountain elements
        const sceneHeadingPattern = /^(INT\.|EXT\.|FADE IN:|FADE OUT:|FADE TO:|CUT TO:|DISSOLVE TO:)/i;
        const hasSceneHeading = lines.some(line => sceneHeadingPattern.test(line.trim()));

        // Check for character names (all caps, standalone lines)
        const characterPattern = /^[A-Z][A-Z\s\.']+$/;
        const hasCharacterNames = lines.some(line => {
            const trimmed = line.trim();
            return trimmed.length > 1 && 
                   trimmed.length < 50 && 
                   characterPattern.test(trimmed) &&
                   !sceneHeadingPattern.test(trimmed) &&
                   !trimmed.includes('FADE') &&
                   !trimmed.includes('CUT TO') &&
                   !trimmed.includes('DISSOLVE TO');
        });

        // Check for parentheticals (text in parentheses)
        const hasParentheticals = lines.some(line => {
            const trimmed = line.trim();
            return trimmed.startsWith('(') && trimmed.endsWith(')') && trimmed.length > 2;
        });

        // Check for action lines (mixed case text that's not dialogue or character names)
        const hasActionLines = lines.some(line => {
            const trimmed = line.trim();
            return trimmed.length > 0 && 
                   trimmed !== trimmed.toUpperCase() && 
                   !trimmed.startsWith('(') &&
                   !sceneHeadingPattern.test(trimmed);
        });

        // Basic Fountain validation
        if (!hasSceneHeading && !hasCharacterNames && !hasActionLines && !hasParentheticals) {
            return { 
                isValid: false, 
                error: "This doesn't appear to be a valid Fountain screenplay. Fountain files should contain scene headings (INT./EXT.), character names, dialogue, or action lines." 
            };
        }

        // More specific validation - should have scene headings for a proper screenplay
        if (!hasSceneHeading) {
            return { 
                isValid: false, 
                error: "Missing scene headings. Fountain screenplays should start with scene headings like 'INT. LOCATION - DAY' or 'EXT. LOCATION - NIGHT'." 
            };
        }

        // Check if it might be a different format (like FDX or PDF content)
        const suspiciousBinaryMarkers = ['<?xml', '<FinalDraft', '%PDF', 'PK\x03\x04'];
        const contentStart = content.substring(0, 1000).toLowerCase();
        
        for (const marker of suspiciousBinaryMarkers) {
            if (contentStart.includes(marker.toLowerCase())) {
                return { 
                    isValid: false, 
                    error: "This appears to be a different file format (PDF, FDX, etc.). Please convert your screenplay to Fountain format first." 
                };
            }
        }

        return { isValid: true };

    } catch (readError) {
        console.error("Error reading file:", readError);
        return { 
            isValid: false, 
            error: "Unable to read the file content. Please ensure it's a valid text file." 
        };
    }
};

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
    return today <= event.endDate;
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

// Check if an event runs for more than a week (7 days)
export const isEventLongerThanWeek = (event: Event): boolean => {
  // For single day events, it's never longer than a week
  if (!event.isMultiDay) {
    return false;
  }
  
  // Check using numberOfDays if available
  if (event.numberOfDays) {
    return event.numberOfDays > 7;
  }
  
  // Check using start and end dates
  if (event.endDate) {
    const startDate = new Date(event.date);
    const endDate = new Date(event.endDate);
    const diffInTime = endDate.getTime() - startDate.getTime();
    const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24)) + 1; // +1 to include both start and end days
    return diffInDays > 7;
  }
  
  // Default: if it's marked as multi-day but no duration info, assume it's not longer than a week
  return false;
};

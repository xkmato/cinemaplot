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
  
  // Audition-specific properties
  type?: 'general' | 'audition'; // Event type
  screenplayId?: string; // Reference to the screenplay/project (for auditions)
  auditionRoles?: AuditionRole[]; // Roles available for audition
}

export interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
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

export interface ScreenplayInvitation {
  id: string;
  screenplayId: string;
  invitedBy: string; // User ID of the person who sent the invitation
  invitedByName: string;
  invitedEmail: string;
  invitedUserId?: string; // If the invited person already has an account
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  permissions: ScreenplayPermissions;
  createdAt: string;
  expiresAt?: string;
  message?: string; // Optional personal message
}

export interface ScreenplayPermissions {
  canRead: boolean;
  canComment: boolean;
  canHighlight: boolean;
  canDownload: boolean;
  canInvite: boolean; // Can invite other collaborators
  canEdit?: boolean; // Future: editing permissions
}

export interface Screenplay {
    id: string;
    title: string;
    description: string;
    author: string;
    authorId: string;
    creatorName?: string;
    logLine?: string;
    synopsis?: string;
    genre?: string;
    tags?: string[];
    rating?: number;
    ratingCount?: number;
    averageRating?: number;
    totalDownloads?: number;
    totalComments?: number;
    viewCount?: number;
    fileUrl: string;
    fileSize: number;
    pageCount?: number;
    createdAt: string;
    updatedAt: string;
    
    // Status properties
    deleted?: boolean;
    paused?: boolean;
    
    // Privacy and collaboration settings
    isPublic?: boolean; // Default false - private by default
    visibility?: 'private' | 'public' | 'collaborators'; // More explicit visibility control
    collaborators?: string[]; // Array of user IDs who have access
    collaboratorEmails?: string[]; // Array of email addresses for pending invitations
    invitedCollaborators?: ScreenplayInvitation[]; // Pending invitations
    permissions?: ScreenplayPermissions; // Fine-grained permissions
    
    // Processing status for server-side PDF processing
    isProcessed?: boolean;
    processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
    processingError?: string;
    processedAt?: string;
    processingAttempts?: number;
    maxRetryAttempts?: number;
    processingProgress?: number; // 0-100 percentage
    
    // Processed content for interactive viewing
    content?: ScreenplayPage[];
}

export interface ScreenplayPage {
  pageNumber: number;
  content: ScreenplayElement[];
}

export interface ScreenplayElement {
  id: string; // Unique identifier for the element
  type: 'scene_heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'general';
  text: string;
  lineNumber: number; // Line number within the page
  startIndex: number; // Character start index in the full text
  endIndex: number; // Character end index in the full text
}

export interface ScreenplayHighlight {
  id: string;
  screenplayId: string;
  userId: string;
  userName: string;
  pageNumber: number;
  elementIds: string[]; // Array of element IDs that are highlighted
  startIndex: number; // Start character index within the selection
  endIndex: number; // End character index within the selection
  selectedText: string;
  color: string; // Highlight color
  note?: string; // Optional note attached to highlight
  createdAt: string;
}

export interface ScreenplayComment {
  id: string;
  screenplayId: string;
  pageNumber?: number; // Optional: specific page reference
  elementId?: string; // Optional: specific element reference
  highlightId?: string; // Optional: reference to a highlight
  selectedText?: string; // Optional: quoted text from screenplay
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string; // ISO string
  parentId?: string; // For threaded comments/replies
  isGeneral?: boolean; // True for general comments not tied to specific text
}

export interface ScreenplayDiscussion {
  id: string;
  screenplayId: string;
  title: string;
  description?: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  isGeneral?: boolean; // General discussion vs. specific scene/page discussion
  pageNumber?: number; // If tied to specific page
  tags?: string[]; // Discussion tags like "character-development", "plot", "dialogue"
  totalComments?: number;
}

// Audition and Tape Types
export interface AuditionRole {
  id: string;
  roleName: string; // e.g., "SARAH", "JOHN", "BARISTA"
  description?: string; // Role description
  pageRanges: PageRange[]; // Which pages/scenes this role should read
  requirements?: string; // Age range, gender, specific requirements
  numberOfSlots?: number; // How many actors are needed for this role
  status?: 'open' | 'closed' | 'filled'; // Audition status for this role
}

export interface PageRange {
  startPage: number;
  endPage: number;
  description?: string; // e.g., "Coffee shop scene", "Emotional monologue"
}

export interface AuditionTape {
  id: string;
  auditionEventId: string; // Reference to the audition event
  screenplayId: string; // Reference to the screenplay/project
  roleId: string; // Which role they're auditioning for
  submitterId: string; // User ID of person submitting
  submitterName: string;
  submitterEmail?: string;
  tapeUrl: string; // Link to audition video
  notes?: string; // Actor's notes about their submission
  submittedAt: string; // ISO string
  
  // Review status
  status: 'submitted' | 'reviewed' | 'shortlisted' | 'accepted' | 'rejected';
  reviewNotes?: string; // Project owner's notes
  reviewedAt?: string; // When it was reviewed
  reviewedBy?: string; // User ID of reviewer
}

export interface Project {
  id: string;
  title: string;
  description: string;
  screenplayId: string; // Reference to the main screenplay
  creatorId: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  
  // Project status and phase
  status: 'development' | 'pre-production' | 'production' | 'post-production' | 'completed' | 'on-hold';
  phase: 'script-development' | 'casting' | 'crew-assembly' | 'pre-production' | 'filming' | 'post-production' | 'distribution';
  
  // Project details
  genre?: string;
  estimatedBudget?: string;
  targetCompletionDate?: string;
  location?: string;
  
  // Team and collaboration
  teamMembers?: ProjectMember[];
  auditions?: string[]; // Array of audition event IDs
  
  // Visibility and permissions
  visibility?: 'private' | 'public' | 'team-only';
  deleted?: boolean;
  paused?: boolean;
}

export interface ProjectMember {
  userId: string;
  userName: string;
  role: string; // e.g., "Director", "Producer", "Cinematographer"
  permissions: ProjectPermissions;
  joinedAt: string;
}

export interface ProjectPermissions {
  canEditProject: boolean;
  canManageTeam: boolean;
  canCreateAuditions: boolean;
  canReviewTapes: boolean;
  canEditScript: boolean;
  canViewAnalytics: boolean;
}

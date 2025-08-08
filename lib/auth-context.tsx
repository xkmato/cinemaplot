'use client';

import { logEvent } from "firebase/analytics";
import {
    User as FirebaseUser,
    GoogleAuthProvider,
    isSignInWithEmailLink,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    signInWithEmailLink,
    signInWithPopup,
    signOut
} from "firebase/auth";
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { analytics, appId, auth, db, isFirebaseConfigured, storage } from "./firebase";
import { Comment, Event, Movie, Review, Screenplay, ScreenplayComment, ScreenplayHighlight, ScreenplayPermissions, User } from "./types";

interface AuthMessage {
    type: 'success' | 'error';
    text: string;
}

interface AppContextType {
    user: User | null;
    events: Event[];
    movies: Movie[];
    screenplays: Screenplay[];
    reviews: Review[];
    comments: Comment[];
    screenplayComments: ScreenplayComment[];
    isLoading: boolean;
    isAuthReady: boolean;
    needsNameToProceed: boolean;
    authMessage: AuthMessage | null;
    isAwaitingMagicLink: boolean;
    email: string;
    setEmail: (email: string) => void;
    handleLogout: () => void;
    handleGoogleSignIn: () => Promise<void>;
    handleEmailLinkSignIn: (e: React.FormEvent) => Promise<void>;
    handleNameSubmit: (name: string) => Promise<void>;
    createEvent: (eventData: Partial<Event>, imageFile?: File | null) => Promise<void>;
    updateEvent: (eventId: string, updates: Partial<Event>) => Promise<void>;
    createMovie: (movieData: Partial<Movie>, imageFile?: File | null) => Promise<void>;
    createScreenplay: (screenplayData: Partial<Screenplay>, pdfFile: File) => Promise<void>;
    followEvent: (eventId: string) => Promise<void>;
    unfollowEvent: (eventId: string) => Promise<void>;
    isFollowingEvent: (eventId: string) => boolean;
    submitReview: (movieId: string, rating: number, comment?: string) => Promise<void>;
    getMovieReviews: (movieId: string) => Review[];
    getUserReviewForMovie: (movieId: string) => Review | null;
    submitComment: (eventId: string, content: string) => Promise<void>;
    getEventComments: (eventId: string) => Comment[];
    submitScreenplayComment: (screenplayId: string, content: string, pageNumber?: number, lineNumber?: number, selectedText?: string, parentId?: string) => Promise<void>;
    addScreenplayComment: (screenplayId: string, comment: ScreenplayComment) => Promise<void>;
    addScreenplayHighlight: (screenplayId: string, highlight: ScreenplayHighlight) => Promise<void>;
    retryScreenplayProcessing: (screenplayId: string) => Promise<void>;
    getScreenplayComments: (screenplayId: string) => ScreenplayComment[];
    // Privacy and collaboration functions
    updateScreenplayPrivacy: (screenplayId: string, visibility: 'private' | 'public' | 'collaborators') => Promise<void>;
    inviteCollaborator: (screenplayId: string, email: string, permissions: ScreenplayPermissions, message?: string) => Promise<void>;
    removeCollaborator: (screenplayId: string, userId: string) => Promise<void>;
    updateCollaboratorPermissions: (screenplayId: string, userId: string, permissions: ScreenplayPermissions) => Promise<void>;
    hasScreenplayAccess: (screenplay: Screenplay) => boolean;
    getScreenplayPermissions: (screenplay: Screenplay) => ScreenplayPermissions | null;
    refreshUserProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [needsNameToProceed, setNeedsNameToProceed] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [movies, setMovies] = useState<Movie[]>([]);
    const [screenplays, setScreenplays] = useState<Screenplay[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [screenplayComments, setScreenplayComments] = useState<ScreenplayComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [authMessage, setAuthMessage] = useState<AuthMessage | null>(null);
    const [isAwaitingMagicLink, setIsAwaitingMagicLink] = useState(false);

    // Auth handlers
    const handleLogout = () => {
        if (!auth) return;
        signOut(auth);
    };

    const handleGoogleSignIn = async () => {
        if (!isFirebaseConfigured()) {
            setAuthMessage({
                type: "error",
                text: "Firebase not configured. Please add your Firebase configuration to .env.local file.",
            });
            return;
        }

        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "login", { method: "Google" });
                }
            });
            setAuthMessage(null);
        } catch (error) {
            console.error(error);
            setAuthMessage({
                type: "error",
                text: "Google Sign-In failed. Please try again.",
            });
        }
    };

    const handleEmailLinkSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFirebaseConfigured()) {
            setAuthMessage({
                type: "error",
                text: "Firebase not configured. Please add your Firebase configuration to .env.local file.",
            });
            return;
        }

        const actionCodeSettings = {
            url: window.location.href,
            handleCodeInApp: true,
        };
        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            window.localStorage.setItem("emailForSignIn", email);
            setIsAwaitingMagicLink(true);
            setAuthMessage({
                type: "success",
                text: `Sign-in link sent to ${email}!`,
            });
        } catch (error) {
            console.error(error);
            setAuthMessage({
                type: "error",
                text: "Could not send link. Please check the email and try again.",
            });
        }
    };

    const handleNameSubmit = async (name: string) => {
        if (!user || !user.uid) return;
        const userDocRef = doc(
            db,
            `artifacts/${appId}/public/data/users`,
            user.uid
        );
        try {
            await setDoc(
                userDocRef,
                { displayName: name, email: user.email },
                { merge: true }
            );
            // Manually update user object in state for immediate UI feedback
            setUser((currentUser) => currentUser ? { ...currentUser, displayName: name } : null);
            setNeedsNameToProceed(false);
        } catch (error) {
            console.error("Failed to save user name:", error);
        }
    };

    const createEvent = async (eventData: Partial<Event>, imageFile?: File | null) => {
        if (!user) throw new Error('User must be authenticated to create events');

        let imageUrl = "";
        if (imageFile) {
            const imageRef = ref(
                storage,
                `event-images/${appId}/${imageFile.name}-${Date.now()}`
            );
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        // Get user's timezone
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Create a proper ISO datetime string with timezone
        const eventDateTime = new Date(`${eventData.date}T${eventData.time || "00:00"}`);

        // Calculate end date for multi-day events
        const endDate = new Date(eventData.date!);
        if (eventData.isMultiDay && eventData.numberOfDays && eventData.numberOfDays > 1) {
            endDate.setDate(endDate.getDate() + eventData.numberOfDays - 1);
        }

        const completeEventData = {
            ...eventData,
            imageUrl,
            creatorId: user.uid,
            creatorName: user.displayName || 'Unknown',
            createdAt: new Date().toISOString(),
            timezone: userTimezone,
            dateTime: eventDateTime.toISOString(),
            isMultiDay: eventData.isMultiDay && eventData.numberOfDays && eventData.numberOfDays > 1,
            numberOfDays: eventData.isMultiDay ? eventData.numberOfDays : 1,
            endDate: endDate.toISOString().slice(0, 10), // Store as YYYY-MM-DD
        };

        await addDoc(
            collection(db, `artifacts/${appId}/public/data/events`),
            completeEventData
        );

        // Success
        if (analytics) {
            // Track event creation
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "create_event", {
                        location: eventData.location || "unknown",
                    });
                }
            });
        }
    };

    const updateEvent = async (eventId: string, updates: Partial<Event>) => {
        if (!user) throw new Error('User must be authenticated to update events');

        // Get reference to the event document
        const eventDocRef = doc(db, `artifacts/${appId}/public/data/events`, eventId);

        // First check if the event exists and user has permission to update it
        const eventDoc = await getDoc(eventDocRef);
        if (!eventDoc.exists()) {
            throw new Error('Event not found');
        }

        const eventData = eventDoc.data() as Event;
        if (eventData.creatorId !== user.uid) {
            throw new Error('You do not have permission to update this event');
        }

        // Filter out undefined values to avoid Firebase errors
        const cleanUpdates = Object.fromEntries(
            Object.entries(updates).filter(([, value]) => value !== undefined)
        );

        // Update the event with the provided updates
        await updateDoc(eventDocRef, {
            ...cleanUpdates,
            updatedAt: new Date().toISOString()
        });

        // Update local state
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId
                    ? { ...event, ...cleanUpdates, updatedAt: new Date().toISOString() }
                    : event
            )
        );
    };

    const createMovie = async (movieData: Partial<Movie>, imageFile?: File | null) => {
        if (!user) throw new Error('User must be authenticated to create movies');

        let imageUrl = "";
        if (imageFile) {
            const imageRef = ref(
                storage,
                `movie-images/${appId}/${imageFile.name}-${Date.now()}`
            );
            const snapshot = await uploadBytes(imageRef, imageFile);
            imageUrl = await getDownloadURL(snapshot.ref);
        }

        const completeMovieData = {
            ...movieData,
            imageUrl,
            creatorId: user.uid,
            creatorName: user.displayName || 'Unknown',
            createdAt: new Date().toISOString(),
        };

        await addDoc(
            collection(db, `artifacts/${appId}/public/data/movies`),
            completeMovieData
        );

        // Success
        if (analytics) {
            // Track movie creation
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "create_movie", {
                        category: movieData.category || "unknown",
                    });
                }
            });
        }
    };

    const createScreenplay = async (screenplayData: Partial<Screenplay>, pdfFile: File) => {
        if (!user) throw new Error('User must be authenticated to create screenplays');

        // Validate file type and size
        if (pdfFile.type !== 'text/plain' && !pdfFile.name.toLowerCase().endsWith('.fountain')) {
            throw new Error('Only Fountain (.fountain) files are allowed for screenplays');
        }

        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        if (pdfFile.size > maxSizeInBytes) {
            throw new Error('File size must be less than 10MB');
        }

        // Upload PDF file to Firebase Storage
        const fountainRef = ref(
            storage,
            `screenplay-fountain/${appId}/${pdfFile.name}-${Date.now()}.fountain`
        );
        const snapshot = await uploadBytes(fountainRef, pdfFile);
        const fileUrl = await getDownloadURL(snapshot.ref);

        // Create initial screenplay document with processing status and privacy settings
        const completeScreenplayData = {
            ...screenplayData,
            fileUrl,
            fileName: pdfFile.name,
            fileSize: pdfFile.size,
            authorId: user.uid,
            creatorName: user.displayName || 'Unknown',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            viewCount: 0,
            totalComments: 0,
            isProcessed: false,
            processingStatus: 'pending' as const,
            processingAttempts: 0,
            maxRetryAttempts: 3,
            processingProgress: 0,
            // Privacy settings - private by default
            isPublic: false,
            visibility: 'private' as const,
            collaborators: [],
            collaboratorEmails: [],
            invitedCollaborators: [],
            permissions: {
                canRead: true,
                canComment: true,
                canHighlight: true,
                canDownload: false,
                canInvite: false
            }
        };

        const docRef = await addDoc(
            collection(db, `artifacts/${appId}/public/data/screenplays`),
            completeScreenplayData
        );

        // Process Fountain in the background
        processScreenplayFountainAsync(docRef.id, fileUrl);

        // Success
        if (analytics) {
            // Track screenplay creation
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "create_screenplay", {
                        genre: screenplayData.genre || "unknown",
                        // Page count will be determined during processing
                    });
                }
            });
        }
    };

    // Add screenplay comment
    const addScreenplayComment = async (screenplayId: string, comment: ScreenplayComment) => {
        if (!user) return;

        try {
            const commentsRef = collection(db, `artifacts/${appId}/public/data/screenplays/${screenplayId}/comments`);
            await addDoc(commentsRef, {
                ...comment,
                id: Date.now().toString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding screenplay comment:', error);
            throw error;
        }
    };

    // Add screenplay highlight
    const addScreenplayHighlight = async (screenplayId: string, highlight: ScreenplayHighlight) => {
        if (!user) return;

        try {
            const highlightsRef = collection(db, `artifacts/${appId}/public/data/screenplays/${screenplayId}/highlights`);
            await addDoc(highlightsRef, {
                ...highlight,
                id: Date.now().toString(),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error adding screenplay highlight:', error);
            throw error;
        }
    };

    // Background Fountain processing function - calls server API
    const processScreenplayFountainAsync = async (screenplayId: string, fileUrl: string) => {
        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);

        try {
            // Update status to processing
            await updateDoc(screenplayDocRef, {
                processingStatus: 'processing',
                processingProgress: 10
            });

            // Update progress to downloading
            await updateDoc(screenplayDocRef, {
                processingProgress: 30
            });

            const response = await fetch('/api/screenplays/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    screenplayId,
                    fileUrl,
                    appId
                })
            });

            // Update progress to processing
            await updateDoc(screenplayDocRef, {
                processingProgress: 70
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Update status to failed
                await updateDoc(screenplayDocRef, {
                    processingStatus: 'failed',
                    processingError: errorData.details || errorData.error || 'Failed to process screenplay'
                });
                throw new Error(errorData.error || 'Failed to process screenplay');
            }

            const result = await response.json();

            // Update progress to completion and save processed content
            await updateDoc(screenplayDocRef, {
                content: result.content,
                isProcessed: true,
                processingStatus: 'completed',
                processingProgress: 100,
                pageCount: result.pageCount,
                processedAt: new Date().toISOString()
            });

            console.log(`Screenplay ${screenplayId} processing completed:`, result.message);
        } catch (error) {
            console.error(`Error processing screenplay ${screenplayId}:`, error);

            // Update status to failed if not already done
            try {
                await updateDoc(screenplayDocRef, {
                    processingStatus: 'failed',
                    processingError: error instanceof Error ? error.message : 'Unknown error'
                });
            } catch (updateError) {
                console.error('Failed to update error status:', updateError);
            }
        }
    };

    // Retry screenplay processing
    const retryScreenplayProcessing = async (screenplayId: string) => {
        if (!user) return;

        try {
            // Get current screenplay data
            const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
            const screenplayDoc = await getDoc(screenplayDocRef);

            if (!screenplayDoc.exists()) {
                throw new Error('Screenplay not found');
            }

            const screenplayData = screenplayDoc.data() as Screenplay;
            const currentAttempts = screenplayData.processingAttempts || 0;
            const maxAttempts = screenplayData.maxRetryAttempts || 3;

            if (currentAttempts >= maxAttempts) {
                throw new Error('Maximum retry attempts reached');
            }

            // Update retry count and status
            await updateDoc(screenplayDocRef, {
                processingAttempts: currentAttempts + 1,
                processingStatus: 'processing',
                processingError: null,
                processingProgress: 0
            });

            // Retry processing
            await processScreenplayFountainAsync(screenplayId, screenplayData.fileUrl);

        } catch (error) {
            console.error('Error retrying screenplay processing:', error);
            throw error;
        }
    };

    const followEvent = async (eventId: string) => {
        if (!user) throw new Error('User must be authenticated to follow events');

        const eventDocRef = doc(db, `artifacts/${appId}/public/data/events`, eventId);
        await updateDoc(eventDocRef, {
            followers: arrayUnion(user.uid)
        });

        // Track event follow
        if (analytics) {
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "follow_event", {
                        event_id: eventId,
                    });
                }
            });
        }
    };

    const unfollowEvent = async (eventId: string) => {
        if (!user) throw new Error('User must be authenticated to unfollow events');

        const eventDocRef = doc(db, `artifacts/${appId}/public/data/events`, eventId);
        await updateDoc(eventDocRef, {
            followers: arrayRemove(user.uid)
        });

        // Track event unfollow
        if (analytics) {
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "unfollow_event", {
                        event_id: eventId,
                    });
                }
            });
        }
    };

    const isFollowingEvent = (eventId: string): boolean => {
        if (!user) return false;
        const event = events.find(e => e.id === eventId);
        return event?.followers?.includes(user.uid) || false;
    };

    const submitReview = async (movieId: string, rating: number, comment?: string) => {
        if (!user) throw new Error('User must be authenticated to submit reviews');

        // Check if user already has a review for this movie
        const existingReview = reviews.find(r => r.movieId === movieId && r.userId === user.uid);

        const reviewData = {
            movieId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: '', // TODO: Add user avatar support
            rating,
            comment: comment || '',
            createdAt: new Date().toISOString(),
        };

        if (existingReview) {
            // Update existing review
            const reviewDocRef = doc(db, `artifacts/${appId}/public/data/reviews`, existingReview.id);
            await updateDoc(reviewDocRef, reviewData);
        } else {
            // Create new review
            await addDoc(
                collection(db, `artifacts/${appId}/public/data/reviews`),
                reviewData
            );
        }

        // Track review submission
        if (analytics) {
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "submit_review", {
                        movie_id: movieId,
                        rating: rating,
                    });
                }
            });
        }
    };

    const getMovieReviews = (movieId: string): Review[] => {
        return reviews.filter(review => review.movieId === movieId);
    };

    const getUserReviewForMovie = (movieId: string): Review | null => {
        if (!user) return null;
        return reviews.find(review => review.movieId === movieId && review.userId === user.uid) || null;
    };

    const submitComment = async (eventId: string, content: string) => {
        if (!user) throw new Error('User must be authenticated to submit comments');

        const commentData = {
            eventId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: '', // TODO: Add user avatar support
            content,
            createdAt: new Date().toISOString(),
        };

        await addDoc(
            collection(db, `artifacts/${appId}/public/data/comments`),
            commentData
        );

        // Track comment submission
        if (analytics) {
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "submit_comment", {
                        event_id: eventId,
                    });
                }
            });
        }
    };

    const getEventComments = (eventId: string): Comment[] => {
        return comments.filter(comment => comment.eventId === eventId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const submitScreenplayComment = async (
        screenplayId: string,
        content: string,
        pageNumber?: number,
        lineNumber?: number,
        selectedText?: string,
        parentId?: string
    ) => {
        if (!user) throw new Error('User must be authenticated to submit screenplay comments');

        const commentData = {
            screenplayId,
            userId: user.uid,
            userName: user.displayName || 'Anonymous',
            userAvatar: '', // TODO: Add user avatar support
            content,
            createdAt: new Date().toISOString(),
            ...(pageNumber && { pageNumber }),
            ...(lineNumber && { lineNumber }),
            ...(selectedText && { selectedText }),
            ...(parentId && { parentId }),
            isGeneral: !pageNumber && !lineNumber && !selectedText,
        };

        await addDoc(
            collection(db, `artifacts/${appId}/public/data/screenplayComments`),
            commentData
        );

        // Update screenplay comment count
        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
        const screenplay = screenplays.find(s => s.id === screenplayId);
        if (screenplay) {
            await updateDoc(screenplayDocRef, {
                totalComments: (screenplay.totalComments || 0) + 1
            });
        }

        // Track screenplay comment submission
        if (analytics) {
            analytics.then(analyticsInstance => {
                if (analyticsInstance) {
                    logEvent(analyticsInstance, "submit_screenplay_comment", {
                        screenplay_id: screenplayId,
                        has_page_reference: !!pageNumber,
                        is_reply: !!parentId,
                    });
                }
            });
        }
    };

    const getScreenplayComments = (screenplayId: string): ScreenplayComment[] => {
        return screenplayComments.filter(comment => comment.screenplayId === screenplayId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    // Privacy and collaboration functions
    const updateScreenplayPrivacy = async (screenplayId: string, visibility: 'private' | 'public' | 'collaborators') => {
        if (!user) throw new Error('User must be authenticated to update screenplay privacy');

        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
        const screenplay = screenplays.find(s => s.id === screenplayId);

        if (!screenplay || screenplay.authorId !== user.uid) {
            throw new Error('You do not have permission to modify this screenplay');
        }

        await updateDoc(screenplayDocRef, {
            visibility,
            isPublic: visibility === 'public',
            updatedAt: new Date().toISOString()
        });
    };

    const inviteCollaborator = async (screenplayId: string, email: string, permissions: ScreenplayPermissions, message?: string) => {
        if (!user) throw new Error('User must be authenticated to invite collaborators');

        const screenplay = screenplays.find(s => s.id === screenplayId);
        if (!screenplay || screenplay.authorId !== user.uid) {
            throw new Error('You do not have permission to invite collaborators to this screenplay');
        }

        // Check if email is already invited or already a collaborator
        if (screenplay.collaboratorEmails?.includes(email)) {
            throw new Error('This email has already been invited');
        }

        // Create invitation
        const invitation = {
            id: Date.now().toString(),
            screenplayId,
            invitedBy: user.uid,
            invitedByName: user.displayName || 'Unknown',
            invitedEmail: email,
            status: 'pending' as const,
            permissions,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 7 days
            message
        };

        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
        await updateDoc(screenplayDocRef, {
            collaboratorEmails: arrayUnion(email),
            invitedCollaborators: arrayUnion(invitation),
            updatedAt: new Date().toISOString()
        });

        // TODO: Send email notification to the invited user
        console.log(`Invitation sent to ${email} for screenplay ${screenplay.title}`);
    };

    const removeCollaborator = async (screenplayId: string, userId: string) => {
        if (!user) throw new Error('User must be authenticated to remove collaborators');

        const screenplay = screenplays.find(s => s.id === screenplayId);
        if (!screenplay || screenplay.authorId !== user.uid) {
            throw new Error('You do not have permission to modify collaborators for this screenplay');
        }

        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
        await updateDoc(screenplayDocRef, {
            collaborators: arrayRemove(userId),
            updatedAt: new Date().toISOString()
        });
    };

    const updateCollaboratorPermissions = async (screenplayId: string, userId: string, permissions: ScreenplayPermissions) => {
        if (!user) throw new Error('User must be authenticated to update permissions');

        const screenplay = screenplays.find(s => s.id === screenplayId);
        if (!screenplay || screenplay.authorId !== user.uid) {
            throw new Error('You do not have permission to modify permissions for this screenplay');
        }

        // TODO: Implement per-user permissions (would require a more complex data structure)
        // For now, this updates the default permissions for all collaborators
        const screenplayDocRef = doc(db, `artifacts/${appId}/public/data/screenplays`, screenplayId);
        await updateDoc(screenplayDocRef, {
            permissions,
            updatedAt: new Date().toISOString()
        });
    };

    const hasScreenplayAccess = (screenplay: Screenplay): boolean => {
        if (!user) return screenplay.isPublic || screenplay.visibility === 'public';

        // Owner always has access
        if (screenplay.authorId === user.uid) return true;

        // Public screenplays are accessible to everyone
        if (screenplay.isPublic || screenplay.visibility === 'public') return true;

        // Check if user is a collaborator
        if (screenplay.collaborators?.includes(user.uid)) return true;

        // Check if user was invited by email
        if (screenplay.collaboratorEmails?.includes(user.email || '')) return true;

        return false;
    };

    const getScreenplayPermissions = (screenplay: Screenplay): ScreenplayPermissions | null => {
        if (!user || !hasScreenplayAccess(screenplay)) return null;

        // Owner has full permissions
        if (screenplay.authorId === user.uid) {
            return {
                canRead: true,
                canComment: true,
                canHighlight: true,
                canDownload: true,
                canInvite: true,
                canEdit: true
            };
        }

        // Use the screenplay's default permissions for collaborators
        return screenplay.permissions || {
            canRead: true,
            canComment: true,
            canHighlight: true,
            canDownload: false,
            canInvite: false
        };
    };

    // Check for magic link on component mount
    useEffect(() => {
        const processMagicLink = async () => {
            if (isSignInWithEmailLink(auth, window.location.href)) {
                let storedEmail = window.localStorage.getItem("emailForSignIn");
                if (!storedEmail) {
                    storedEmail = window.prompt(
                        "Please provide your email for confirmation"
                    );
                }
                if (storedEmail) {
                    try {
                        await signInWithEmailLink(auth, storedEmail, window.location.href);
                        window.localStorage.removeItem("emailForSignIn");
                    } catch (error) {
                        console.error(error);
                        setAuthMessage({
                            type: "error",
                            text: "Failed to sign in with link. It may be expired or invalid.",
                        });
                    }
                }
            }
        };
        processMagicLink();
    }, []);

    // Handle auth state changes and check for user profile
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser: FirebaseUser | null) => {
            setIsLoading(true);
            if (currentUser) {
                try {
                    // Add timeout to prevent hanging on slow Firestore operations
                    const userDocRef = doc(
                        db,
                        `artifacts/${appId}/public/data/users`,
                        currentUser.uid
                    );

                    // Use Promise.race to add a timeout
                    const docSnap = await Promise.race([
                        getDoc(userDocRef),
                        new Promise<never>((_, reject) =>
                            setTimeout(() => reject(new Error('Timeout loading user profile')), 10000)
                        )
                    ]);

                    if (docSnap.exists()) {
                        // User profile exists, merge with auth data
                        const profileData = docSnap.data();
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: profileData?.displayName || currentUser.displayName,
                            username: profileData?.username || null
                        });
                        setNeedsNameToProceed(false);
                    } else {
                        // No profile. If they have a displayName (e.g., from Google), create one.
                        if (currentUser.displayName) {
                            try {
                                await Promise.race([
                                    setDoc(userDocRef, {
                                        displayName: currentUser.displayName,
                                        email: currentUser.email,
                                    }),
                                    new Promise<never>((_, reject) =>
                                        setTimeout(() => reject(new Error('Timeout creating user profile')), 10000)
                                    )
                                ]);
                                setUser({
                                    uid: currentUser.uid,
                                    email: currentUser.email,
                                    displayName: currentUser.displayName,
                                    username: null
                                });
                                setNeedsNameToProceed(false);
                            } catch (error) {
                                console.error('Error creating user profile:', error);
                                // Fallback to basic user data from auth
                                setUser({
                                    uid: currentUser.uid,
                                    email: currentUser.email,
                                    displayName: currentUser.displayName,
                                    username: null
                                });
                                setNeedsNameToProceed(false);
                            }
                        } else {
                            // New email link user without a name.
                            setUser({
                                uid: currentUser.uid,
                                email: currentUser.email,
                                displayName: null,
                                username: null
                            });
                            setNeedsNameToProceed(true);
                        }
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    // Fallback to basic user data from Firebase Auth
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: currentUser.displayName,
                        username: null
                    });
                    setNeedsNameToProceed(!currentUser.displayName);
                }
            } else {
                setUser(null);
                setNeedsNameToProceed(false);
            }
            setIsAuthReady(true);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch events from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/events`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const eventsData = querySnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Event))
                    .filter((event) => {
                        // Hide deleted events for everyone
                        if (event.deleted) return false;
                        // Hide paused events for everyone except the owner
                        if (event.paused && (!user || user.uid !== event.creatorId))
                            return false;
                        return true;
                    });
                setEvents(eventsData);
            },
            (error) => {
                console.error("Error fetching events:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady, user]);

    // Fetch movies from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/movies`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const moviesData = querySnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Movie))
                    .filter((movie) => {
                        // Hide deleted movies for everyone
                        if (movie.deleted) return false;
                        // Hide paused movies for everyone except the owner
                        if (movie.paused && (!user || user.uid !== movie.creatorId))
                            return false;
                        return true;
                    });
                setMovies(moviesData);
            },
            (error) => {
                console.error("Error fetching movies:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady, user]);

    // Fetch reviews from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/reviews`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const reviewsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Review));
                setReviews(reviewsData);
            },
            (error) => {
                console.error("Error fetching reviews:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady]);

    // Fetch comments from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/comments`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const commentsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Comment));
                setComments(commentsData);
            },
            (error) => {
                console.error("Error fetching comments:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady]);

    // Fetch screenplays from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/screenplays`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const screenplaysData = querySnapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Screenplay))
                    .filter((screenplay) => {
                        // Hide deleted screenplays for everyone
                        if (screenplay.deleted) return false;
                        // Hide paused screenplays for everyone except the owner
                        if (screenplay.paused && (!user || user.uid !== screenplay.authorId))
                            return false;

                        // Privacy filtering
                        if (!user) {
                            // For unauthenticated users, only show public screenplays
                            return screenplay.isPublic || screenplay.visibility === 'public';
                        }

                        // Owner can always see their own screenplays
                        if (screenplay.authorId === user.uid) return true;

                        // Public screenplays are visible to everyone
                        if (screenplay.isPublic || screenplay.visibility === 'public') return true;

                        // Check if user is a collaborator
                        if (screenplay.collaborators?.includes(user.uid)) return true;

                        // Check if user was invited by email
                        if (screenplay.collaboratorEmails?.includes(user.email || '')) return true;

                        // Default: hide private screenplays
                        return false;
                    });
                setScreenplays(screenplaysData);
            },
            (error) => {
                console.error("Error fetching screenplays:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady, user]);

    // Fetch screenplay comments from Firestore in real-time
    useEffect(() => {
        if (!isAuthReady) return;
        const q = query(collection(db, `artifacts/${appId}/public/data/screenplayComments`));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const screenplayCommentsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as ScreenplayComment));
                setScreenplayComments(screenplayCommentsData);
            },
            (error) => {
                console.error("Error fetching screenplay comments:", error);
            }
        );

        return () => unsubscribe();
    }, [isAuthReady]);

    // Update movie ratings based on reviews
    useEffect(() => {
        const updateMovieRatings = () => {
            setMovies(prevMovies => prevMovies.map(movie => {
                const movieReviews = reviews.filter(review => review.movieId === movie.id);
                const totalRatings = movieReviews.length;
                const averageRating = totalRatings > 0
                    ? movieReviews.reduce((sum, review) => sum + review.rating, 0) / totalRatings
                    : undefined;

                return {
                    ...movie,
                    averageRating,
                    totalRatings
                };
            }));
        };

        updateMovieRatings();
    }, [reviews]);

    // Function to refresh user profile data (useful when username changes)
    const refreshUserProfile = async () => {
        if (!user?.uid) return;

        try {
            const userDocRef = doc(db, `artifacts/${appId}/public/data/users`, user.uid);
            const docSnap = await Promise.race([
                getDoc(userDocRef),
                new Promise<never>((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout refreshing user profile')), 10000)
                )
            ]);

            if (docSnap.exists()) {
                const profileData = docSnap.data();
                setUser(prev => prev ? {
                    ...prev,
                    displayName: profileData?.displayName || prev.displayName,
                    username: profileData?.username || null
                } : null);
            }
        } catch (error) {
            console.error('Error refreshing user profile:', error);
        }
    };

    const contextValue: AppContextType = {
        user,
        events,
        movies,
        screenplays,
        reviews,
        comments,
        screenplayComments,
        isLoading,
        isAuthReady,
        needsNameToProceed,
        authMessage,
        isAwaitingMagicLink,
        email,
        setEmail,
        handleLogout,
        handleGoogleSignIn,
        handleEmailLinkSignIn,
        handleNameSubmit,
        createEvent,
        updateEvent,
        createMovie,
        createScreenplay,
        followEvent,
        unfollowEvent,
        isFollowingEvent,
        submitReview,
        getMovieReviews,
        getUserReviewForMovie,
        submitComment,
        getEventComments,
        submitScreenplayComment,
        getScreenplayComments,
        addScreenplayComment,
        addScreenplayHighlight,
        retryScreenplayProcessing,
        updateScreenplayPrivacy,
        inviteCollaborator,
        removeCollaborator,
        updateCollaboratorPermissions,
        hasScreenplayAccess,
        getScreenplayPermissions,
        refreshUserProfile,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

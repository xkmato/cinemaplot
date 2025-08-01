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
    setDoc,
    updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { analytics, appId, auth, db, isFirebaseConfigured, storage } from "./firebase";
import { Comment, Event, Movie, Review, User } from "./types";

interface AuthMessage {
    type: 'success' | 'error';
    text: string;
}

interface AppContextType {
    user: User | null;
    events: Event[];
    movies: Movie[];
    reviews: Review[];
    comments: Comment[];
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
    createMovie: (movieData: Partial<Movie>, imageFile?: File | null) => Promise<void>;
    followEvent: (eventId: string) => Promise<void>;
    unfollowEvent: (eventId: string) => Promise<void>;
    isFollowingEvent: (eventId: string) => boolean;
    submitReview: (movieId: string, rating: number, comment?: string) => Promise<void>;
    getMovieReviews: (movieId: string) => Review[];
    getUserReviewForMovie: (movieId: string) => Review | null;
    submitComment: (eventId: string, content: string) => Promise<void>;
    getEventComments: (eventId: string) => Comment[];
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
    const [reviews, setReviews] = useState<Review[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
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
                const userDocRef = doc(
                    db,
                    `artifacts/${appId}/public/data/users`,
                    currentUser.uid
                );
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    // User profile exists, merge with auth data
                    setUser({
                        uid: currentUser.uid,
                        email: currentUser.email,
                        displayName: docSnap.data()?.displayName || currentUser.displayName
                    });
                    setNeedsNameToProceed(false);
                } else {
                    // No profile. If they have a displayName (e.g., from Google), create one.
                    if (currentUser.displayName) {
                        await setDoc(userDocRef, {
                            displayName: currentUser.displayName,
                            email: currentUser.email,
                        });
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: currentUser.displayName
                        });
                        setNeedsNameToProceed(false);
                    } else {
                        // New email link user without a name.
                        setUser({
                            uid: currentUser.uid,
                            email: currentUser.email,
                            displayName: null
                        });
                        setNeedsNameToProceed(true);
                    }
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

    const contextValue: AppContextType = {
        user,
        events,
        movies,
        reviews,
        comments,
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
        createMovie,
        followEvent,
        unfollowEvent,
        isFollowingEvent,
        submitReview,
        getMovieReviews,
        getUserReviewForMovie,
        submitComment,
        getEventComments,
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

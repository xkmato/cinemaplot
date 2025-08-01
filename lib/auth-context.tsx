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
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    setDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { analytics, appId, auth, db, isFirebaseConfigured, storage } from "./firebase";
import { Event, User } from "./types";

interface AuthMessage {
    type: 'success' | 'error';
    text: string;
}

interface AppContextType {
    user: User | null;
    events: Event[];
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

    const contextValue: AppContextType = {
        user,
        events,
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
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

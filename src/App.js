import { logEvent } from "firebase/analytics";
import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  onAuthStateChanged,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
} from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AdminView from "./components/AdminView";
import AuthScreen from "./components/AuthScreen";
import CalendarView from "./components/CalendarView";
import EventPage from "./components/EventPage";
import Header from "./components/header";
import UserEvents from "./components/UserEvents";
import { analytics, appId, auth, db } from "./firebase";
import CreateEventModal from "./modals/CreateEvent";
import GetUserNameModal from "./modals/GetUserName";

export const AppContext = createContext();

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  // --- State ---
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [needsNameToProceed, setNeedsNameToProceed] = useState(false);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState("calendar"); // 'calendar', 'event'
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);

  // Auth flow state
  const [email, setEmail] = useState("");
  const [authMessage, setAuthMessage] = useState(null);
  const [isAwaitingMagicLink, setIsAwaitingMagicLink] = useState(false);

  // --- Auth Handlers ---
  const handleLogout = () => {
    signOut(auth);
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      logEvent(analytics, "login", { method: "Google" });
      setAuthMessage(null);
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      console.error(error);
      setAuthMessage({
        type: "error",
        text: "Google Sign-In failed. Please try again.",
      });
    }
  };

  const handleEmailLinkSignIn = async (e) => {
    e.preventDefault();
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
            const from = location.state?.from?.pathname || "/";
            navigate(from, { replace: true });
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

  // --- User Profile Handler ---
  const handleNameSubmit = async (name) => {
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
      setUser((currentUser) => ({ ...currentUser, displayName: name }));
      setNeedsNameToProceed(false);
    } catch (error) {
      console.error("Failed to save user name:", error);
      // Handle error in UI if necessary
    }
  };

  // --- Effects ---
  // Handle auth state changes and check for user profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
          setUser({ ...currentUser, ...docSnap.data() });
          setNeedsNameToProceed(false);
        } else {
          // No profile. If they have a displayName (e.g., from Google), create one.
          if (currentUser.displayName) {
            await setDoc(userDocRef, {
              displayName: currentUser.displayName,
              email: currentUser.email,
            });
            setUser(currentUser);
            setNeedsNameToProceed(false);
          } else {
            // New email link user without a name.
            setUser(currentUser);
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
          }))
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

  // Handle incoming URL for shared events
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("event");
    if (eventId) {
      setSelectedEventId(eventId);
      setPage("event");
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // --- Render Logic ---
  const contextValue = {
    user,
    events,
    page,
    setPage,
    selectedEventId,
    setSelectedEventId,
    showCreateEventModal,
    setShowCreateEventModal,
    handleLogout,
    handleGoogleSignIn,
    handleEmailLinkSignIn,
    email,
    setEmail,
    authMessage,
    isAwaitingMagicLink,
  };

  if (!isAuthReady) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center text-white text-xl">
        Loading Cinema Plot...
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="bg-gray-900 min-h-screen font-sans">
        {/* Always show header and routes, regardless of login */}
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<CalendarView />} />
            <Route path="/event/:eventId" element={<EventPage />} />
            <Route path="/day/:date" element={<CalendarView />} />
            <Route path="/week/:weekStart" element={<CalendarView />} />
            <Route path="/my-events" element={<UserEvents />} />
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/admin" element={<AdminView />} />
          </Routes>
        </main>
        {/* Only show create event modal if logged in */}
        {user && showCreateEventModal && <CreateEventModal />}
        {/* Show auth modal if not logged in and user tries to create event */}
        {!user && showCreateEventModal && <AuthScreen />}
        {/* Show name modal if needed */}
        {user && needsNameToProceed && (
          <GetUserNameModal onSubmit={handleNameSubmit} />
        )}
      </div>
    </AppContext.Provider>
  );
}

// Main App Component
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

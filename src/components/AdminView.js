import { doc, getDoc, setDoc } from "firebase/firestore";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import { appId, db } from "../firebase";

const AdminView = () => {
  const { events, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [flashMessage, setFlashMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all"); // "all", "upcoming", "past"

  const adminUserId = process.env.REACT_APP_ADMIN_USER_ID;
  const isAdmin = user && user.uid === adminUserId;

  const showFlash = (msg) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(""), 5000);
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${eventTitle}"?`
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(
        doc(db, `artifacts/${appId}/public/data/events`, eventId),
        { deleted: true },
        { merge: true }
      );
      showFlash(`Event "${eventTitle}" has been deleted.`);
    } catch (error) {
      console.error("Error deleting event:", error);
      showFlash("Failed to delete event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePause = async (eventId, eventTitle, isPaused) => {
    setIsLoading(true);
    try {
      await setDoc(
        doc(db, `artifacts/${appId}/public/data/events`, eventId),
        { paused: !isPaused },
        { merge: true }
      );

      // Refresh the event data
      const eventDocRef = doc(
        db,
        `artifacts/${appId}/public/data/events`,
        eventId
      );
      await getDoc(eventDocRef);

      const action = isPaused ? "relisted" : "delisted";
      showFlash(`Event "${eventTitle}" has been ${action}.`);
    } catch (error) {
      console.error("Error toggling event pause:", error);
      showFlash("Failed to update event status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Back to Calendar
        </button>
      </div>
    );
  }

  // Helper function to determine if an event is past
  const isEventPast = (event) => {
    const now = new Date();
    let eventDate;

    // Use dateTime if available, otherwise combine date and time
    if (event.dateTime) {
      eventDate = new Date(event.dateTime);
    } else {
      eventDate = new Date(`${event.date}T${event.time || "23:59"}`);
    }

    // For multi-day events, use the end date
    if (event.isMultiDay && event.endDate) {
      eventDate = new Date(`${event.endDate}T23:59`);
    }

    return eventDate < now;
  };

  // Filter and sort events
  const filteredEvents = [...events]
    .filter((event) => !event.deleted) // Don't show deleted events
    .filter((event) => {
      if (filter === "upcoming") return !isEventPast(event);
      if (filter === "past") return isEventPast(event);
      return true; // "all"
    })
    .sort((a, b) => {
      // Sort by date (newest first for past events, earliest first for upcoming)
      const dateA = new Date(a.dateTime || `${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(b.dateTime || `${b.date}T${b.time || "00:00"}`);

      if (filter === "past") {
        return dateB - dateA; // Newest first for past events
      } else {
        return dateA - dateB; // Earliest first for upcoming events
      }
    });

  // Count events by category
  const allEvents = events.filter((event) => !event.deleted);
  const upcomingCount = allEvents.filter((event) => !isEventPast(event)).length;
  const pastCount = allEvents.filter((event) => isEventPast(event)).length;

  return (
    <div className="container mx-auto p-4 sm:p-8">
      {flashMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {flashMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Back to Calendar
        </button>
      </div>

      <div className="bg-gray-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h2 className="text-xl font-bold text-white">Event Management</h2>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                filter === "all"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              All ({allEvents.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                filter === "upcoming"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-4 py-2 rounded-lg font-bold text-sm ${
                filter === "past"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-700 text-gray-200 hover:bg-gray-600"
              }`}
            >
              Past ({pastCount})
            </button>
          </div>
        </div>

        <div className="mb-4">
          <span className="text-gray-300">
            Showing {filteredEvents.length}{" "}
            {filter === "all" ? "total" : filter} events
          </span>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-gray-400 text-center py-8">
            No {filter === "all" ? "" : filter} events found.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const isPast = isEventPast(event);
              return (
                <div
                  key={event.id}
                  className={`bg-gray-900 rounded-lg p-4 border-2 ${
                    event.paused
                      ? "border-yellow-500"
                      : isPast
                      ? "border-gray-600"
                      : "border-gray-700"
                  } ${isPast ? "opacity-75" : ""}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {event.title}
                        </h3>
                        {event.paused && (
                          <span className="bg-yellow-600 text-white text-xs px-2 py-1 rounded">
                            DELISTED
                          </span>
                        )}
                        {isPast && (
                          <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">
                            PAST
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-1">
                        {event.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span>
                          📅 {new Date(event.date).toLocaleDateString()}
                          {event.time && ` at ${event.time}`}
                        </span>
                        {event.isMultiDay && event.endDate && (
                          <span>
                            📅 ends{" "}
                            {new Date(event.endDate).toLocaleDateString()}
                          </span>
                        )}
                        <span>📍 {event.location}</span>
                        <span>👤 {event.creatorName}</span>
                        {event.price && <span>💰 UGX {event.price}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
                      >
                        View Event
                      </button>
                      {!isPast && (
                        <button
                          onClick={() =>
                            handleTogglePause(
                              event.id,
                              event.title,
                              event.paused
                            )
                          }
                          disabled={isLoading}
                          className={`${
                            event.paused
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-yellow-600 hover:bg-yellow-700"
                          } text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50`}
                        >
                          {event.paused ? "Relist" : "Delist"}
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminView;

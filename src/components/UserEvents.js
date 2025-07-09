import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../App";
import EventItem from "./EventItem";

const UserEvents = () => {
  const { user, events, deleteEvent } = useContext(AppContext);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("date"); // "date" or "title"
  const [filterBy, setFilterBy] = useState("all"); // "all", "upcoming", "past"

  // Filter events created by the current user
  const userEvents = events.filter((event) => event.creatorId === user?.uid);

  // Apply filters
  const filteredEvents = userEvents.filter((event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (filterBy) {
      case "upcoming":
        return eventDate >= today;
      case "past":
        return eventDate < today;
      default:
        return true;
    }
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
      return dateA - dateB;
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteEvent(eventId);
      } catch (error) {
        console.error("Error deleting event:", error);
        alert("Failed to delete event. Please try again.");
      }
    }
  };

  const handleEditEvent = (eventId) => {
    navigate(`/event/${eventId}/edit`);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Please log in to view your events
        </h1>
        <button
          onClick={() => navigate("/login")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Events by {user.displayName || "User"} ({user.email})
        </h1>
        <p className="text-gray-400">
          Manage the events you've created ({userEvents.length} total)
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-white font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500"
          >
            <option value="date">Date</option>
            <option value="title">Title</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-white font-medium">Filter:</label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:border-indigo-500"
          >
            <option value="all">All Events</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past Events</option>
          </select>
        </div>

        <button
          onClick={() => navigate("/")}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          ← Back to Calendar
        </button>
      </div>

      {/* Events List */}
      {sortedEvents.length > 0 ? (
        <div className="space-y-4">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-800 rounded-xl p-6 border-2 border-gray-700 hover:border-indigo-500 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <EventItem
                    event={event}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/event/${event.id}`)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {filterBy === "all" ? (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  No events created yet
                </h3>
                <p>Start by creating your first event!</p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold mb-2">
                  No {filterBy} events found
                </h3>
                <p>Try changing the filter or create a new event.</p>
              </>
            )}
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Create Your First Event
          </button>
        </div>
      )}
    </div>
  );
};

export default UserEvents;

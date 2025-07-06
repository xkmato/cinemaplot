import { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../App";
import { addDays, getWeekStartDate, isSameDay } from "../Helpers";
import EventItem from "./EventItem";

// Calendar View Component
const CalendarView = () => {
  const { events } = useContext(AppContext);
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const dateInputRef = useRef();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to parse date from param
  const parseDate = (str) => {
    const d = new Date(str);
    return isNaN(d) ? new Date() : d;
  };

  // Determine initial view mode and date from URL
  const [viewMode, setViewMode] = useState(() => {
    if (location.pathname.startsWith("/day/")) return "day";
    if (location.pathname.startsWith("/week/")) return "week";
    // Default: day on mobile, week on desktop
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 640px)").matches
    ) {
      return "day";
    }
    return "week";
  });

  const [selectedDay, setSelectedDay] = useState(() =>
    params.date ? parseDate(params.date) : new Date()
  );
  const [weekStart, setWeekStart] = useState(() =>
    params.weekStart
      ? parseDate(params.weekStart)
      : getWeekStartDate(new Date())
  );

  // Sync state with URL params
  useEffect(() => {
    if (params.date) {
      setViewMode("day");
      setSelectedDay(parseDate(params.date));
    } else if (params.weekStart) {
      setViewMode("week");
      setWeekStart(parseDate(params.weekStart));
    }
  }, [params.date, params.weekStart]);

  // When viewMode or date/week changes, update URL
  useEffect(() => {
    if (viewMode === "day") {
      navigate(`/day/${selectedDay.toISOString().slice(0, 10)}`, {
        replace: true,
      });
    } else if (viewMode === "week") {
      navigate(`/week/${weekStart.toISOString().slice(0, 10)}`, {
        replace: true,
      });
    }
    // eslint-disable-next-line
  }, [viewMode, selectedDay, weekStart]);

  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  // Update changeWeek and setSelectedDay to update state only
  const changeWeek = (amount) => {
    setWeekStart(addDays(weekStart, amount * 7));
  };

  // Sort events by date and time
  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
    const dateB = new Date(`${b.date}T${b.time || "00:00"}`);
    return dateA - dateB;
  });

  // Helper function to check if an event spans multiple days and includes a specific date
  const eventIncludesDate = (event, targetDate) => {
    const eventStartDate = new Date(event.date);
    const targetDateObj = new Date(targetDate);

    // For single day events, use existing logic
    if (!event.isMultiDay) {
      return isSameDay(eventStartDate, targetDateObj);
    }

    // For multi-day events, check if target date is within the range
    const eventEndDate = new Date(event.endDate);
    return targetDateObj >= eventStartDate && targetDateObj <= eventEndDate;
  };

  // Events for the selected day (updated to handle multi-day events)
  const dayEvents = sortedEvents.filter((event) =>
    eventIncludesDate(event, selectedDay)
  );

  // Add a share button for current view
  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  // Handler for date picking
  const handleDatePick = (e) => {
    const picked = e.target.value;
    if (picked) {
      const pickedDate = new Date(picked);
      setSelectedDay(pickedDate);
      setViewMode("day");
    }
  };

  return (
    <div className="container mx-auto p-0 sm:p-4 sm:p-6">
      <input
        ref={dateInputRef}
        type="date"
        className="hidden"
        onChange={handleDatePick}
      />
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="hidden sm:flex flex-col sm:flex-row gap-0 sm:gap-4">
          <button
            onClick={() => setViewMode("week")}
            className={`px-4 py-2 rounded-lg font-bold ${
              viewMode === "week"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            Week View
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={`px-4 py-2 rounded-lg font-bold ${
              viewMode === "day"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            Day View
          </button>
          <button
            onClick={handleShare}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg ml-2"
          >
            Share This {viewMode === "day" ? "Day" : "Week"}
          </button>
        </div>
        {/* Mobile menu button */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center"
            aria-label="Open menu"
          >
            {/* Hamburger icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 7h14M5 12h14M5 17h14"
              />
            </svg>
          </button>
          {mobileMenuOpen && (
            <div className="absolute left-0 right-auto mt-2 w-40 bg-gray-800 rounded-lg shadow-lg z-10 flex flex-col">
              <button
                onClick={() => {
                  setViewMode("week");
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-gray-700 rounded-t-lg text-white"
              >
                Week View
              </button>
              <button
                onClick={() => {
                  setViewMode("day");
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-gray-700 text-white"
              >
                Day View
              </button>
              <button
                onClick={() => {
                  handleShare();
                  setMobileMenuOpen(false);
                }}
                className="px-4 py-2 text-left hover:bg-gray-700 rounded-b-lg text-white"
              >
                Share This {viewMode === "day" ? "Day" : "Week"}
              </button>
            </div>
          )}
        </div>
        {/* You may want to move week navigation buttons out of the flex group for better mobile layout */}
        {viewMode === "week" && (
          <>
            <button
              onClick={() => changeWeek(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              &lt; Prev Week
            </button>
            <h2
              className="text-xl sm:text-2xl font-bold text-white text-center underline cursor-pointer"
              title="Pick a date"
              onClick={() => {
                if (dateInputRef.current.showPicker) {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.click();
                }
              }}
            >
              {weekStart.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </h2>
            <button
              onClick={() => changeWeek(1)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Next Week &gt;
            </button>
          </>
        )}
        {viewMode === "day" && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedDay(addDays(selectedDay, -1))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              &lt;
            </button>
            <span
              className="text-white font-bold underline cursor-pointer"
              title="Pick a date"
              onClick={() => {
                if (dateInputRef.current.showPicker) {
                  dateInputRef.current.showPicker();
                } else {
                  dateInputRef.current.click();
                }
              }}
            >
              {selectedDay.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <button
              onClick={() => setSelectedDay(addDays(selectedDay, 1))}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
      {viewMode === "week" ? (
        <div className="space-y-4 mt-4">
          {/* Current day as first card, alone */}
          {(() => {
            const today = new Date();
            const todayIdx = days.findIndex((d) => isSameDay(d, today));
            const firstDay = todayIdx !== -1 ? days[todayIdx] : days[0];
            const restDays = days.filter((d) => !isSameDay(d, firstDay)); // Show all other 6 days

            // Helper to filter events: only first 3, and not more than 1 hour past
            const filterEvents = (day) => {
              const now = new Date();
              return sortedEvents
                .filter((event) => eventIncludesDate(event, day))
                .filter((event) => {
                  if (!event.time) return true;
                  // For multi-day events, only filter by time on the start date
                  if (
                    event.isMultiDay &&
                    !isSameDay(new Date(event.date), day)
                  ) {
                    return true; // Show multi-day events on all days they span
                  }
                  const eventDate = new Date(`${event.date}T${event.time}`);
                  return eventDate.getTime() + 60 * 60 * 1000 > now.getTime();
                })
                .slice(0, 3);
            };

            return (
              <>
                {/* First card: current day */}
                <div className="grid grid-cols-1">
                  <div
                    key={firstDay.toISOString()}
                    className={`bg-gray-800 rounded-xl p-4 border-2 ${
                      isSameDay(firstDay, today)
                        ? "border-indigo-500"
                        : "border-gray-700"
                    }`}
                    onClick={() => {
                      setSelectedDay(firstDay);
                      setViewMode("day");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <h3
                      className={`font-bold text-center ${
                        isSameDay(firstDay, today)
                          ? "text-indigo-400"
                          : "text-white"
                      }`}
                    >
                      {firstDay.toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                    </h3>
                    <p className="text-center text-2xl font-light text-gray-300 mb-4">
                      {firstDay.getDate()}
                    </p>
                    <div className="space-y-2">
                      {filterEvents(firstDay).length > 0 ? (
                        filterEvents(firstDay).map((event) => (
                          <EventItem
                            key={event.id}
                            event={event}
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card click
                              navigate(`/event/${event.id}`);
                            }}
                          />
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center pt-4">
                          No events.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {/* Next 6 days: 2 cards per row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {restDays.map((day) => (
                    <div
                      key={day.toISOString()}
                      className={`bg-gray-800 rounded-xl p-4 border-2 ${
                        isSameDay(day, today)
                          ? "border-indigo-500"
                          : "border-gray-700"
                      }`}
                      onClick={() => {
                        setSelectedDay(day);
                        setViewMode("day");
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <h3
                        className={`font-bold text-center ${
                          isSameDay(day, today)
                            ? "text-indigo-400"
                            : "text-white"
                        }`}
                      >
                        {day.toLocaleDateString(undefined, {
                          weekday: "short",
                        })}
                      </h3>
                      <p className="text-center text-2xl font-light text-gray-300 mb-4">
                        {day.getDate()}
                      </p>
                      <div className="space-y-2">
                        {filterEvents(day).length > 0 ? (
                          filterEvents(day).map((event) => (
                            <EventItem
                              key={event.id}
                              event={event}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/event/${event.id}`);
                              }}
                            />
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 text-center pt-4">
                            No events.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-6 mt-4">
          <h3 className="text-xl font-bold text-white mb-4">
            Events for{" "}
            {selectedDay.toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </h3>
          {dayEvents.length > 0 ? (
            <div className="space-y-4">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-gray-900 rounded-lg p-4 border-2 border-gray-700 hover:border-indigo-500 cursor-pointer"
                  onClick={() => navigate(`/event/${event.id}`)}
                >
                  <EventItem
                    event={event}
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/event/${event.id}`);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No events for this day.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;

import { format, toZonedTime } from "date-fns-tz";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../App";
import { appId, db } from "../firebase";

// Single Event Page Component
const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { events, user } = useContext(AppContext);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [flashMessage, setFlashMessage] = useState("");

  const isOwner = user && event && user.uid === event.creatorId;

  const shareUrl = `${window.location.origin}/event/${eventId}`;
  const shareText = encodeURIComponent(
    `Check out this event: ${event?.title || ""}`
  );

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  const handleAddNotification = () => {
    setNotifications([...notifications, { value: 15, unit: "minutes" }]);
  };

  const handleRemoveNotification = (idx) => {
    setNotifications(notifications.filter((_, i) => i !== idx));
  };

  const handleNotificationChange = (idx, field, value) => {
    const updated = [...notifications];
    if (!updated[idx]) {
      updated[idx] = { value: 15, unit: "minutes" };
    }
    if (field === "value") {
      updated[idx].value = Number(value);
    } else if (field === "unit") {
      updated[idx].unit = value;
    }
    setNotifications(updated);
  };

  const handleSaveNotifications = async () => {
    if (!user) {
      setShowNotifyModal(false);
      return;
    }
    try {
      await setDoc(
        doc(db, `users/${user.uid}/eventNotifications`, eventId),
        { notifications },
        { merge: true }
      );
      setShowNotifyModal(false);
      showFlash("Notifications saved!");
    } catch (err) {
      setError("Failed to save notifications.");
      console.error("Error saving notifications:", err);
    }
  };

  const showFlash = (msg) => {
    setFlashMessage(msg);
    setTimeout(() => setFlashMessage(""), 5000);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const contextEvent = events.find((e) => e.id === eventId);
        if (contextEvent) {
          setEvent(contextEvent);
        } else {
          const eventDocRef = doc(
            db,
            `artifacts/${appId}/public/data/events`,
            eventId
          );
          const docSnap = await getDoc(eventDocRef);
          if (docSnap.exists()) {
            setEvent({ id: docSnap.id, ...docSnap.data() });
          } else {
            setError("Event not found.");
          }
        }
      } catch (err) {
        console.error("Error fetching event:", err);
        setError("Could not load the event.");
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    } else {
      navigate("/");
    }
  }, [eventId, events, navigate]);

  // Load notifications for this user/event
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user && eventId) {
        try {
          const notifDoc = await getDoc(
            doc(db, `users/${user.uid}/eventNotifications`, eventId)
          );

          if (notifDoc.exists()) {
            setNotifications(notifDoc.data().notifications || []);
          }
        } catch (err) {
          console.error("Error loading notifications:", err);
        }
      }
    };
    fetchNotifications();
  }, [user, eventId]);

  const generateMetaTags = () => {
    if (!event) return null;

    return (
      <Helmet>
        <title>{`${event.title} - Cinema Plot`}</title>
        <meta name="description" content={event.description} />

        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="event" />
        <meta property="og:title" content={event.title} />
        <meta property="og:description" content={event.description} />
        {event.imageUrl && (
          <meta property="og:image" content={event.imageUrl} />
        )}
        <meta
          property="event:start_time"
          content={`${event.date}T${event.time || "00:00"}`}
        />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={event.title} />
        <meta name="twitter:description" content={event.description} />
        {event.imageUrl && (
          <meta name="twitter:image" content={event.imageUrl} />
        )}

        {/* Event-specific structured data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.description,
            startDate: `${event.date}T${event.time || "00:00"}`,
            location: {
              "@type": "Place",
              name: event.location,
            },
            image: event.imageUrl,
            organizer: {
              "@type": "Person",
              name: event.creatorName,
            },
            offers: {
              "@type": "Offer",
              price: event.price || "0",
              priceCurrency: "UGX",
            },
          })}
        </script>
      </Helmet>
    );
  };

  if (isLoading)
    return <div className="text-center text-white p-10">Loading event...</div>;
  if (error)
    return <div className="text-center text-red-400 p-10">{error}</div>;
  if (!event) return null;

  // Count events hosted by this creator
  const hostedCount = events.filter(
    (e) => e.creatorName === event.creatorName
  ).length;

  const eventTimezone = event.timezone || "Africa/Kampala"; // fallback if not set

  // Combine date and time, assume stored in UTC or as ISO string
  const eventDateTimeUTC = new Date(
    event.dateTime || `${event.date}T${event.time || "00:00"}Z`
  );

  // Convert to event's timezone
  const eventDateTimeLocal = toZonedTime(eventDateTimeUTC, eventTimezone);

  // Format for display
  const displayDate = format(eventDateTimeLocal, "PPP", {
    timeZone: eventTimezone,
  });
  const displayTime = format(eventDateTimeLocal, "p", {
    timeZone: eventTimezone,
  });

  // Format end date for multi-day events
  const displayEndDate = event.isMultiDay
    ? format(
        toZonedTime(new Date(event.endDate + "T00:00"), eventTimezone),
        "PPP",
        { timeZone: eventTimezone }
      )
    : null;

  // Format display date based on single or multi-day event
  const formatEventDate = () => {
    if (event.isMultiDay && event.numberOfDays > 1 && displayEndDate) {
      return `${displayDate} to ${displayEndDate}`;
    }
    return displayDate;
  };

  // Calculate how many notifications are still in the future
  const now = new Date();

  // Use the proper dateTime field with timezone consideration
  const eventDateTime = event.dateTime
    ? new Date(event.dateTime)
    : new Date(event.date + (event.time ? `T${event.time}` : "T00:00"));

  const futureNotifications = notifications.filter((notif) => {
    let notifyTime = new Date(eventDateTime);
    if (notif.unit === "minutes") {
      notifyTime.setMinutes(notifyTime.getMinutes() - notif.value);
    } else if (notif.unit === "hours") {
      notifyTime.setHours(notifyTime.getHours() - notif.value);
    } else if (notif.unit === "days") {
      notifyTime.setDate(notifyTime.getDate() - notif.value);
    }
    return notifyTime > now;
  }).length;

  return (
    <div className="container mx-auto p-4 sm:p-8 flex flex-col items-center">
      {generateMetaTags()}
      {flashMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {flashMessage}
        </div>
      )}
      <button
        onClick={() => navigate("/")}
        className="mb-6 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg self-start"
      >
        &larr; Back to Calendar
      </button>
      <div className="w-full flex flex-col items-center">
        {/* Event Image */}
        {event.imageUrl && (
          <div className="w-full flex justify-center">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="rounded-2xl shadow-xl object-cover w-full max-w-3xl h-56 sm:h-80 md:h-[350px] mb-6"
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>
        )}

        {/* Event Main Info */}
        <div className="w-full max-w-2xl flex flex-col items-center text-center">
          <span className="text-gray-300 text-base sm:text-lg mb-1">
            {formatEventDate()}
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-2">
            {event.title}
          </h1>
          <p className="text-lg text-indigo-400 mb-4">{event.description}</p>
        </div>

        {/* Organizer Card */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between bg-gray-700 rounded-xl px-6 py-4 mb-6 shadow">
          <div className="flex items-center space-x-3">
            {/* <img
              src={event.organizerAvatar || "/default-avatar.png"}
              alt={event.creatorName || "Organizer"}
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-400"
            /> */}
            <div className="text-left">
              <div className="font-semibold text-white">
                {event.creatorName || "A friend"}
              </div>
              <div className="text-gray-300 text-sm">
                {hostedCount} event{hostedCount !== 1 ? "s" : ""} hosted
              </div>
            </div>
          </div>
          {/* <button className="mt-4 sm:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg">
            Follow
          </button> */}
        </div>

        {/* Date, Time, Location (+ Online Link if present) */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-gray-300">
          <div className="flex flex-col items-center bg-gray-800 rounded-lg py-4">
            <svg
              className="w-6 h-6 text-indigo-400 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="font-semibold">Date</span>
            <span className="text-center">{formatEventDate()}</span>
          </div>
          <div className="flex flex-col items-center bg-gray-800 rounded-lg py-4">
            <svg
              className="w-6 h-6 text-indigo-400 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-semibold">Time</span>
            <span>{displayTime}</span>
          </div>
          <div className="flex flex-col items-center bg-gray-800 rounded-lg py-4">
            <svg
              className="w-6 h-6 text-indigo-400 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-semibold">Location</span>
            <span>{event.location}</span>
          </div>
          {/* Online Event Link, styled like a card, after Location */}
          {event.eventLink && (
            <div className="flex flex-col items-center bg-gray-800 rounded-lg py-4 col-span-1 sm:col-span-3">
              <svg
                className="w-6 h-6 text-indigo-400 mb-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 7l-10 10M7 7h10v10"
                />
              </svg>
              <span className="font-semibold">Online Event Link</span>
              <a
                href={event.eventLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 underline break-all mt-1"
                title={event.eventLink}
              >
                {event.eventLink}
              </a>
            </div>
          )}
        </div>

        {/* Share and Ticket Button */}
        <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={handleShare}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            Share Event
          </button>
          <div className="w-full sm:w-auto flex flex-col items-center">
            <span className="text-gray-300 mb-1">
              {event.price && event.price.trim() !== ""
                ? `From UGX${event.price}`
                : "Free"}
            </span>
            <button
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-10 rounded-lg text-lg"
              onClick={() =>
                user
                  ? setShowNotifyModal(true)
                  : navigate("/login", { state: { from: location } })
              }
            >
              {user
                ? futureNotifications > 0
                  ? `${futureNotifications} Reminder${
                      futureNotifications > 1 ? "s" : ""
                    } set`
                  : "Get Notified"
                : "Login to Get Notified"}
            </button>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in">
              <button
                onClick={() => setShowShareModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Share this Event
              </h2>
              <div className="flex flex-col gap-4">
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    shareUrl
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12c0-5.522-4.477-10-10-10S2 6.478 2 12c0 5 3.657 9.127 8.438 9.877v-6.987h-2.54v-2.89h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.632.771-1.632 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.127 22 17 22 12z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                    shareUrl
                  )}&text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-blue-400 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22.46 5.924c-.793.352-1.645.59-2.538.698a4.48 4.48 0 001.963-2.475 8.94 8.94 0 01-2.828 1.082 4.48 4.48 0 00-7.635 4.086A12.72 12.72 0 013.15 4.897a4.48 4.48 0 001.388 5.976 4.45 4.45 0 01-2.03-.561v.057a4.48 4.48 0 003.594 4.393 4.48 4.48 0 01-2.025.077 4.48 4.48 0 004.183 3.11A8.98 8.98 0 012 19.54a12.72 12.72 0 006.88 2.018c8.26 0 12.78-6.84 12.78-12.78 0-.195-.004-.39-.013-.583A9.14 9.14 0 0024 4.59a8.98 8.98 0 01-2.54.697z" />
                  </svg>
                  Twitter
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Check out this event: ${shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.52 3.48A11.93 11.93 0 0012 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.19-1.62A11.93 11.93 0 0012 24c6.63 0 12-5.37 12-12 0-3.19-1.24-6.19-3.48-8.52zM12 22c-1.85 0-3.68-.5-5.26-1.44l-.38-.23-3.67.96.98-3.57-.25-.37A9.93 9.93 0 012 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.2-7.8c-.28-.14-1.65-.81-1.9-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.08-.16.18-.32.2-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.13-.13.28-.34.42-.51.14-.17.18-.29.28-.48.09-.18.05-.36-.02-.5-.07-.14-.61-1.47-.84-2.01-.22-.54-.45-.47-.62-.48-.16-.01-.36-.01-.56-.01-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43 0 1.43 1.03 2.81 1.18 3 .15.19 2.03 3.1 4.93 4.23.69.3 1.23.48 1.65.61.69.22 1.32.19 1.81.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33z" />
                  </svg>
                  WhatsApp
                </a>
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 17l4 4 4-4m0-5V3a1 1 0 00-1-1h-6a1 1 0 00-1 1v9m0 4h10"
                    />
                  </svg>
                  {isCopied ? "Link Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notify Modal */}
        {showNotifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fade-in">
              <button
                onClick={() => setShowNotifyModal(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
              <h2 className="text-xl font-bold text-white mb-4 text-center">
                Get Notified
              </h2>
              <div className="flex flex-col gap-4">
                {notifications.map((notif, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={notif.value}
                      onChange={(e) =>
                        handleNotificationChange(idx, "value", e.target.value)
                      }
                      className="w-20 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                    />
                    <select
                      value={notif.unit}
                      onChange={(e) =>
                        handleNotificationChange(idx, "unit", e.target.value)
                      }
                      className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="text-gray-300">before event</span>
                    {notifications.length > 1 && (
                      <button
                        onClick={() => handleRemoveNotification(idx)}
                        className="text-red-400 hover:text-red-600 text-lg"
                        title="Remove"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}

                {/* Show default notification if none exist */}
                {notifications.length === 0 && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={15}
                      onChange={(e) => {
                        setNotifications([
                          { value: Number(e.target.value), unit: "minutes" },
                        ]);
                      }}
                      className="w-20 px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                    />
                    <select
                      value="minutes"
                      onChange={(e) => {
                        setNotifications([{ value: 15, unit: e.target.value }]);
                      }}
                      className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
                    >
                      <option value="minutes">minutes</option>
                      <option value="hours">hours</option>
                      <option value="days">days</option>
                    </select>
                    <span className="text-gray-300">before event</span>
                  </div>
                )}

                <button
                  onClick={handleAddNotification}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  Add Another Notification
                </button>
                <button
                  onClick={handleSaveNotifications}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg mt-2"
                >
                  Save Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Owner Controls */}
        {isOwner && (
          <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={async () => {
                if (
                  window.confirm("Are you sure you want to delete this event?")
                ) {
                  await setDoc(
                    doc(db, `artifacts/${appId}/public/data/events`, eventId),
                    { deleted: true },
                    { merge: true }
                  );
                  showFlash("Event deleted.");
                  navigate("/");
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              Delete Event
            </button>
            <button
              onClick={async () => {
                await setDoc(
                  doc(db, `artifacts/${appId}/public/data/events`, eventId),
                  { paused: !event.paused },
                  { merge: true }
                );
                // Fetch latest event data from Firestore
                const eventDocRef = doc(
                  db,
                  `artifacts/${appId}/public/data/events`,
                  eventId
                );
                const docSnap = await getDoc(eventDocRef);
                if (docSnap.exists()) {
                  setEvent({ id: docSnap.id, ...docSnap.data() });
                }
                showFlash(event.paused ? "Event relisted." : "Event delisted.");
              }}
              className={`${
                event.paused
                  ? "bg-yellow-600 hover:bg-yellow-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white font-bold py-2 px-6 rounded-lg`}
            >
              {event.paused ? "Relist Event" : "Delist Event"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPage;

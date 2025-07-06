import { logEvent } from "firebase/analytics";
import { addDoc, collection } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useContext, useState } from "react";
import { AppContext } from "../App";
import { analytics, appId, db, storage } from "../firebase";

// Create Event Modal Component
const CreateEventModal = () => {
  const { user, setShowCreateEventModal } = useContext(AppContext);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [price, setPrice] = useState("");
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(1);

  // Get user's timezone
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !date || !location) {
      setError(
        "Please fill in all required fields: Title, Date, and Location."
      );
      return;
    }

    if (isMultiDay && numberOfDays < 1) {
      setError("Number of days must be at least 1.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let imageUrl = "";
      if (imageFile) {
        const imageRef = ref(
          storage,
          `event-images/${appId}/${imageFile.name}-${Date.now()}`
        );
        const snapshot = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Create a proper ISO datetime string with timezone
      const eventDateTime = new Date(`${date}T${time || "00:00"}`);

      // Calculate end date for multi-day events
      const endDate = new Date(date);
      if (isMultiDay && numberOfDays > 1) {
        endDate.setDate(endDate.getDate() + numberOfDays - 1);
      }

      const eventData = {
        title,
        description,
        date,
        time,
        location,
        imageUrl,
        creatorId: user.uid,
        creatorName: user.displayName,
        createdAt: new Date().toISOString(),
        eventLink,
        price,
        timezone: userTimezone,
        dateTime: eventDateTime.toISOString(),
        isMultiDay: isMultiDay && numberOfDays > 1,
        numberOfDays: isMultiDay ? numberOfDays : 1,
        endDate: endDate.toISOString().slice(0, 10), // Store as YYYY-MM-DD
      };

      await addDoc(
        collection(db, `artifacts/${appId}/public/data/events`),
        eventData
      );

      // Success
      logEvent(analytics, "create_event", {
        title,
        date,
        location,
        creator: user.uid,
        timezone: userTimezone,
        isMultiDay: isMultiDay && numberOfDays > 1,
        numberOfDays: numberOfDays,
      });
      setShowCreateEventModal(false);
    } catch (err) {
      console.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-2xl max-h-full overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Create a New Film Event
          </h2>
          <button
            onClick={() => setShowCreateEventModal(false)}
            className="text-gray-400 hover:text-white"
          >
            &times;
          </button>
        </div>
        {error && (
          <p className="text-red-400 bg-red-900 p-3 rounded-md mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Event Title*"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          ></textarea>

          {/* Multi-day event checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="multiDay"
              checked={isMultiDay}
              onChange={(e) => setIsMultiDay(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="multiDay" className="text-gray-300">
              Multi-day event
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="date"
              placeholder="Start Date*"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full bg-gray-700 text-white rounded-lg p-3"
            />
            <input
              type="time"
              placeholder="Start Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg p-3"
            />
          </div>

          {/* Number of days input - only show if multi-day is checked */}
          {isMultiDay && (
            <div>
              <label className="block text-gray-300 mb-2">
                Number of Days*
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={numberOfDays}
                onChange={(e) => setNumberOfDays(parseInt(e.target.value) || 1)}
                className="w-full bg-gray-700 text-white rounded-lg p-3"
                required
              />
              {numberOfDays > 1 && date && (
                <div className="text-sm text-gray-400 mt-1">
                  Event will run from {date} to{" "}
                  {new Date(
                    new Date(date).getTime() +
                      (numberOfDays - 1) * 24 * 60 * 60 * 1000
                  )
                    .toISOString()
                    .slice(0, 10)}
                </div>
              )}
            </div>
          )}

          <input
            type="text"
            placeholder="Location*"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />

          {/* Show timezone info to user */}
          <div className="text-sm text-gray-400">
            Event will be saved in your timezone: {userTimezone}
          </div>

          <div>
            <label className="block text-gray-300 mb-2">
              Event Image (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 rounded-lg max-h-40"
              />
            )}
          </div>

          <input
            type="text"
            placeholder="Event Link (Zoom, Google Meet, etc)"
            value={eventLink}
            onChange={(e) => setEventLink(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />

          <input
            type="text"
            placeholder="Price (leave blank for Free)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg p-3"
          />

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateEventModal(false)}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

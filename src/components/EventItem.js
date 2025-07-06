// Event Item Component
const EventItem = ({ event, onClick }) => (
  <div
    className="bg-gray-900 rounded p-2 flex items-center space-x-2 hover:bg-gray-700 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex-1">
      <div className="text-lg font-semibold text-indigo-400">{event.title}</div>
      <div className="text-sm text-gray-400">
        {event.time} @ {event.location}
      </div>
    </div>
    <div className="flex-shrink-0">
      <div className="text-sm text-gray-300">
        {event.creatorName || "A friend"}
      </div>
    </div>
  </div>
);

export default EventItem;

import { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AppContext } from "../App";

// Header Component
const Header = () => {
  const { user, setShowCreateEventModal, handleLogout } =
    useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const adminUserId = process.env.REACT_APP_ADMIN_USER_ID;
  const isAdmin = user && user.uid === adminUserId;

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <h1
          className="text-2xl font-bold tracking-wider cursor-pointer hover:text-indigo-400 transition-colors"
          onClick={() => navigate("/")}
        >
          Cinema Plot
        </h1>
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <Link
              to="/admin"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg"
            >
              Admin Dashboard
            </Link>
          )}
          {user ? (
            <>
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                + Create Event
              </button>
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-700 rounded-lg p-2 transition-colors"
                  onClick={() => navigate("/my-events")}
                  title="View my events"
                >
                  <img
                    src={
                      user.photoURL ||
                      `https://placehold.co/40x40/7c3aed/ffffff?text=${
                        user.displayName?.[0] || "U"
                      }`
                    }
                    alt="user avatar"
                    className="w-10 h-10 rounded-full border-2 border-indigo-400"
                  />
                  <span className="hidden sm:inline font-semibold">
                    {user.displayName?.split(" ")[0] || "User"} (My Events)
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/login", { state: { from: location } });
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
            >
              Login to Create Event
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

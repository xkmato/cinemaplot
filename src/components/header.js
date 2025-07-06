import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Add this import
import { AppContext } from "../App";

// Header Component
const Header = () => {
  const { user, setShowCreateEventModal, handleLogout } =
    useContext(AppContext);
  const navigate = useNavigate(); // Add this line
  const location = useLocation();

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md sticky top-0 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wider">Cinema Plot</h1>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <button
                onClick={() => setShowCreateEventModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                + Create Event
              </button>
              <div className="flex items-center space-x-2">
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
                  {user.displayName || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-300 hover:text-white"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => {
                navigate("/login", { state: { from: location } }); // Navigate to login page
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

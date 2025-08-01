import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Switch } from "@headlessui/react";

const TopNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDengue, setIsDengue] = useState(true);

  const showToggle =
    location.pathname === "/" || location.pathname === "/covid";

  useEffect(() => {
    if (showToggle) {
      setIsDengue(location.pathname === "/");
    }
  }, [location.pathname]);

  const handleToggle = () => {
    const newPath = isDengue ? "/covid" : "/";
    navigate(newPath);
    setIsDengue(!isDengue);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow z-50 border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Sidebar toggle for small screens */}
        <button
          className="text-gray-700 focus:outline-none lg:hidden"
          data-mdb-toggle="sidenav"
          data-mdb-target="#sidenav-1"
        >
          <i className="fas fa-bars fa-lg" />
        </button>

        {/* Center: Toggle Switch (only visible on dashboard paths) */}
        {showToggle && (
          <div className="flex items-center space-x-4 mx-auto">
            <span className="text-sm font-medium text-gray-600">COVID</span>
            <Switch
              checked={isDengue}
              onChange={handleToggle}
              className={`${
                isDengue ? "bg-blue-600" : "bg-gray-300"
              } relative inline-flex items-center h-6 rounded-full w-11 transition duration-200`}
            >
              <span
                className={`${
                  isDengue ? "translate-x-6" : "translate-x-1"
                } inline-block w-4 h-4 transform bg-white rounded-full`}
              />
            </Switch>
            <span className="text-sm font-medium text-gray-600">Dengue</span>
          </div>
        )}

        {/* Right: Login Button */}
        <div className="absolute right-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/LandingPage")}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;

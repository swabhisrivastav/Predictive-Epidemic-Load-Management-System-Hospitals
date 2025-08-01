import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {Shield} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("home");
  const isCovidDashboard = location.pathname === "/covid";
  const isNationalDashboard = location.pathname === "/national";
  const isDistrictDashboard = location.pathname === "/district";
  const getActiveItemFromUrl = () => {
    const path = location.pathname;
    if (path === "/national") return "national";
    if (path === "/district") return "district";
    if (path === "/hospital") return "hospital";
    if (path === "/AddResource") return "resources";
    return "home";
  };

  useEffect(() => {
    setActiveItem(getActiveItemFromUrl());
  }, [location.pathname]);

  const menuItems = [
    { id: "home", label: "Home", icon: "🏠", href: "/" },
    ...(isCovidDashboard || isNationalDashboard ||  isDistrictDashboard
      ? [
          {
            id: "national",
            label: "National Trend",
            icon: "📊",
            href: "/national",
          },
          {
            id: "district",
            label: "District Trend",
            icon: "🏙️",
            href: "/district",
          },
        ]
      : []),
    { id: "hospital", label: "My Hospital", icon: "🏥", href: "/hospital" },
    {
      id: "resources",
      label: "Add Resources",
      icon: "⚕️",
      href: "/AddResource",
    },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-slate-800 to-slate-900 shadow-2xl z-[9999]">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            {/* <span className="text-white font-bold text-lg"></span> */}
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">
              EpiGuard
            </h1>
            <p className="text-slate-400 text-sm">Epidemic Load Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <a
                href={item.href}
                onClick={() => {
                  setActiveItem(item.id);
                  setTimeout(() => {
                    setActiveItem(getActiveItemFromUrl());
                  }, 100);
                }}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200 group
                  ${
                    activeItem === item.id
                      ? "bg-blue-600 text-white shadow-lg transform scale-105"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }
                `}
              >
                <span className="text-xl mr-3 transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
                {activeItem === item.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 text-slate-400">
          <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">U</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-white">User Dashboard</p>
            <p className="text-xs text-slate-500">Healthcare System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

// src/components/DashboardLayout.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FiHome, FiUserPlus, FiUsers, FiFileText } from 'react-icons/fi';

const DashboardLayout = () => {
  const baseClasses = "flex items-center p-2 rounded transition-colors";
  const inactive = "text-gray-300 hover:bg-gray-700 hover:text-white";
  const active = "bg-blue-600 text-white shadow-md";

  return (
    <div className="min-h-screen bg-blue-50 text-gray-900">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 min-h-screen p-4 bg-gray-900 text-white shadow-md">
          <h1 className="text-xl font-bold mb-8">Prescription App</h1>

          <nav>
            <ul className="space-y-2">
              <li>
                <NavLink 
                  to="/dashboard" 
                  end
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? active : inactive}`
                  }
                >
                  <FiHome className="mr-2" /> Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/manage-doctors" 
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? active : inactive}`
                  }
                >
                  <FiUserPlus className="mr-2" /> Manage Doctors
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/manage-patients" 
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? active : inactive}`
                  }
                >
                  <FiUsers className="mr-2" /> View Patients
                </NavLink>
              </li>
              <li>
                <NavLink 
                  to="/new-prescription" 
                  className={({ isActive }) =>
                    `${baseClasses} ${isActive ? active : inactive}`
                  }
                >
                  <FiFileText className="mr-2" /> New Prescription
                </NavLink>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
         
          
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;

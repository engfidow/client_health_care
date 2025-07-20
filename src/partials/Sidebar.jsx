import React, { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUserMd,
  FaCalendarAlt,
  FaUsers,
  FaFileMedicalAlt,
  FaUserCircle,
  FaSignOutAlt,
} from 'react-icons/fa';

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { pathname } = location;
  const navigate = useNavigate();
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(
    localStorage.getItem('sidebar-expanded') === 'true'
  );

  const user = JSON.parse(localStorage.getItem('user'));
  const role = user?.role || 'staff';

  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target) || trigger.current.contains(target)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarExpanded);
    if (sidebarExpanded) {
      document.body.classList.add('sidebar-expanded');
    } else {
      document.body.classList.remove('sidebar-expanded');
    }
  }, [sidebarExpanded]);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItem = (to, icon, label) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 p-2 text-sm rounded-lg font-medium transition ${
          isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        }`
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );

  return (
    <div className="min-w-fit">
      <div
        className={`fixed inset-0 bg-gray-900/30 z-40 lg:hidden transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      ></div>

      <div
        ref={sidebar}
        className={`flex flex-col z-40 h-screen w-64 bg-white dark:bg-gray-900 p-5 border-r transition-all duration-200 ease-in-out
        ${sidebarOpen ? 'block' : 'hidden lg:block'}`}
      >
       
        {/* Logo & Close */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-blue-600 tracking-wide">Daryeel</h1>
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-2">
          {navItem('/', <FaTachometerAlt size={18} />, 'Dashboard')}
          {navItem('/doctors', <FaUserMd size={18} />, 'Doctors')}
          
          {navItem('/appointments', <FaCalendarAlt size={18} />, 'Appointments')}
          
          {navItem('/reports', <FaFileMedicalAlt size={18} />, 'Reports')}
          {role === 'admin' && navItem('/users', <FaUsers size={18} />, 'User Management')}
        </nav>

        {/* Bottom */}
        <div className="pt-6 mt-auto border-t border-gray-200 dark:border-gray-700">
         

          <button
            onClick={logout}
            className="flex items-center gap-3 mt-3 text-red-600 hover:text-red-700 px-4 py-2 text-sm font-medium w-full rounded-lg transition dark:hover:bg-red-500/10"
          >
            <FaSignOutAlt size={18} />
            Logout
          </button>
        </div>
      
      </div>
    </div>
  );
}

export default Sidebar;

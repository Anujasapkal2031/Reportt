// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <Link to="/dashboard" className="text-xl font-bold text-blue-600">Report Generator</Link>
      <button
        onClick={() => {
          logout();
          navigate('/login');
        }}
        className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition duration-300"
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;

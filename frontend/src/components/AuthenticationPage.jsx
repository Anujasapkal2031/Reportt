import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaSignInAlt } from "react-icons/fa";

const AuthenticationPage = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSignup && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const endpoint = isSignup ? "/api/register" : "/api/login";
    try {
      const { data } = await axios.post(`http://localhost:8000${endpoint}`, formData);
      if (!isSignup) {
        localStorage.setItem('token', data.token);
        login(data.token);
        alert("Login successful!");
        navigate("/dashboard");
      } else {
        alert("Signup successful! Please login.");
        setIsSignup(false);
      }
    } catch (error) {
      alert("Authentication failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
          
      {isSignup ? <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Sign Up</h1> :
      <h1 className="text-4xl font-extrabold text-gray-800 text-center mb-8">Login Page</h1>}
      
      <div className="bg-white p-10 shadow-2xl rounded-lg w-full max-w-md transform transition duration-500 hover:scale-105">
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignup && (
            <div>
              <label className="block font-semibold text-gray-800">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required={isSignup}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-semibold text-gray-800">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-gray-500" />
              <input
                type="email"
                placeholder="Enter your email"
                className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800">Password</label>
            <div className="relative">
              <FaLock className="absolute left-3 top-4 text-gray-500" />
              <input
                type="password"
                placeholder="Create a password"
                className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block font-semibold text-gray-800">Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-4 text-gray-500" />
                <input
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10 w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required={isSignup}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            {isSignup ? <FaUserPlus /> : <FaSignInAlt />}
            {isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthenticationPage;

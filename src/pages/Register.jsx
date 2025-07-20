import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin',
  });

  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName) newErrors.fullName = 'Full Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (image) formData.append('image', image);

    try {
      await axios.post('http://localhost:5000/api/users/register', formData);
      setLoading(false);
      navigate('/login');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Registration failed' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-gray-900 dark:to-gray-800 px-4 py-10">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10">
        <h2 className="text-3xl font-extrabold text-center text-blue-600 dark:text-blue-400 mb-6">
          🩺 Healthcare Registration
        </h2>

        {errors.general && (
          <div className="mb-4 bg-red-100 text-red-700 border border-red-300 rounded px-4 py-2 text-sm">
            ⚠️ {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
          <div>
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className=" mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full"
              value={form.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <label className="text-red-500 text-sm">{errors.fullName}</label>}
          </div>

          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className=" mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <label className="text-red-500 text-sm">{errors.email}</label>}
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className=" mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <label className="text-red-500 text-sm">{errors.password}</label>}
          </div>

          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className=" mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 w-full"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <label className="text-red-500 text-sm">{errors.confirmPassword}</label>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              name="image"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow transition duration-300"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

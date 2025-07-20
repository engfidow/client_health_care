import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaUserShield,
  FaUser,
  FaUserMd,
  FaImage
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import Modal from 'react-modal';
import 'react-toastify/dist/ReactToastify.css';

Modal.setAppElement('#root');

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user',
    image: null
  });
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const openAddModal = () => {
    setCurrentUser(null);
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'user',
      image: null
    });
    setPreviewImage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '',
      role: user.role,
      image: null
    });
    setPreviewImage(user.image ? `http://localhost:5000/uploads/${user.image}` : null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setCurrentUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      if (formData.password) formDataToSend.append('password', formData.password);
      if (formData.image) formDataToSend.append('image', formData.image);

      if (currentUser) {
        // Update user
        await axios.put(`http://localhost:5000/api/users/${currentUser._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('User updated successfully');
      } else {
        // Create user
        await axios.post('http://localhost:5000/api/users/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        toast.success('User created successfully');
      }

      fetchUsers();
      closeModal();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${currentUser._id}`);
      toast.success('User deleted successfully');
      fetchUsers();
      closeModal();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

 const filteredUsers = users.filter(user => {
  // Safely access properties with optional chaining and provide fallbacks
  const name = user?.fullName?.toLowerCase() || '';
  const email = user?.email?.toLowerCase() || '';
  const search = searchTerm.toLowerCase();
  
  return name.includes(search) || email.includes(search);
});
  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <FaUserShield className="text-red-500" />;
      case 'doctor': return <FaUserMd className="text-blue-500" />;
      default: return <FaUser className="text-green-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FaUsers className="text-indigo-600" /> User Management
        </h1>
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={openAddModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 h-32 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                            {user.image ? (
                              <img 
                                src={`http://localhost:5000/uploads/${user.image}`} 
                                alt={user.fullName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-gray-400">
                                <FaUser size={20} />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className="text-sm text-gray-500 capitalize">{user.role}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-full hover:bg-indigo-50 transition"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => openDeleteModal(user)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel={currentUser ? 'Edit User' : 'Add User'}
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {currentUser ? 'Edit User' : 'Add New User'}
            </h2>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="fullName">
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                {currentUser ? 'New Password (leave blank to keep current)' : 'Password'}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                minLength={6}
                required={!currentUser}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="role">
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="user">User</option>
                <option value="doctor">Doctor</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="image">
                Profile Image
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {previewImage ? (
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaImage size={20} />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <span className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                    Choose Image
                  </span>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {currentUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeModal}
        contentLabel="Delete User"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <FaTrash className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Delete User</h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete {currentUser?.fullName}? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90%;
          max-width: 500px;
          background: white;
          border-radius: 8px;
          outline: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }
      `}</style>
    </div>
  );
};

export default Users;
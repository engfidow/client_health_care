import React from 'react';

const Profile = () => {
  // Retrieve user data from localStorage
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
        <h3 className="text-lg font-medium text-gray-900">No user data found</h3>
        <p className="mt-1 text-sm text-gray-500">Please log in to view your profile</p>
      </div>
    );
  }

  // Construct image URL - assuming images are served from /uploads/ on localhost
  const imageUrl = user.image 
    ? `http://localhost:5000/uploads/${user.image}` 
    : null;

  return (
    <div className=" p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with back button and title */}
        <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        </div>

        {/* Profile content */}
        <div className="p-6">
          {/* User avatar and basic info */}
          <div className="flex items-start space-x-6 mb-8">
            <div className="flex-shrink-0">
              {imageUrl ? (
                <img
                  className="h-24 w-24 rounded-full object-cover border-2 border-gray-300"
                  src={imageUrl}
                  alt={user.name}
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-2xl">👤</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h1>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.status.toUpperCase()}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : user.role === 'police'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.role.toUpperCase()}
                </span>
                
              </div>
            </div>
          </div>

          {/* User details - matches your screenshot layout */}
          <div className="space-y-4">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <p className="text-sm text-gray-500">National ID</p>
                  <p className="text-gray-900">{user.nationalId || 'Not provided'}</p>
                </div> */}
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{user.phone}</p>
                </div>
                {user.district && (
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="text-gray-900">{user.district}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
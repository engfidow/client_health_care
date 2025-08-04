import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import Swal from 'sweetalert2';
import { FaCalendarAlt, FaClock, FaUser, FaPhone, FaMoneyBill, FaCheckCircle } from 'react-icons/fa';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/doctor/user/${user._id}`);
      setAppointments(res.data);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to fetch appointments', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
     fetchAppointments();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">🩺 My Appointments</h2>

      {loading ? (
        <Skeleton count={5} height={40} />
      ) : appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left"><FaUser className="inline mr-1" />Patient</th>
                <th className="p-2 text-left"><FaPhone className="inline mr-1" />Phone</th>
                <th className="p-2 text-left"><FaCalendarAlt className="inline mr-1" />Date</th>
                <th className="p-2 text-left"><FaClock className="inline mr-1" />Reason</th>
                <th className="p-2 text-left"><FaMoneyBill className="inline mr-1" />Price</th>
                <th className="p-2 text-left"><FaCheckCircle className="inline mr-1" />Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">{a.userId?.fullName || 'Unknown'}</td>
                  <td className="p-2">{a.phone}</td>
                  <td className="p-2">{new Date(a.date).toLocaleString()}</td>
                  <td className="p-2">{a.reason}</td>
                  <td className="p-2">${a.appointmentprice}</td>
                  <td className="p-2 capitalize">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;

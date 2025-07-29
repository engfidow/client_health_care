import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/appointments');
      setAppointments(res.data);
      setFilteredAppointments(res.data);
      extractDoctors(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointments', err);
      setLoading(false);
    }
  };

  // Extract unique doctors for filtering
  const extractDoctors = (data) => {
    const uniqueDoctors = data
      .filter((a) => a.doctorId !== null)
      .map((a) => ({
        id: a.doctorId._id,
        name: a.doctorId.name,
      }))
      .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);

    setDoctors(uniqueDoctors);
  };

  const handleFilter = (e) => {
    const value = e.target.value;
    setSelectedDoctor(value);
    if (value === '') {
      setFilteredAppointments(appointments);
    } else {
      setFilteredAppointments(appointments.filter(a => a.doctorId?._id === value));
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredAppointments.map(a => ({
      Doctor: a.doctorId?.name || 'N/A',
      Specialization: a.doctorId?.specialization || 'N/A',
      Patient: a.userId?.fullName || 'N/A',
      Phone: a.phone || 'N/A',
      Reason: a.reason || 'N/A',
      Price: a.appointmentprice || 'N/A',
      Status: a.status,
      Date: new Date(a.date).toLocaleString(),
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Appointments");
    XLSX.writeFile(wb, "appointments.xlsx");
  };

  const exportToPDF = () => {
  const doc = new jsPDF();
  const tableColumn = ["Doctor", "Patient", "Phone", "Reason", "Price", "Status", "Date"];
  const tableRows = [];

  filteredAppointments.forEach(a => {
    tableRows.push([
      a.doctorId?.name || 'N/A',
      a.userId?.fullName || 'N/A',
      a.phone || 'N/A',
      a.reason || 'N/A',
      a.appointmentprice || 'N/A',
      a.status,
      new Date(a.date).toLocaleString()
    ]);
  });

  doc.text("Appointments Report", 14, 15);
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 20,
  });
  doc.save("appointments.pdf");
};


  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <div className="flex gap-2">
          <select
            value={selectedDoctor}
            onChange={handleFilter}
            className="border px-2 py-1 rounded"
          >
            <option value="">All Doctors</option>
            {doctors.map(doc => (
              <option key={doc.id} value={doc.id}>{doc.name}</option>
            ))}
          </select>
          <button onClick={exportToExcel} className="bg-green-600 text-white px-3 py-1 rounded">Download Excel</button>
          <button onClick={exportToPDF} className="bg-blue-600 text-white px-3 py-1 rounded">Download PDF</button>
        </div>
      </div>

      {loading ? (
        <Skeleton count={8} height={40} className="mb-2" />
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl">
          <table className="w-full table-auto border text-sm rounded-2xl">
            <thead className="bg-gray-300 rounded-2xl">
              <tr >
                <th className="p-2 border">Doctor</th>
                <th className="p-2 border">Specialization</th>
                <th className="p-2 border">Patient</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Reason</th>
                <th className="p-2 border">Price</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map(app => (
                <tr key={app._id} className="text-sm">
                  <td className="p-2 border">{app.doctorId?.name || 'N/A'}</td>
                  <td className="p-2 border">{app.doctorId?.specialization || 'N/A'}</td>
                  <td className="p-2 border">{app.userId?.fullName || 'N/A'}</td>
                  <td className="p-2 border">{app.phone || 'N/A'}</td>
                  <td className="p-2 border">{app.reason || 'N/A'}</td>
                  <td className="p-2 border">{app.appointmentprice || 'N/A'}</td>
                  <td className="p-2 border capitalize">{app.status}</td>
                  <td className="p-2 border">{new Date(app.date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Appointments;

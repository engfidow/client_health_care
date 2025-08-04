import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import Skeleton from 'react-loading-skeleton';
import Swal from 'sweetalert2';
import { FaEdit, FaEye, FaTrash, FaUserMd } from 'react-icons/fa';

Modal.setAppElement('#root');

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoctor, setPreviewDoctor] = useState(null);
  const [form, setForm] = useState({
  name: '', email: '', phone: '', specialization: '', experience: '',
  status: '', image: '', language: '', appointmentprice: '', password: ''
});

  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [editId, setEditId] = useState(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/doctors');
      setDoctors(res.data);
    } catch (err) {
      Swal.fire('Error', 'Failed to fetch doctors', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openModal = (doctor = null) => {
    if (doctor) {
      setEditId(doctor._id);
      setForm({
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        specialization: doctor.specialization,
        experience: doctor.experience,
        status: doctor.status,
        image: doctor.image,
        language: doctor.language || '',
        appointmentprice: doctor.appointmentprice || '',
      });
      setImagePreview(`http://localhost:5000/uploads/${doctor.image}`);
    } else {
      setEditId(null);
      setForm({
        name: '', email: '', phone: '', specialization: '', experience: '',
        status: '', image: '', language: '', appointmentprice: '', password: ''
      });
      setImagePreview(null);
    }
    setErrors({});
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    else if (!/^061\d{7}$/.test(form.phone)) newErrors.phone = 'Phone must start with 061 and be 10 digits';
    if (!form.specialization) newErrors.specialization = 'Specialization is required';
    if (!form.experience) newErrors.experience = 'Experience is required';
    else if (!/^\d+$/.test(form.experience)) newErrors.experience = 'Experience must be a number';
    if (!form.status) newErrors.status = 'Status is required';
    if (!form.language) newErrors.language = 'Language is required';
    if (!editId && !form.password) newErrors.password = 'Password is required';
    else if (!editId && form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
  
    if (!form.appointmentprice) newErrors.appointmentprice = 'Appointment price is required';
    else if (isNaN(form.appointmentprice)) newErrors.appointmentprice = 'Must be a number';
    if ((!form.image || typeof form.image === 'string') && !editId) newErrors.image = 'Image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => formData.append(key, val));
    try {
      let res;
      if (editId) {
        res = await axios.put(`http://localhost:5000/api/doctors/${editId}`, formData);
      } else {
        res = await axios.post('http://localhost:5000/api/doctors', formData);
      }
      Swal.fire('Success', res.data?.message || 'Doctor saved successfully', 'success');
      fetchDoctors();
      setModalOpen(false);
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Something went wrong', 'error');
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`http://localhost:5000/api/doctors/${id}`);
          fetchDoctors();
          Swal.fire('Deleted!', 'Doctor has been deleted.', 'success');
        } catch (err) {
          Swal.fire('Error', 'Failed to delete doctor', 'error');
        }
      }
    });
  };

  const openPreview = (doctor) => {
    setPreviewDoctor(doctor);
    setPreviewOpen(true);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Doctor Management</h1>
        <button onClick={() => openModal()} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Doctor</button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl">
        {loading ? (
          <Skeleton height={250} />
        ) : (
          <table className="w-full table-auto border text-sm rounded-2xl">
            <thead className="bg-gray-300 rounded-2xl">
              <tr>
                <th className="p-2">Image</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone</th>
                <th className="p-2">Specialization</th>
                <th className="p-2">Experience</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-t hover:bg-gray-50">
                  <td className="p-2">
                    <img src={`http://localhost:5000/uploads/${doc.image}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="p-2">{doc.name}</td>
                  <td className="p-2">{doc.email}</td>
                  <td className="p-2">{doc.phone}</td>
                  <td className="p-2">{doc.specialization}</td>
                  <td className="p-2">{doc.experience}</td>
                  <td className="p-2 capitalize">{doc.status}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => openPreview(doc)} className="bg-blue-100 text-blue-600 p-2 rounded-full hover:bg-blue-200"><FaEye size={16} /></button>
                    <button onClick={() => openModal(doc)} className="bg-green-100 text-green-700 p-2 rounded-full hover:bg-green-200"><FaEdit size={16} /></button>
                    <button onClick={() => handleDelete(doc._id)} className="bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200"><FaTrash size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onRequestClose={() => setModalOpen(false)} className="z-50 max-w-3xl mx-auto bg-white rounded p-6 mt-10 outline-none shadow-xl">
        <h2 className="text-lg font-semibold mb-4">{editId ? 'Edit Doctor' : 'Register Doctor'}</h2>
        <div className="flex justify-center mb-4">
          <label htmlFor="image" className="cursor-pointer">
            {imagePreview ? (
              <img src={imagePreview} className="w-24 h-24 rounded-full object-cover" alt="Preview" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <FaUserMd size={30} />
              </div>
            )}
            <input type="file" id="image" className="hidden" onChange={handleImageChange} />
          </label>
          {errors.image && <p className="text-red-500 text-sm text-center mt-2">{errors.image}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['name', 'email', 'phone', 'specialization'].map((field) => (
            <div key={field}>
              <label className="block text-sm capitalize">{field}</label>
              <input
                type="text"
                value={form[field] || ''}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full p-2 border rounded"
              />
              {errors[field] && <p className="text-red-500 text-sm">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <label className="block text-sm">Experience (years)</label>
            <input
              type="number"
              value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {errors.experience && <p className="text-red-500 text-sm">{errors.experience}</p>}
          </div>

          <div>
            <label className="block text-sm">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">-- Select Status --</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {errors.status && <p className="text-red-500 text-sm">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm">Language</label>
            <input
              type="text"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
          </div>

          <div>
            <label className="block text-sm">Appointment Price ($)</label>
            <input
              type="number"
              value={form.appointmentprice}
              onChange={(e) => setForm({ ...form, appointmentprice: e.target.value })}
              className="w-full p-2 border rounded"
            />
            {errors.appointmentprice && <p className="text-red-500 text-sm">{errors.appointmentprice}</p>}
          </div>

          {!editId && (
  <div>
    <label className="block text-sm">Password</label>
    <input
      type="password"
      value={form.password}
      onChange={(e) => setForm({ ...form, password: e.target.value })}
      className="w-full p-2 border rounded"
    />
    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
  </div>
)}

        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => setModalOpen(false)} className="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
        </div>
      </Modal>

      <Modal isOpen={previewOpen} onRequestClose={() => setPreviewOpen(false)} className="z-40 max-w-md mx-auto bg-white rounded p-4 mt-10 outline-none shadow-lg">
        <h2 className="text-lg font-bold mb-4">Doctor Info</h2>
        {previewDoctor && (
          <div className="text-center">
            <img src={`http://localhost:5000/uploads/${previewDoctor.image}`} alt="" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            {['name', 'email', 'phone', 'specialization', 'experience', 'status', 'language', 'appointmentprice'].map((key) => (
              <p key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {previewDoctor[key]}</p>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Doctors;

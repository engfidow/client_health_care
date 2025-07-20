import React, { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  FaUserMd, 
  FaCalendarCheck, 
  FaMoneyBillWave,
  FaChartPie,
  FaChartBar,
  FaStar,
  FaClinicMedical
} from 'react-icons/fa';
import 'react-loading-skeleton/dist/skeleton.css';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: {},
    pieChartData: { labels: [], values: [] },
    barChartData: { labels: [], values: [] },
    topDoctors: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const summaryCards = [
    {
      icon: <FaCalendarCheck className="text-white text-2xl" />,
      label: 'Total Appointments',
      value: data.summary.totalAppointments,
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    {
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      label: 'Total Revenue',
      value: `$${data.summary.totalRevenue || 0}`,
      bg: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    {
      icon: <FaUserMd className="text-white text-2xl" />,
      label: 'Total Doctors',
      value: data.summary.totalDoctors,
      bg: 'bg-gradient-to-r from-purple-500 to-purple-600'
    }
  ];

  const chartColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#06B6D4', '#F43F5E', '#84CC16',
    '#64748B', '#A855F7', '#EC4899', '#D946EF'
  ];

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-6 max-w-md mx-auto bg-red-50 rounded-lg">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaClinicMedical className="text-blue-600" /> Daryeel Dashboard
          </h1>
          <span className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {loading
            ? Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6 h-32">
                  <Skeleton height={24} width="40%" className="mb-2" />
                  <Skeleton height={32} width="60%" />
                </div>
              ))
            : summaryCards.map((card, i) => (
                <div key={i} className={` bg-white rounded-xl shadow-lg text-black p-6 transition-transform hover:scale-105`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-80">{card.label}</p>
                      <p className="text-2xl font-bold mt-2">{card.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bg} bg-opacity-20`}>
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4 text-blue-600">
              <FaChartPie className="text-xl" />
              <h2 className="text-lg font-bold">Appointments by Doctor</h2>
            </div>
            {loading ? (
              <Skeleton height={300} className="mt-4" />
            ) : (
              <div className="h-64">
                <Pie
                  data={{
                    labels: data.pieChartData.labels,
                    datasets: [{
                      data: data.pieChartData.values,
                      backgroundColor: chartColors,
                      borderWidth: 1,
                      borderColor: '#fff'
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right',
                        labels: {
                          boxWidth: 12,
                          padding: 20,
                          font: {
                            family: 'Inter, sans-serif'
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center gap-2 mb-4 text-green-600">
              <FaChartBar className="text-xl" />
              <h2 className="text-lg font-bold">Appointments Volume</h2>
            </div>
            {loading ? (
              <Skeleton height={300} className="mt-4" />
            ) : (
              <div className="h-64">
                <Bar
                  data={{
                    labels: data.barChartData.labels,
                    datasets: [{
                      label: 'Appointments',
                      data: data.barChartData.values,
                      backgroundColor: chartColors.slice(0, data.barChartData.labels.length),
                      borderRadius: 4
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          precision: 0
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Top Doctors Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2 text-purple-600">
              <FaStar className="text-xl" />
              <h2 className="text-lg font-bold">Top Doctors by Appointments</h2>
            </div>
          </div>
          {loading ? (
            <div className="p-6">
              <Skeleton height={300} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointments</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.topDoctors.map((doc, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 
                          ${i < 3 ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                          {i + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                            <FaUserMd />
                          </div>
                          <div>
                            <div className="font-medium">{doc.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.specialization}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          {doc.count} appointments
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
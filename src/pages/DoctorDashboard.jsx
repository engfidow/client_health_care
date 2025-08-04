import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa';
import Skeleton from 'react-loading-skeleton';

Chart.register(...registerables);

const DoctorDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});
  const [barChart, setBarChart] = useState({ labels: [], values: [] });
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:5000/api/dashboard/doctor?userId=${user._id}`);
        setSummary(res.data.summary);
        setBarChart(res.data.barChartData);
      } catch (err) {
        console.error('Doctor dashboard error:', err);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const summaryCards = [
    {
      icon: <FaCalendarCheck className="text-white text-2xl" />,
      label: 'Total Appointments',
      value: summary.totalAppointments,
      bg: 'bg-blue-600'
    },
    {
      icon: <FaMoneyBillWave className="text-white text-2xl" />,
      label: 'Total Revenue',
      value: `$${summary.totalRevenue || 0}`,
      bg: 'bg-green-600'
    }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">👨‍⚕️ Doctor Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {loading
          ? Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-6 h-32">
                <Skeleton height={24} width="40%" className="mb-2" />
                <Skeleton height={32} width="60%" />
              </div>
            ))
          : summaryCards.map((card, i) => (
              <div key={i} className={`rounded-xl shadow-lg text-white p-6 ${card.bg}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{card.label}</p>
                    <p className="text-2xl font-bold mt-2">{card.value}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">{card.icon}</div>
                </div>
              </div>
            ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">📊 Appointments Over Time</h2>
        {loading ? (
          <Skeleton height={300} />
        ) : (
          <div className="h-64">
            <Bar
              data={{
                labels: barChart.labels,
                datasets: [{
                  label: 'Appointments',
                  data: barChart.values,
                  backgroundColor: '#3B82F6',
                  borderRadius: 6
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
  );
};

export default DoctorDashboard;

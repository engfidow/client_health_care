import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { 
  FiCalendar, 
  FiFilter, 
  FiDownload, 
  FiFileText, 
  FiFile, 
  FiDollarSign,
  FiUsers,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';

const Reports = () => {
  const [range, setRange] = useState('month');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/appointments/report/${range}`;
      if (range === 'custom') {
        if (!customStart || !customEnd) {
          toast.error('Please select both start and end dates');
          return;
        }
        url += `?start=${customStart}&end=${customEnd}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report:', err);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (range !== 'custom' || (customStart && customEnd)) {
      fetchReport();
    }
  }, [range, customStart, customEnd]);

  const exportToExcel = () => {
    if (!reportData?.appointments?.length) {
      toast.warn('No data to export');
      return;
    }
    try {
      const worksheet = XLSX.utils.json_to_sheet(reportData.appointments.map(a => ({
        'User': a.userId?.fullName || 'N/A',
        'Doctor': a.doctorId?.name || 'N/A',
        'Date': format(new Date(a.date), 'yyyy-MM-dd'),
        'Phone': a.phone || '',
        'Price': `$${a.appointmentprice || 0}`,
        'Status': a.status
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
      XLSX.writeFile(workbook, `appointments_${format(new Date(), 'yyyyMMdd')}.xlsx`);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Export to Excel error:', error);
      toast.error('Failed to export to Excel');
    }
  };

  const exportToPDF = () => {
    if (!reportData?.appointments?.length) {
      toast.warn('No data to export');
      return;
    }
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('Appointments Report', 105, 15, { align: 'center' });
      
      // Subheader with date range
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      let dateRangeText = 'All Time';
      if (range === 'week') dateRangeText = 'This Week';
      else if (range === 'month') dateRangeText = 'This Month';
      else if (range === 'year') dateRangeText = 'This Year';
      else if (range === 'custom') dateRangeText = `${customStart} to ${customEnd}`;
      doc.text(`Date Range: ${dateRangeText} | Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, 105, 22, { align: 'center' });
      
      // Summary section
      doc.setFontSize(12);
      doc.text(`Total Appointments: ${reportData.count}`, 14, 35);
      doc.text(`Total Revenue: $${reportData.totalRevenue}`, 14, 45);
      
      // Table
      const tableData = reportData.appointments.map((a, index) => [
        index + 1,
        a.userId?.fullName || 'N/A',
        a.doctorId?.name || 'N/A',
        format(new Date(a.date), 'yyyy-MM-dd'),
        a.phone || '',
        `$${a.appointmentprice || 0}`,
        a.status
      ]);
      
      doc.autoTable({
        startY: 55,
        head: [['No', 'User', 'Doctor', 'Date', 'Phone', 'Price', 'Status']],
        body: tableData,
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240]
        },
        margin: { top: 55 }
      });
      
      doc.save(`appointments_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('PDF file downloaded successfully');
    } catch (error) {
      console.error('Export to PDF error:', error);
      toast.error('Failed to export to PDF');
    }
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setCustomStart(value);
      if (customEnd && value > customEnd) {
        setCustomEnd('');
      }
    } else {
      setCustomEnd(value);
    }
  };

  return (
    <div className="p-6  min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FiFileText className="text-blue-600" /> Appointments Report
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition"
              >
                <FiFilter /> Filter
              </button>
              
              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 p-4 border border-gray-200">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={range}
                      onChange={(e) => setRange(e.target.value)}
                    >
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="all">All Time</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  {range === 'custom' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={customStart}
                            onChange={(e) => handleDateChange('start', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            max={customEnd || format(new Date(), 'yyyy-MM-dd')}
                          />
                          <FiCalendar className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => handleDateChange('end', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                            min={customStart}
                            max={format(new Date(), 'yyyy-MM-dd')}
                          />
                          <FiCalendar className="absolute right-3 top-2.5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={() => {
                      fetchReport();
                      setIsFilterOpen(false);
                    }}
                    className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FiRefreshCw /> Apply Filters
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                title="Download PDF"
              >
                <FaFilePdf /> PDF
              </button>
              <button 
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                title="Download Excel"
              >
                <FaFileExcel /> Excel
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <Skeleton height={24} width="60%" className="mb-4" />
                  <Skeleton height={32} width="80%" />
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <Skeleton height={40} count={8} className="mb-2" />
            </div>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                    <FiUsers size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Appointments</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">{reportData.count}</p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-100 rounded-full text-green-600">
                    <FiDollarSign size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                </div>
                <p className="text-2xl font-bold text-gray-800">${reportData.totalRevenue}</p>
              </div>
              
             
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-100 rounded-full text-amber-600">
                    <FiFile size={20} />
                  </div>
                  <h3 className="text-sm font-medium text-gray-500">Report Period</h3>
                </div>
                <p className="text-lg font-semibold text-gray-800">
                  {range === 'week' && 'This Week'}
                  {range === 'month' && 'This Month'}
                  {range === 'year' && 'This Year'}
                  {range === 'all' && 'All Time'}
                  {range === 'custom' && `${customStart} to ${customEnd}`}
                </p>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-300 ">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Doctor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.appointments.length > 0 ? (
                      reportData.appointments.map((a, index) => (
                        <tr key={a._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {a.userId?.fullName || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {a.doctorId?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {format(new Date(a.date), 'MMM dd, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {a.phone || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ${a.appointmentprice || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              a.status === 'completed' ? 'bg-green-100 text-green-800' :
                              a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {a.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                          No appointments found for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FiFileText size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">No report data available</h3>
            <p className="text-gray-500 mb-4">Select a date range and generate a report</p>
            <button
              onClick={fetchReport}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <FiRefreshCw /> Generate Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
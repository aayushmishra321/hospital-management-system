import { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { BarChart3, TrendingUp, Users, DollarSign, Target, Lightbulb, Calendar, Download, Filter, RefreshCw, Building } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';

const analyticsQuotes = [
  "Data drives better decisions.",
  "Insights lead to improvements.",
  "Measure what matters.",
  "Analytics reveal opportunities.",
  "Numbers tell the story of success."
];

export function AnalyticsDashboard() {
  const { dashboardStats, loading } = useContext(AdminContext);
  const [analytics, setAnalytics] = useState<any>(null);
  const [billingAnalytics, setBillingAnalytics] = useState<any>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isFiltering, setIsFiltering] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchAnalytics = async (dateFilter: { startDate?: string; endDate?: string } = {}) => {
    try {
      setIsFiltering(true);
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate);
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate);
      
      const [analyticsRes, billingRes] = await Promise.all([
        api.get(`/admin/analytics?${params.toString()}`),
        api.get(`/billing/analytics?${params.toString()}`)
      ]);
      setAnalytics(analyticsRes.data);
      setBillingAnalytics(billingRes.data);
    } catch (error) {
      console.error('Analytics fetch failed:', error);
      toast.error('Failed to fetch analytics data');
    } finally {
      setIsFiltering(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleDateFilter = () => {
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error('Start date must be before end date');
      return;
    }
    fetchAnalytics({ startDate, endDate });
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    fetchAnalytics();
  };

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      setIsExporting(true);
      const params = new URLSearchParams();
      params.append('format', format);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await api.get(`/admin/analytics/export?${params.toString()}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
      
      toast.success(`Analytics exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const todayQuote = analyticsQuotes[new Date().getDay() % analyticsQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Admin and doctors/docHolder.jpg" 
          alt="Analytics Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/doc.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 to-blue-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600 mb-4">Hospital performance insights and metrics</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Analytics Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter and Export Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-700">Date Range Filter</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-purple-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isFiltering}
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-purple-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  disabled={isFiltering}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDateFilter}
                  disabled={isFiltering}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  {isFiltering ? 'Filtering...' : 'Apply'}
                </button>
                <button
                  onClick={clearDateFilter}
                  disabled={isFiltering}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Clear
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Export:</span>
              <button
                onClick={() => handleExport('json')}
                disabled={isExporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={() => handleExport('csv')}
                disabled={isExporting}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
          
          {(startDate || endDate) && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>Active Filter:</strong> 
                {startDate && ` From ${new Date(startDate).toLocaleDateString()}`}
                {endDate && ` To ${new Date(endDate).toLocaleDateString()}`}
                {!startDate && !endDate && ' No date filter applied'}
              </p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700">${billingAnalytics?.totalRevenue || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Revenue</p>
                <p className="text-2xl font-bold text-orange-700">${billingAnalytics?.pendingRevenue || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-blue-700">{dashboardStats?.totalPatients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-purple-700">{dashboardStats?.totalAppointments || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Department Statistics */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-purple-600" />
            Department Statistics
          </h2>
          {analytics?.departmentStats?.length > 0 ? (
            <div className="space-y-4">
              {analytics.departmentStats.map((dept: any, index: number) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 bg-purple-50/80 rounded-lg border border-purple-100 hover:bg-purple-100/80 transition-colors cursor-pointer group"
                  onClick={() => toast.info(`${dept.name} Department Details`, {
                    description: `Patients: ${dept.patients} | Revenue: $${dept.revenue}`
                  })}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                      <span className="font-medium text-purple-800 group-hover:text-purple-900">{dept.name}</span>
                      <p className="text-sm text-purple-600">Revenue: ${dept.revenue}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-purple-600 font-medium">{dept.patients} patients</span>
                    <div className="w-32 bg-purple-200 rounded-full h-3">
                      <div 
                        className="bg-purple-600 h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min((dept.patients / Math.max(...analytics.departmentStats.map((d: any) => d.patients))) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No department statistics available</p>
              <p className="text-gray-400">Data will appear here once appointments are made</p>
            </div>
          )}
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Monthly Revenue Trend
          </h2>
          {billingAnalytics?.monthlyRevenue?.length > 0 ? (
            <div className="space-y-3">
              {billingAnalytics.monthlyRevenue.map((month: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-green-50/80 rounded-lg border border-green-100">
                  <span className="font-medium text-green-800">
                    {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-green-600 font-medium">{month.count} transactions</span>
                    <span className="font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full">${month.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No revenue data available</p>
              <p className="text-gray-400">Revenue trends will appear here once billing is processed</p>
            </div>
          )}
        </div>

        {/* Top Performing Doctors */}
        {analytics?.topDoctors?.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Top Performing Doctors
            </h2>
            <div className="space-y-3">
              {analytics.topDoctors.map((doctor: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-blue-50/80 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-800">Dr. {doctor.name}</span>
                      <p className="text-sm text-blue-600">{doctor.specialization}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-blue-700">{doctor.appointmentCount}</span>
                    <p className="text-sm text-blue-600">appointments</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
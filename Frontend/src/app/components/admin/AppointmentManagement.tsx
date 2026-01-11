import { useContext, useState, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AdvancedSearch } from '../shared/AdvancedSearch';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  CheckCircle, 
  X, 
  Edit, 
  Eye, 
  Trash2, 
  UserCheck,
  Plus,
  Filter,
  RefreshCw,
  AlertCircle,
  Search
} from 'lucide-react';
import api from '../../services/api';
import axios from 'axios';
import { toast } from 'sonner';

const appointmentQuotes = [
  "Every appointment is an opportunity to heal and help.",
  "Efficient appointment management creates better patient experiences.",
  "Organized schedules lead to organized care.",
  "Managing appointments well means managing health well.",
  "Your coordination creates their comfort."
];

interface AppointmentForm {
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  reason: string;
  status: string;
}

export function AppointmentManagement() {
  const { appointments, setAppointments, patients, doctors, loading } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [form, setForm] = useState<AppointmentForm>({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: '',
    status: 'booked'
  });

  const [rescheduleForm, setRescheduleForm] = useState({
    date: '',
    time: '',
    reason: ''
  });

  const [cancelReason, setCancelReason] = useState('');

  const resetForm = () => {
    setForm({
      patientId: '',
      doctorId: '',
      date: '',
      time: '',
      reason: '',
      status: 'booked'
    });
  };

  // Enhanced search functionality
  const handleAdvancedSearch = async (filters: any) => {
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await fetch(`/api/search/appointments?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
        toast.success(`Found ${data.results.length} appointments`);
      } else {
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search error occurred');
    }
  };

  // Filter appointments
  const filteredAppointments = showAdvancedSearch ? searchResults : (appointments?.filter((appointment: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      appointment.patientId?.userId?.name?.toLowerCase().includes(searchLower) ||
      appointment.doctorId?.userId?.name?.toLowerCase().includes(searchLower) ||
      appointment.reason?.toLowerCase().includes(searchLower) ||
      appointment.status?.toLowerCase().includes(searchLower)
    );

    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      const appointmentDate = new Date(appointment.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'today':
          return appointmentDate.toDateString() === today.toDateString();
        case 'tomorrow':
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          return appointmentDate.toDateString() === tomorrow.toDateString();
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return appointmentDate >= today && appointmentDate <= weekFromNow;
        case 'past':
          return appointmentDate < today;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  }) || []);

  // Calculate appointment statistics
  const appointmentStats = {
    total: appointments?.length || 0,
    booked: appointments?.filter((a: any) => a.status === 'booked').length || 0,
    checkedIn: appointments?.filter((a: any) => a.status === 'checked-in').length || 0,
    completed: appointments?.filter((a: any) => a.status === 'completed').length || 0,
    cancelled: appointments?.filter((a: any) => a.status === 'cancelled').length || 0,
    today: appointments?.filter((a: any) => {
      const appointmentDate = new Date(a.date);
      const today = new Date();
      return appointmentDate.toDateString() === today.toDateString();
    }).length || 0
  };

  // Refresh appointments data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/admin/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data);
      toast.success('Appointments refreshed');
    } catch (error) {
      toast.error('Failed to refresh appointments');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Add new appointment
  const handleAddAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5001/api/admin/appointments', form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments((prev: any) => [response.data.appointment, ...prev]);
      toast.success('Appointment created successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit appointment
  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setForm({
      patientId: appointment.patientId?._id || '',
      doctorId: appointment.doctorId?._id || '',
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time || '',
      reason: appointment.reason || '',
      status: appointment.status || 'booked'
    });
    setShowEditModal(true);
  };

  // Update appointment
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAppointment) return;
    
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5001/api/admin/appointments/${editingAppointment._id}`, 
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev: any) => 
        prev.map((appointment: any) => 
          appointment._id === editingAppointment._id ? response.data.appointment : appointment
        )
      );

      toast.success('Appointment updated successfully');
      setShowEditModal(false);
      setEditingAppointment(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete appointment
  const handleDelete = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/admin/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAppointments((prev: any) => prev.filter((a: any) => a._id !== appointmentId));
      toast.success('Appointment deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  // Check-in patient
  const handleCheckIn = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5001/api/admin/appointments/${appointmentId}/checkin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev: any) => 
        prev.map((appointment: any) => 
          appointment._id === appointmentId ? response.data.appointment : appointment
        )
      );

      toast.success('Patient checked in successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to check in patient');
    }
  };

  // Mark as complete
  const handleComplete = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5001/api/admin/appointments/${appointmentId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev: any) => 
        prev.map((appointment: any) => 
          appointment._id === appointmentId ? response.data.appointment : appointment
        )
      );

      toast.success('Appointment marked as completed');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete appointment');
    }
  };

  // Reschedule appointment
  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      date: appointment.date ? new Date(appointment.date).toISOString().split('T')[0] : '',
      time: appointment.time || '',
      reason: appointment.reason || ''
    });
    setShowRescheduleModal(true);
  };

  const submitReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5001/api/admin/appointments/${selectedAppointment._id}/reschedule`,
        rescheduleForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev: any) => 
        prev.map((appointment: any) => 
          appointment._id === selectedAppointment._id ? response.data.appointment : appointment
        )
      );

      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel appointment
  const handleCancel = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const submitCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:5001/api/admin/appointments/${selectedAppointment._id}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev: any) => 
        prev.map((appointment: any) => 
          appointment._id === selectedAppointment._id ? response.data.appointment : appointment
        )
      );

      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // View appointment details
  const handleViewDetails = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/admin/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedAppointment(response.data);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error('Failed to fetch appointment details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const todayQuote = appointmentQuotes[new Date().getDay() % appointmentQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Admin and doctors/appointment-bg.jpg" 
          alt="Appointment Management Background"
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
            <Calendar className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Appointment Management</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-4 p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              title="Refresh appointments"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Daily Quote */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Stethoscope className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-purple-800 font-medium italic">"{todayQuote}"</p>
                <p className="text-purple-600 text-sm mt-2">— Appointment Excellence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{appointmentStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-yellow-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{appointmentStats.booked}</p>
              <p className="text-sm text-gray-600">Booked</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{appointmentStats.checkedIn}</p>
              <p className="text-sm text-gray-600">Checked In</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-green-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{appointmentStats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-red-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{appointmentStats.cancelled}</p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-purple-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{appointmentStats.today}</p>
              <p className="text-sm text-gray-600">Today</p>
            </div>
          </div>
        </div>

        {/* Search, Filters and Add Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search appointments by patient, doctor, reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="booked">Booked</option>
                <option value="checked-in">Checked In</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="past">Past</option>
              </select>

              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  showAdvancedSearch 
                    ? 'bg-purple-50 border-purple-300 text-purple-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                New Appointment
              </button>
            </div>
          </div>

          {/* Advanced Search Component */}
          {showAdvancedSearch && (
            <AdvancedSearch
              searchType="appointments"
              onSearch={handleAdvancedSearch}
            />
          )}
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.map((appointment: any) => (
            <div key={appointment._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {appointment.patientId?.userId?.name} → Dr. {appointment.doctorId?.userId?.name}
                      </h3>
                      <p className="text-gray-600">{appointment.doctorId?.specialization}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    appointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : appointment.status === 'checked-in'
                      ? 'bg-blue-100 text-blue-800'
                      : appointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">
                      {appointment.date ? new Date(appointment.date).toLocaleDateString() : 'Invalid Date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{appointment.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{appointment.patientId?.userId?.email}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Reason for visit:</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{appointment.reason}</p>
                </div>

                {appointment.cancellationReason && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Cancellation reason:</p>
                    <p className="text-red-600 bg-red-50 p-3 rounded-lg">{appointment.cancellationReason}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {/* Status-based action buttons */}
                  {appointment.status === 'booked' && (
                    <button
                      onClick={() => handleCheckIn(appointment._id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      Check In
                    </button>
                  )}

                  {appointment.status === 'checked-in' && (
                    <button
                      onClick={() => handleComplete(appointment._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Mark Complete
                    </button>
                  )}

                  {(appointment.status === 'booked' || appointment.status === 'checked-in') && (
                    <>
                      <button
                        onClick={() => handleReschedule(appointment)}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancel(appointment)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </>
                  )}

                  {/* Always available buttons */}
                  <button
                    onClick={() => handleViewDetails(appointment._id)}
                    className="bg-purple-50 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-100 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>

                  <button
                    onClick={() => handleEdit(appointment)}
                    className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(appointment._id)}
                    className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters' 
                : 'Create your first appointment to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add Appointment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Create New Appointment</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleAddAppointment} className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients?.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.userId?.name} - {patient.userId?.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors?.map((doctor: any) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.userId?.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="booked">Booked</option>
                    <option value="checked-in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Describe the reason for the appointment..."
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Edit Appointment</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Same form fields as Add Appointment Modal */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Patient</label>
                  <select
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Patient</option>
                    {patients?.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.userId?.name} - {patient.userId?.email}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                  <select
                    value={form.doctorId}
                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Doctor</option>
                    {doctors?.map((doctor: any) => (
                      <option key={doctor._id} value={doctor._id}>
                        Dr. {doctor.userId?.name} - {doctor.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <select
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Time</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="09:30">9:30 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="10:30">10:30 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="11:30">11:30 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="14:30">2:30 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="15:30">3:30 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="16:30">4:30 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="booked">Booked</option>
                    <option value="checked-in">Checked In</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Visit</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Reschedule Appointment</h2>
            </div>

            <form onSubmit={submitReschedule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.date}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Time</label>
                <select
                  value={rescheduleForm.time}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, time: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Time</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="09:30">9:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="10:30">10:30 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="15:30">3:30 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="16:30">4:30 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Reason for rescheduling..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRescheduleModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Cancel Appointment</h2>
            </div>

            <form onSubmit={submitCancel} className="p-6 space-y-4">
              <p className="text-gray-600">
                Are you sure you want to cancel the appointment between {selectedAppointment.patientId?.userId?.name} and Dr. {selectedAppointment.doctorId?.userId?.name}?
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cancellation Reason (Optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Please provide a reason for cancellation..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCancelModal(false);
                    setSelectedAppointment(null);
                    setCancelReason('');
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Keep Appointment
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Appointment Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedAppointment(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-blue-800 mb-2">Patient Information</h3>
                  <p><span className="text-gray-600">Name:</span> {selectedAppointment.patientId?.userId?.name}</p>
                  <p><span className="text-gray-600">Email:</span> {selectedAppointment.patientId?.userId?.email}</p>
                  <p><span className="text-gray-600">Phone:</span> {selectedAppointment.patientId?.phone}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-green-800 mb-2">Doctor Information</h3>
                  <p><span className="text-gray-600">Name:</span> Dr. {selectedAppointment.doctorId?.userId?.name}</p>
                  <p><span className="text-gray-600">Specialization:</span> {selectedAppointment.doctorId?.specialization}</p>
                  <p><span className="text-gray-600">Fee:</span> ${selectedAppointment.doctorId?.consultationFee}</p>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-purple-800 mb-2">Appointment Details</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <p><span className="text-gray-600">Date:</span> {new Date(selectedAppointment.date).toLocaleDateString()}</p>
                  <p><span className="text-gray-600">Time:</span> {selectedAppointment.time}</p>
                  <p><span className="text-gray-600">Status:</span> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                      selectedAppointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : selectedAppointment.status === 'checked-in'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedAppointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedAppointment.status}
                    </span>
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 mb-1">Reason for visit:</p>
                  <p className="bg-white p-3 rounded border">{selectedAppointment.reason}</p>
                </div>
              </div>

              {selectedAppointment.cancellationReason && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-bold text-red-800 mb-2">Cancellation Information</h3>
                  <p>{selectedAppointment.cancellationReason}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointment(null);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
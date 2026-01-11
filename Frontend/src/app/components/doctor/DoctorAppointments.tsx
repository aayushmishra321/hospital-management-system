import { useContext, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { Calendar, Clock, User, CheckCircle, Heart, Activity, Edit, X, UserCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate, formatDateForInput } from '../../utils/dateUtils';

export function DoctorAppointments() {
  const doctorContext = useContext(DoctorContext);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ date: '', time: '' });
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doctorContext) {
    return <div>Loading...</div>;
  }

  const { appointments, completeAppointment, rescheduleAppointment, cancelAppointment, checkinPatient, loading } = doctorContext;

  const filteredAppointments = appointments.filter((apt: any) => {
    if (filter === 'all') return true;
    return apt.status === filter;
  });

  // Appointment management quotes
  const appointmentQuotes = [
    "Every appointment is an opportunity to make a difference in someone's life.",
    "Punctuality is the politeness of kings and the duty of doctors.",
    "Time is the most valuable thing we can spend on our patients.",
    "A well-organized schedule leads to better patient care.",
    "Each appointment brings a new story and a chance to heal.",
    "Managing time well means caring for patients better.",
    "Excellence in appointment management reflects excellence in care."
  ];

  const todayQuote = appointmentQuotes[new Date().getDate() % appointmentQuotes.length];

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      await completeAppointment(appointmentId);
      toast.success('Appointment marked as completed');
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleCheckinPatient = async (appointmentId: string) => {
    try {
      await checkinPatient(appointmentId);
      toast.success('Patient checked in successfully');
    } catch (error) {
      toast.error('Failed to check-in patient');
    }
  };

  const handleReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment || !rescheduleForm.date || !rescheduleForm.time) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await rescheduleAppointment(selectedAppointment._id, rescheduleForm.date, rescheduleForm.time);
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
      setRescheduleForm({ date: '', time: '' });
    } catch (error) {
      toast.error('Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setIsSubmitting(true);
    try {
      await cancelAppointment(selectedAppointment._id, cancelReason);
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setSelectedAppointment(null);
      setCancelReason('');
    } catch (error) {
      toast.error('Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/Public/Admin and doctors/appointment-bg.jpg')`
      }}
    >
      <div className="relative z-10 p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center text-white py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Calendar className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">My Appointments</h1>
          <p className="text-lg mb-6">Manage your patient appointments with care and precision</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-white mr-2" />
              <span className="font-semibold">Today's Wisdom</span>
            </div>
            <p className="italic">"{todayQuote}"</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-4">
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All Appointments' },
              { key: 'scheduled', label: 'Scheduled' },
              { key: 'booked', label: 'Booked' },
              { key: 'checked-in', label: 'Checked In' },
              { key: 'completed', label: 'Completed' },
              { key: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === tab.key
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments found</p>
              <p className="text-gray-400">Appointments will appear here once scheduled</p>
            </div>
          ) : (
            filteredAppointments.map((appointment: any) => (
              <div key={appointment._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow hover:shadow-lg transition-all hover:bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{appointment.patientId?.userId?.name}</h3>
                        <p className="text-gray-600">{appointment.patientId?.userId?.email}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'checked-in'
                        ? 'bg-blue-100 text-blue-800'
                        : appointment.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : (appointment.status === 'scheduled' || appointment.status === 'booked')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.status === 'scheduled' ? 'Scheduled' : appointment.status}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{formatDate(appointment.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{appointment.time}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Reason for visit:</p>
                    <p className="text-gray-800">{appointment.reason}</p>
                  </div>

                  {appointment.cancellationReason && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">Cancellation reason:</p>
                      <p className="text-red-600">{appointment.cancellationReason}</p>
                    </div>
                  )}

                  <div className="flex gap-3 flex-wrap">
                    {(appointment.status === 'booked' || appointment.status === 'scheduled') && (
                      <button
                        onClick={() => handleCheckinPatient(appointment._id)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <UserCheck className="w-4 h-4" />
                        Check-in
                      </button>
                    )}

                    {appointment.status === 'checked-in' && (
                      <button
                        onClick={() => handleCompleteAppointment(appointment._id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark Complete
                      </button>
                    )}

                    {(appointment.status === 'booked' || appointment.status === 'scheduled' || appointment.status === 'checked-in') && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setRescheduleForm({ 
                              date: formatDateForInput(appointment.date), 
                              time: appointment.time || ''
                            });
                            setShowRescheduleModal(true);
                          }}
                          className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Reschedule
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAppointment(appointment);
                            setShowCancelModal(true);
                          }}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Appointment Details Modal */}
        {selectedAppointment && !showRescheduleModal && !showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Appointment Details</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{selectedAppointment.patientId?.userId?.name}</h3>
                    <p className="text-gray-600">{selectedAppointment.patientId?.userId?.email}</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">Date</p>
                    <p className="text-gray-600">{formatDate(selectedAppointment.date)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">Time</p>
                    <p className="text-gray-600">{selectedAppointment.time}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800">Reason for Visit</p>
                  <p className="text-gray-600">{selectedAppointment.reason}</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-800">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    selectedAppointment.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : selectedAppointment.status === 'checked-in'
                      ? 'bg-blue-100 text-blue-800'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : (selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'booked')
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedAppointment.status === 'scheduled' ? 'Scheduled' : selectedAppointment.status}
                  </span>
                </div>

                {selectedAppointment.cancellationReason && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-800">Cancellation Reason</p>
                    <p className="text-red-600">{selectedAppointment.cancellationReason}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6 border-b bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Reschedule Appointment</h2>
              </div>
              
              <form onSubmit={handleReschedule} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Date</label>
                  <input
                    type="date"
                    value={rescheduleForm.date}
                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">New Time</label>
                  <input
                    type="time"
                    value={rescheduleForm.time}
                    onChange={(e) => setRescheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelectedAppointment(null);
                      setRescheduleForm({ date: '', time: '' });
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md">
              <div className="p-6 border-b bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Cancel Appointment</h2>
              </div>
              
              <form onSubmit={handleCancel} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cancellation Reason (Optional)</label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCancelModal(false);
                      setSelectedAppointment(null);
                      setCancelReason('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors"
                  >
                    Keep Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
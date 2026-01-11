import { useContext, useState } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { Calendar, Clock, User, MapPin, Star, CheckCircle, AlertCircle, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

const appointmentQuotes = [
  "Consistency in healthcare leads to better outcomes.",
  "Every appointment is a step towards better health.",
  "Your commitment to health appointments shows self-care.",
  "Regular check-ups are investments in your future.",
  "Staying on track with appointments keeps you healthy."
];

export function MyAppointments() {
  const patientContext = useContext(PatientContext);
  
  if (!patientContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src="/Public/Patient/loading.gif" 
          alt="Loading"
          className="w-16 h-16"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/loading.gif';
          }}
        />
      </div>
    );
  }

  const { 
    appointments, 
    loading, 
    rescheduleAppointment, 
    cancelAppointment, 
    getAppointmentReport 
  } = patientContext;

  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: ''
  });
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleForm({
      appointmentDate: new Date(appointment.appointmentDate || appointment.date).toISOString().split('T')[0],
      appointmentTime: appointment.appointmentTime || appointment.time,
      reason: appointment.reason
    });
    setShowRescheduleModal(true);
  };

  const handleCancel = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleViewReport = async (appointment: any) => {
    try {
      const report = await getAppointmentReport(appointment._id);
      // Create a new window to display the report
      const reportWindow = window.open('', '_blank');
      if (reportWindow) {
        reportWindow.document.write(`
          <html>
            <head>
              <title>Appointment Report - ${appointment.doctorId?.userId?.name}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin-bottom: 20px; }
                .label { font-weight: bold; color: #333; }
                .value { margin-left: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>Appointment Report</h1>
                <p><span class="label">Date:</span><span class="value">${new Date(report.appointment.date).toLocaleDateString()}</span></p>
                <p><span class="label">Doctor:</span><span class="value">${report.appointment.doctor.name}</span></p>
              </div>
              <div class="section">
                <h3>Medical Records</h3>
                ${report.medicalRecords.map((record: any) => `
                  <p><span class="label">Diagnosis:</span><span class="value">${record.diagnosis}</span></p>
                  <p><span class="label">Treatment:</span><span class="value">${record.treatment}</span></p>
                `).join('')}
              </div>
              <div class="section">
                <h3>Prescriptions</h3>
                ${report.prescriptions.map((prescription: any) => `
                  <p><span class="label">Medicines:</span><span class="value">${prescription.medicines.join(', ')}</span></p>
                `).join('')}
              </div>
            </body>
          </html>
        `);
        reportWindow.document.close();
      }
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const submitReschedule = async () => {
    if (!selectedAppointment || !rescheduleForm.appointmentDate || !rescheduleForm.appointmentTime) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await rescheduleAppointment(selectedAppointment._id, rescheduleForm);
      toast.success('Appointment rescheduled successfully');
      setShowRescheduleModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error('Failed to reschedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCancel = async () => {
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

  const todayQuote = appointmentQuotes[new Date().getDay() % appointmentQuotes.length];
  
  const upcomingAppointments = appointments.filter((apt: any) => apt.status === 'booked');
  const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed');
  const checkedInAppointments = appointments.filter((apt: any) => apt.status === 'checked-in');

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Patient/patient.jpg" 
          alt="Appointments Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Appointments</h1>
          </div>
          <p className="text-gray-600 mb-4">View and manage your scheduled appointments</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Appointment Motivation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-blue-700">{upcomingAppointments.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-700">{completedAppointments.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-orange-700">{checkedInAppointments.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {appointments.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled</p>
              <p className="text-gray-400">Book your first appointment to get started</p>
              <button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity">
                Book Appointment
              </button>
            </div>
          ) : (
            appointments.map((appointment: any) => (
              <div key={appointment._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{appointment.doctorId?.userId?.name || 'Doctor Name'}</h3>
                        <p className="text-gray-600">{appointment.doctorId?.specialization}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      appointment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : appointment.status === 'checked-in'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status === 'booked' ? 'Scheduled' : 
                       appointment.status === 'checked-in' ? 'In Progress' : 
                       'Completed'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{new Date(appointment.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{appointment.time}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Reason for visit:</p>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{appointment.reason}</p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    {appointment.doctorId?.consultationFee && (
                      <div>
                        <span className="text-sm text-gray-600">Consultation Fee:</span>
                        <span className="font-bold text-green-600 ml-2">${appointment.doctorId.consultationFee}</span>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {appointment.status === 'scheduled' && (
                        <>
                          <button 
                            onClick={() => handleReschedule(appointment)}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancel(appointment)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </>
                      )}
                      {appointment.status === 'completed' && (
                        <button 
                          onClick={() => handleViewReport(appointment)}
                          className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                        >
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Reschedule Appointment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleForm.appointmentDate}
                  onChange={e => setRescheduleForm(prev => ({ ...prev, appointmentDate: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Time</label>
                <select
                  value={rescheduleForm.appointmentTime}
                  onChange={e => setRescheduleForm(prev => ({ ...prev, appointmentTime: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  <option value="09:00 AM">9:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="02:00 PM">2:00 PM</option>
                  <option value="03:00 PM">3:00 PM</option>
                  <option value="04:00 PM">4:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Reason (Optional)</label>
                <textarea
                  value={rescheduleForm.reason}
                  onChange={e => setRescheduleForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Reason for rescheduling..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitReschedule}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Cancel Appointment</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel your appointment with Dr. {selectedAppointment?.doctorId?.userId?.name}?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Reason for cancellation (Optional)</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                rows={3}
                placeholder="Please let us know why you're cancelling..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Keep Appointment
              </button>
              <button
                onClick={submitCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useContext, useState } from 'react';
import React from 'react';
import { ReceptionistContext } from '../../context/ReceptionistContext';
import { toast } from 'sonner';
import { Calendar, Clock, Stethoscope, Star, CheckCircle, AlertCircle } from 'lucide-react';

const appointmentQuotes = [
  "Scheduling care is scheduling hope for better health.",
  "Every appointment is a step towards healing.",
  "Coordination today creates comfort tomorrow.",
  "Your organization brings order to their healthcare journey.",
  "Perfect timing can make all the difference in healing."
];

export function ScheduleAppointment() {
  const receptionistContext = useContext(ReceptionistContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<string>('');

  if (!receptionistContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <img 
          src="/Public/Admin and doctors/loading.gif" 
          alt="Loading"
          className="w-16 h-16"
        />
      </div>
    );
  }

  const { patients, doctors, bookAppointment, checkDoctorAvailability } = receptionistContext;

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  // Check availability when doctor, date, or time changes
  const checkAvailability = async () => {
    if (form.doctorId && form.date && form.time) {
      const isAvailable = await checkDoctorAvailability(form.doctorId, form.date, form.time);
      setAvailabilityStatus(isAvailable ? 'available' : 'unavailable');
    } else {
      setAvailabilityStatus('');
    }
  };

  // Check availability when relevant fields change
  React.useEffect(() => {
    checkAvailability();
  }, [form.doctorId, form.date, form.time]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.patientId || !form.doctorId || !form.date || !form.time || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    // Check availability before booking
    const isAvailable = await checkDoctorAvailability(form.doctorId, form.date, form.time);
    if (!isAvailable) {
      toast.error('This time slot is not available. Please choose a different time.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookAppointment({
        patientId: form.patientId,
        doctorId: form.doctorId,
        date: form.date,
        time: form.time,
        reason: form.reason
      });

      toast.success('Appointment scheduled successfully');
      setForm({
        patientId: '',
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      });
      setAvailabilityStatus('');
    } catch (error) {
      toast.error('Failed to schedule appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const todayQuote = appointmentQuotes[new Date().getDay() % appointmentQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Admin and doctors/doc.png" 
          alt="Appointment Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/receptionist/receptionist.webp';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Schedule Appointment</h1>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Scheduling Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Select Patient *</label>
              <select
                value={form.patientId}
                onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                required
              >
                <option value="">Choose a patient</option>
                {patients.map((patient: any) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.userId?.name} - {patient.userId?.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Select Doctor *</label>
              <select
                value={form.doctorId}
                onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                required
              >
                <option value="">Choose a doctor</option>
                {doctors.map((doctor: any) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.userId?.name} - {doctor.specialization} (${doctor.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Time *</label>
                <select
                  value={form.time}
                  onChange={e => setForm({ ...form, time: e.target.value })}
                  className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                  required
                >
                  <option value="">Select time</option>
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
                
                {/* Availability Status */}
                {availabilityStatus && (
                  <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 ${
                    availabilityStatus === 'available' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {availabilityStatus === 'available' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Time slot available</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Time slot not available</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">Reason for Visit *</label>
              <textarea
                placeholder="Describe the reason for the appointment"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || availabilityStatus === 'unavailable'}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useContext, useState, useEffect } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { toast } from 'sonner';
import api from '../../services/api';
import { getDepartmentImage } from '../../utils/departmentImages';
import { Calendar, Clock, Stethoscope, Star, User } from 'lucide-react';

const appointmentQuotes = [
  "The first step towards getting somewhere is to decide you're not going to stay where you are.",
  "Your health is an investment, not an expense.",
  "Prevention is better than cure - book your appointment today.",
  "Taking care of yourself is the best selfish thing you can do.",
  "A healthy outside starts from the inside."
];

export function BookAppointment() {
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

  const { bookAppointment, checkDoctorAvailability } = patientContext;
  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    doctorId: '',
    date: '',
    time: '',
    reason: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingDoctors(true);
        setError(null);
        
        const [doctorsRes, departmentsRes] = await Promise.all([
          api.get('/doctor/available'),
          api.get('/admin/departments')
        ]);
        
        console.log('Doctors loaded:', doctorsRes.data);
        setDoctors(doctorsRes.data);
        
        if (doctorsRes.data.length === 0) {
          setError('No doctors available. Please contact admin.');
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchData();
  }, []);

  // Check doctor availability when doctor and date are selected
  useEffect(() => {
    let isCancelled = false;
    
    const fetchAvailability = async () => {
      if (form.doctorId && form.date) {
        try {
          setLoadingSlots(true);
          setError(null);
          
          const availability = await checkDoctorAvailability(form.doctorId, form.date);
          
          // Only update state if this effect hasn't been cancelled
          if (!isCancelled) {
            setAvailableSlots(availability.availableSlots || []);
            
            // Clear selected time if it's no longer available
            if (form.time && !availability.availableSlots.includes(form.time)) {
              setForm(prev => ({ ...prev, time: '' }));
            }
          }
        } catch (error) {
          console.error('Failed to check availability:', error);
          if (!isCancelled) {
            setAvailableSlots([]);
            setError('Failed to check doctor availability. Please try again.');
          }
        } finally {
          if (!isCancelled) {
            setLoadingSlots(false);
          }
        }
      } else {
        setAvailableSlots([]);
        setLoadingSlots(false);
      }
    };

    fetchAvailability();
    
    // Cleanup function to cancel the effect if dependencies change
    return () => {
      isCancelled = true;
    };
  }, [form.doctorId, form.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.doctorId || !form.date || !form.time || !form.reason) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      toast.error('Please select a future date');
      return;
    }

    if (!availableSlots.includes(form.time)) {
      toast.error('Selected time slot is no longer available');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('=== BOOKING APPOINTMENT ===');
      console.log('Form data:', form);
      
      await bookAppointment({
        doctorId: form.doctorId,
        appointmentDate: form.date,
        appointmentTime: form.time,
        reason: form.reason
      });

      toast.success('Appointment booked successfully! You will receive a confirmation notification.');
      setForm({
        doctorId: '',
        date: '',
        time: '',
        reason: ''
      });
      setAvailableSlots([]);
    } catch (error) {
      console.error('Appointment booking error:', error);
      toast.error('Failed to book appointment. Please try again.');
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
          src="/Public/Patient/patient.jpg" 
          alt="Book Appointment Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 to-blue-50/90"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Book Appointment</h1>
          </div>
          <p className="text-gray-600 mb-4">Schedule your visit with our expert doctors</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-sm">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Health Motivation</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <Stethoscope className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Appointment Details</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-3 text-gray-700">Select Doctor *</label>
              {loadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                  <span className="ml-2 text-gray-600">Loading doctors...</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-1 gap-4 mb-4 max-h-64 overflow-y-auto">
                  {doctors.map((doctor: any) => (
                    <div
                      key={doctor._id}
                      onClick={() => setForm({ ...form, doctorId: doctor._id })}
                      className={`cursor-pointer border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                        form.doctorId === doctor._id
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 hover:border-green-300 bg-white/80'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getDepartmentImage(doctor.specialization)}
                          alt={doctor.specialization}
                          className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/doc.png';
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-gray-500" />
                            <h3 className="font-semibold text-gray-800">{doctor.userId?.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{doctor.specialization}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-green-600">${doctor.consultationFee}</p>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {doctor.experience || 0} years exp.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {doctors.length === 0 && !loadingDoctors && !error && (
                <p className="text-sm text-gray-500 mt-1 text-center py-4">No doctors available</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-green-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Time *</label>
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Checking availability...</span>
                  </div>
                ) : (
                  <select
                    value={form.time}
                    onChange={e => setForm({ ...form, time: e.target.value })}
                    className="w-full border border-green-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
                    required
                    disabled={!form.doctorId || !form.date}
                  >
                    <option value="">
                      {!form.doctorId || !form.date 
                        ? 'Select doctor and date first' 
                        : availableSlots.length === 0 
                        ? 'No available slots' 
                        : 'Select time'
                      }
                    </option>
                    {availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                )}
                {form.doctorId && form.date && availableSlots.length === 0 && !loadingSlots && (
                  <p className="text-sm text-red-600 mt-1">
                    No available slots for this date. Please select a different date.
                  </p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="reason-for-visit" className="block text-sm font-medium mb-2 text-gray-700">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason-for-visit"
                placeholder="e.g., Annual checkup, flu symptoms, follow-up visit"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                className="w-full border border-green-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
                rows={4}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !form.doctorId || availableSlots.length === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isSubmitting ? 'Booking...' : 'Book Appointment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
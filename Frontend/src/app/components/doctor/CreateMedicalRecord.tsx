import { useContext, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { FileText, Heart, Activity, Stethoscope } from 'lucide-react';
import { toast } from 'sonner';

export function CreateMedicalRecord() {
  const doctorContext = useContext(DoctorContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!doctorContext) {
    return <div>Loading...</div>;
  }

  const { addMedicalRecord, appointments } = doctorContext;

  const [form, setForm] = useState({
    appointmentId: '',
    patientId: '',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: '',
    vitals: {
      bloodPressure: '',
      temperature: '',
      heartRate: '',
      weight: '',
      height: ''
    },
    followUpDate: ''
  });

  // Medical record creation quotes
  const recordQuotes = [
    "Every medical record is a chapter in someone's healing journey.",
    "Accurate documentation today ensures better care tomorrow.",
    "In medicine, every detail matters and every record counts.",
    "Creating records is creating hope for future healing.",
    "Good documentation is the foundation of excellent patient care.",
    "Each record tells a story of compassion and medical expertise.",
    "Precision in documentation reflects precision in care."
  ];

  const todayQuote = recordQuotes[new Date().getDate() % recordQuotes.length];

  // Get completed appointments for selection
  const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed');

  const handleAppointmentChange = (appointmentId: string) => {
    const appointment = appointments.find((apt: any) => apt._id === appointmentId);
    setForm({
      ...form,
      appointmentId,
      patientId: appointment?.patientId?._id || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.appointmentId || !form.patientId || !form.diagnosis) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addMedicalRecord({
        ...form,
        symptoms: form.symptoms.split(',').map(s => s.trim()).filter(s => s),
        vitals: Object.fromEntries(
          Object.entries(form.vitals).filter(([_, value]) => value !== '')
        )
      });

      toast.success('Medical record created successfully');
      setForm({
        appointmentId: '',
        patientId: '',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: '',
        vitals: {
          bloodPressure: '',
          temperature: '',
          heartRate: '',
          weight: '',
          height: ''
        },
        followUpDate: ''
      });
    } catch (error) {
      toast.error('Failed to create medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/Public/Admin and doctors/create-record-bg.jpg')`
      }}
    >
      <div className="relative z-10 p-6">
        {/* Header Section */}
        <div className="text-center text-white py-8 mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Create Medical Record</h1>
          <p className="text-lg mb-6">Document patient care with precision and compassion</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-white mr-2" />
              <span className="font-semibold">Documentation Wisdom</span>
            </div>
            <p className="italic">"{todayQuote}"</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-purple-600" />
                  Select Appointment *
                </label>
                <select
                  value={form.appointmentId}
                  onChange={e => handleAppointmentChange(e.target.value)}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="">Choose a completed appointment</option>
                  {completedAppointments.map((appointment: any) => (
                    <option key={appointment._id} value={appointment._id}>
                      {appointment.patientId?.name} - {appointment.date} at {appointment.time}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="diagnosis" className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  id="diagnosis"
                  type="text"
                  placeholder="e.g., Acute bronchitis"
                  value={form.diagnosis}
                  onChange={e => setForm({ ...form, diagnosis: e.target.value })}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="symptoms" className="block text-sm font-medium mb-2">Symptoms</label>
                <input
                  id="symptoms"
                  type="text"
                  placeholder="e.g., fever, headache, cough"
                  value={form.symptoms}
                  onChange={e => setForm({ ...form, symptoms: e.target.value })}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label htmlFor="treatment" className="block text-sm font-medium mb-2">Treatment</label>
                <textarea
                  id="treatment"
                  placeholder="e.g., Rest, fluids, prescribed medications"
                  value={form.treatment}
                  onChange={e => setForm({ ...form, treatment: e.target.value })}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Vital Signs
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="blood-pressure" className="block text-sm font-medium mb-1 text-gray-600">
                      Blood Pressure
                    </label>
                    <input
                      id="blood-pressure"
                      type="text"
                      placeholder="e.g., 120/80"
                      value={form.vitals.bloodPressure}
                      onChange={e => setForm({ ...form, vitals: { ...form.vitals, bloodPressure: e.target.value } })}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="temperature" className="block text-sm font-medium mb-1 text-gray-600">
                      Temperature (°F)
                    </label>
                    <input
                      id="temperature"
                      type="number"
                      placeholder="e.g., 98.6"
                      value={form.vitals.temperature}
                      onChange={e => setForm({ ...form, vitals: { ...form.vitals, temperature: e.target.value } })}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="heart-rate" className="block text-sm font-medium mb-1 text-gray-600">
                      Heart Rate (bpm)
                    </label>
                    <input
                      id="heart-rate"
                      type="number"
                      placeholder="e.g., 72"
                      value={form.vitals.heartRate}
                      onChange={e => setForm({ ...form, vitals: { ...form.vitals, heartRate: e.target.value } })}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="weight" className="block text-sm font-medium mb-1 text-gray-600">
                      Weight (lbs)
                    </label>
                    <input
                      id="weight"
                      type="number"
                      placeholder="e.g., 150"
                      value={form.vitals.weight}
                      onChange={e => setForm({ ...form, vitals: { ...form.vitals, weight: e.target.value } })}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    />
                  </div>
                  <div>
                    <label htmlFor="height" className="block text-sm font-medium mb-1 text-gray-600">
                      Height (inches)
                    </label>
                    <input
                      id="height"
                      type="number"
                      placeholder="e.g., 68"
                      value={form.vitals.height}
                      onChange={e => setForm({ ...form, vitals: { ...form.vitals, height: e.target.value } })}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium mb-2">Additional Notes</label>
                <textarea
                  id="notes"
                  placeholder="Any additional observations or notes"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                <input
                  type="date"
                  value={form.followUpDate}
                  onChange={e => setForm({ ...form, followUpDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
              >
                {isSubmitting ? 'Creating...' : 'Create Medical Record'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
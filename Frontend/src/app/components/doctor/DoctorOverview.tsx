import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DoctorContext } from '../../context/DoctorContext';
import { Calendar, Users, FileText, Stethoscope, Heart, Activity } from 'lucide-react';
import { isToday, formatDate } from '../../utils/dateUtils';

export function DoctorOverview() {
  const { user } = useContext(AuthContext);
  const doctorContext = useContext(DoctorContext);

  if (!doctorContext) {
    return <div>Loading...</div>;
  }

  const { appointments, prescriptions, medicalRecords, loading } = doctorContext;

  const todayAppointments = appointments.filter((apt: any) => isToday(apt.date));

  const completedAppointments = appointments.filter((apt: any) => apt.status === 'completed');
  const uniquePatients = new Set(appointments.map((apt: any) => apt.patientId)).size;

  // Medical quotes for inspiration
  const medicalQuotes = [
    "The good physician treats the disease; the great physician treats the patient who has the disease.",
    "Medicine is not only a science; it is also an art. It does not consist of compounding pills and plasters.",
    "The art of medicine consists of amusing the patient while nature cures the disease.",
    "Wherever the art of medicine is loved, there is also a love of humanity.",
    "To cure sometimes, to relieve often, to comfort always.",
    "The best doctor gives the least medicines.",
    "Medicine is a science of uncertainty and an art of probability."
  ];

  const todayQuote = medicalQuotes[new Date().getDate() % medicalQuotes.length];

  const stats = [
    { icon: Calendar, label: "Today's Appointments", value: todayAppointments.length, color: 'bg-blue-500' },
    { icon: Users, label: 'Total Patients', value: uniquePatients, color: 'bg-green-500' },
    { icon: FileText, label: 'Medical Records', value: medicalRecords.length, color: 'bg-orange-500' },
    { icon: Stethoscope, label: 'Prescriptions', value: prescriptions.length, color: 'bg-purple-500' },
  ];

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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/Public/Admin and doctors/doctor-hero.jpg')`
      }}
    >
      <div className="relative z-10 p-6 space-y-6">
        {/* Hero Section */}
        <div className="text-center text-white py-12">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Welcome, Dr. {user?.name}
          </h1>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Your dedication to healing makes a difference in every life you touch
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Activity className="w-6 h-6 text-white mr-2" />
              <span className="text-lg font-semibold">Daily Inspiration</span>
            </div>
            <p className="text-lg italic">"{todayQuote}"</p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:bg-white">
                <div className={`${stat.color} p-3 rounded-lg w-fit mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-gray-600 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Today's Appointments */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">Today's Appointments</h2>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No appointments scheduled for today</p>
              <p className="text-gray-400">Enjoy your peaceful day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.slice(0, 5).map((apt: any) => (
                <div key={apt._id} className="flex items-center justify-between p-4 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors">
                  <div>
                    <p className="font-medium text-gray-800">{apt.patientId?.userId?.name}</p>
                    <p className="text-sm text-gray-600">{apt.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">{apt.time}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      apt.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : apt.status === 'checked-in'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Prescriptions</h3>
            {prescriptions.length === 0 ? (
              <div className="text-center py-6">
                <Stethoscope className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No prescriptions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.slice(0, 3).map((prescription: any) => (
                  <div key={prescription._id} className="p-3 bg-gray-50/80 rounded-lg">
                    <p className="font-medium text-gray-800">{prescription.patientId?.userId?.name}</p>
                    <p className="text-sm text-gray-600">{prescription.medicines.join(', ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-800">Recent Medical Records</h3>
            {medicalRecords.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No medical records yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.slice(0, 3).map((record: any) => (
                  <div key={record._id} className="p-3 bg-gray-50/80 rounded-lg">
                    <p className="font-medium text-gray-800">{record.patientId?.name}</p>
                    <p className="text-sm text-gray-600">{record.diagnosis}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/doctor/appointments"
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
            >
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Manage Appointments</p>
                <p className="text-sm text-gray-600">View and update appointments</p>
              </div>
            </a>

            <a
              href="/doctor/create-record"
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
            >
              <div className="bg-green-600 p-2 rounded-lg group-hover:bg-green-700 transition-colors">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Create Medical Record</p>
                <p className="text-sm text-gray-600">Document patient care</p>
              </div>
            </a>

            <a
              href="/doctor/prescriptions"
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
            >
              <div className="bg-purple-600 p-2 rounded-lg group-hover:bg-purple-700 transition-colors">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-800">Manage Prescriptions</p>
                <p className="text-sm text-gray-600">Create and edit prescriptions</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { PatientContext } from '../../context/PatientContext';
import { Calendar, Pill, FileText, Heart, Star, Activity } from 'lucide-react';

const patientQuotes = [
  "Your health is your wealth - invest in it wisely.",
  "Every step towards better health is a step towards a better life.",
  "Healing is a matter of time, but it is sometimes also a matter of opportunity.",
  "Take care of your body. It's the only place you have to live.",
  "Health is not about the weight you lose, but about the life you gain."
];

export function PatientOverview() {
  const navigate = useNavigate();
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
  
  const { appointments, prescriptions, medicalRecords, billing, loading } = patientContext;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const upcoming = appointments.filter((a: any) => a.status === 'booked');
  const completed = appointments.filter((a: any) => a.status === 'completed');
  const unpaidBills = billing.filter((b: any) => b.paymentStatus === 'unpaid');
  
  // Calculate health score based on activity
  const healthScore = Math.min(100, Math.max(0, 
    (completed.length * 10) + 
    (prescriptions.length * 5) + 
    (medicalRecords.length * 8) - 
    (unpaidBills.length * 5) + 50
  ));

  const stats = [
    { 
      icon: Calendar, 
      label: 'Upcoming Appointments', 
      value: upcoming.length,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      icon: Pill, 
      label: 'Active Prescriptions', 
      value: prescriptions.length,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      icon: FileText, 
      label: 'Medical Records', 
      value: medicalRecords.length,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      icon: Activity, 
      label: 'Health Score', 
      value: `${healthScore}%`,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const todayQuote = patientQuotes[new Date().getDay() % patientQuotes.length];

  return (
    <div className="space-y-6">
      {/* Hero Section with Patient Background */}
      <div className="relative bg-gradient-to-r from-green-600 to-teal-600 rounded-xl overflow-hidden min-h-[300px]">
        <div className="absolute inset-0">
          <img 
            src="/Public/Patient/patient.jpg" 
            alt="Patient Portal"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-teal-600/80"></div>
        </div>
        <div className="relative p-8 flex flex-col justify-center min-h-[300px]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-white" />
              <span className="text-white/90 font-medium">Welcome to Your Health Portal</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">Your Health Journey</h1>
            <p className="text-xl text-white/90 mb-6">
              Manage your appointments, prescriptions, and medical records all in one place
            </p>
            
            {/* Daily Quote */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="flex items-start gap-3">
                <Star className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium italic">"{todayQuote}"</p>
                  <p className="text-white/80 text-sm mt-2">— Health Inspiration</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className={`${stat.color} p-4`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-green-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/book')}
              className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-800">Book New Appointment</div>
              <div className="text-sm text-green-600">Schedule a visit with your doctor</div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/prescriptions')}
              className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-800">View Prescriptions</div>
              <div className="text-sm text-blue-600">Check your current medications</div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/history')}
              className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-800">Medical History</div>
              <div className="text-sm text-purple-600">Review your health records</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-orange-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((apt: any) => (
              <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Dr. {apt.doctorId?.userId?.name}</div>
                  <div className="text-sm text-gray-600">{apt.doctorId?.specialization}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{new Date(apt.date).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-500">{apt.time}</div>
                </div>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500">No upcoming appointments</p>
                <p className="text-sm text-gray-400">Book your next appointment to stay healthy</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Summary */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-600" />
          Health Summary
        </h2>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
            <div className="text-sm text-blue-600">Total Visits</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{completed.length}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{prescriptions.length}</div>
            <div className="text-sm text-purple-600">Prescriptions</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{healthScore}%</div>
            <div className="text-sm text-orange-600">Health Score</div>
          </div>
        </div>
      </div>
    </div>
  );
}
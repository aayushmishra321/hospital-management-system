import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceptionistContext } from '../../context/ReceptionistContext';
import { Users, Calendar, CheckCircle, Clock, Heart, Smile, UserCheck } from 'lucide-react';

const receptionistQuotes = [
  "A warm smile is the universal language of kindness.",
  "Every patient deserves to feel welcomed and cared for.",
  "The first impression sets the tone for healing.",
  "Compassion is the best medicine we can offer.",
  "Your kindness can brighten someone's darkest day."
];

export function ReceptionistOverview() {
  const navigate = useNavigate();
  const receptionistContext = useContext(ReceptionistContext);
  
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
  
  const { appointments, patients } = receptionistContext;

  const checkedIn = appointments.filter((a: any) => a.status === 'checked-in').length;
  const inQueue = appointments.filter((a: any) => a.status === 'booked').length;

  const stats = [
    { 
      icon: Calendar, 
      label: "Today's Appointments", 
      value: appointments.length,
      color: 'bg-gradient-to-br from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    { 
      icon: Users, 
      label: 'Registered Patients', 
      value: patients.length,
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    { 
      icon: UserCheck, 
      label: 'Checked In', 
      value: checkedIn,
      color: 'bg-gradient-to-br from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    { 
      icon: Clock, 
      label: 'In Queue', 
      value: inQueue,
      color: 'bg-gradient-to-br from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const todayQuote = receptionistQuotes[new Date().getDay() % receptionistQuotes.length];

  return (
    <div className="space-y-6">
      {/* Hero Section with Receptionist Background */}
      <div className="relative bg-gradient-to-r from-orange-600 to-red-600 rounded-xl overflow-hidden min-h-[300px]">
        <div className="absolute inset-0">
          <img 
            src="/Public/receptionist/receptionist.webp" 
            alt="Receptionist Portal"
            className="w-full h-full object-cover opacity-30"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/Public/receptionist/receptionisr h.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600/80 to-red-600/80"></div>
        </div>
        <div className="relative p-8 flex flex-col justify-center min-h-[300px]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="w-8 h-8 text-white" />
              <span className="text-white/90 font-medium">Welcome Back</span>
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white">Receptionist Dashboard</h1>
            <p className="text-xl text-white/90 mb-6">
              The heart of patient care - where every interaction matters
            </p>
            
            {/* Daily Quote */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30">
              <div className="flex items-start gap-3">
                <Smile className="w-6 h-6 text-white mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium italic">"{todayQuote}"</p>
                  <p className="text-white/80 text-sm mt-2">— Daily Inspiration</p>
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-orange-600" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/dashboard/register')}
              className="w-full text-left p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="font-medium text-orange-800">Register New Patient</div>
              <div className="text-sm text-orange-600">Add a new patient to the system</div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/schedule')}
              className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <div className="font-medium text-blue-800">Schedule Appointment</div>
              <div className="text-sm text-blue-600">Book appointment for existing patient</div>
            </button>
            <button 
              onClick={() => navigate('/dashboard/queue')}
              className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
            >
              <div className="font-medium text-green-800">Manage Queue</div>
              <div className="text-sm text-green-600">Check-in patients and manage waiting list</div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-600" />
            Today's Schedule
          </h3>
          <div className="space-y-3">
            {appointments.slice(0, 4).map((apt: any, index: number) => (
              <div key={apt._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">{apt.patientId?.name}</div>
                  <div className="text-sm text-gray-600">Dr. {apt.doctorId?.userId?.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{apt.time}</div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                    apt.status === 'checked-in' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {apt.status}
                  </span>
                </div>
              </div>
            ))}
            {appointments.length === 0 && (
              <p className="text-gray-500 text-center py-4">No appointments scheduled</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

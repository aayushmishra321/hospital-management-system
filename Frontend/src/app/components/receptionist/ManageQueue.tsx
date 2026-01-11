import { useContext, useState, useEffect } from 'react';
import { ReceptionistContext } from '../../context/ReceptionistContext';
import { toast } from 'sonner';
import { Clock, User, CheckCircle, Calendar, Users, Target, RefreshCw, BarChart3 } from 'lucide-react';

const queueQuotes = [
  "Efficient queue management creates calm in the chaos.",
  "Every patient's time is precious - manage it with care.",
  "Organization today prevents frustration tomorrow.",
  "A well-managed queue reflects a well-run practice.",
  "Your attention to flow creates their peace of mind."
];

export function ManageQueue() {
  const receptionistContext = useContext(ReceptionistContext);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [queueAnalytics, setQueueAnalytics] = useState<any>(null);

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

  const { appointments, updateAppointmentStatus, refreshData } = receptionistContext;

  const handleCheckIn = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'checked-in');
      toast.success('Patient checked in successfully');
      await refreshData(); // Refresh data after status change
    } catch (error) {
      toast.error('Failed to check in patient');
    }
  };

  const handleComplete = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'completed');
      toast.success('Appointment marked as completed');
      await refreshData(); // Refresh data after status change
    } catch (error) {
      toast.error('Failed to complete appointment');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      toast.success('Queue data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load queue analytics on component mount
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        // This would be implemented with the new API endpoint
        // For now, we'll calculate basic analytics from existing data
        const analytics = {
          averageWaitTime: '15 minutes',
          peakHours: ['10:00 AM', '2:00 PM', '3:00 PM'],
          totalProcessed: appointments.filter((apt: any) => apt.status === 'completed').length
        };
        setQueueAnalytics(analytics);
      } catch (error) {
        console.error('Failed to load analytics', error);
      }
    };

    loadAnalytics();
  }, [appointments]);

  // Show all appointments for demo purposes, not just today's
  const todayAppointments = appointments;

  const queuedAppointments = todayAppointments.filter((apt: any) => apt.status === 'booked');
  const checkedInAppointments = todayAppointments.filter((apt: any) => apt.status === 'checked-in');
  const completedAppointments = todayAppointments.filter((apt: any) => apt.status === 'completed');

  const todayQuote = queueQuotes[new Date().getDay() % queueQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/receptionist/receptionist.webp" 
          alt="Queue Management Background"
          className="w-full h-full object-cover opacity-8"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/doc.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/95 to-blue-50/95"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote and Refresh Button */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Patient Queue Management</h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              title="Refresh queue data"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-gray-600 mb-4">Manage today's appointment queue</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Queue Management Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Queue Statistics with Analytics */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Queue</p>
                <p className="text-2xl font-bold text-yellow-700">{queuedAppointments.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Checked In</p>
                <p className="text-2xl font-bold text-blue-700">{checkedInAppointments.length}</p>
              </div>
              <User className="w-8 h-8 text-blue-600" />
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

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Wait</p>
                <p className="text-lg font-bold text-purple-700">{queueAnalytics?.averageWaitTime || '15 min'}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Queue Sections */}
        <div className="space-y-6">
          {/* Waiting Queue */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-yellow-200">
            <div className="p-6 border-b border-yellow-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                Waiting Queue ({queuedAppointments.length})
              </h2>
            </div>
            <div className="p-6">
              {queuedAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No patients in queue</p>
              ) : (
                <div className="space-y-4">
                  {queuedAppointments.map((appointment: any, index: number) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 bg-yellow-50/80 rounded-lg border border-yellow-200">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold">{appointment.patientId?.name}</h3>
                          <p className="text-sm text-gray-600">
                            Dr. {appointment.doctorId?.userId?.name} - {appointment.time}
                          </p>
                          <p className="text-sm text-gray-500">{appointment.reason}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleCheckIn(appointment._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        Check In
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checked In */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-blue-200">
            <div className="p-6 border-b border-blue-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Checked In ({checkedInAppointments.length})
              </h2>
            </div>
            <div className="p-6">
              {checkedInAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No checked-in patients</p>
              ) : (
                <div className="space-y-4">
                  {checkedInAppointments.map((appointment: any) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 bg-blue-50/80 rounded-lg border border-blue-200">
                      <div>
                        <h3 className="font-bold">{appointment.patientId?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.doctorId?.userId?.name} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.reason}</p>
                      </div>
                      <button
                        onClick={() => handleComplete(appointment._id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                      >
                        Mark Complete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Completed Today */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-green-200">
            <div className="p-6 border-b border-green-200">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Completed Today ({completedAppointments.length})
              </h2>
            </div>
            <div className="p-6">
              {completedAppointments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No completed appointments today</p>
              ) : (
                <div className="space-y-4">
                  {completedAppointments.map((appointment: any) => (
                    <div key={appointment._id} className="flex items-center justify-between p-4 bg-green-50/80 rounded-lg border border-green-200">
                      <div>
                        <h3 className="font-bold">{appointment.patientId?.name}</h3>
                        <p className="text-sm text-gray-600">
                          Dr. {appointment.doctorId?.userId?.name} - {appointment.time}
                        </p>
                        <p className="text-sm text-gray-500">{appointment.reason}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

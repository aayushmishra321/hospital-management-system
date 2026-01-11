import { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  appointmentId?: string;
}

interface DaySchedule {
  dayOfWeek: string;
  isWorkingDay: boolean;
  startTime: string;
  endTime: string;
  slotDuration: number;
  breakTimes: Array<{
    startTime: string;
    endTime: string;
    reason: string;
  }>;
  timeSlots: TimeSlot[];
}

interface Exception {
  _id?: string;
  date: string;
  type: 'leave' | 'vacation' | 'sick' | 'conference' | 'emergency' | 'custom';
  reason: string;
  isFullDay: boolean;
  startTime?: string;
  endTime?: string;
}

interface DoctorScheduleData {
  _id: string;
  doctorId: string;
  weeklySchedule: DaySchedule[];
  exceptions: Exception[];
  preferences: {
    maxAppointmentsPerDay: number;
    bufferTime: number;
    allowOnlineBooking: boolean;
    advanceBookingDays: number;
  };
}

export function DoctorSchedule() {
  const [schedule, setSchedule] = useState<DoctorScheduleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'exceptions' | 'preferences'>('schedule');
  const [newException, setNewException] = useState<Exception>({
    date: '',
    type: 'leave',
    reason: '',
    isFullDay: true
  });

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const exceptionTypes = [
    { value: 'leave', label: 'Leave', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vacation', label: 'Vacation', color: 'bg-blue-100 text-blue-800' },
    { value: 'sick', label: 'Sick Leave', color: 'bg-red-100 text-red-800' },
    { value: 'conference', label: 'Conference', color: 'bg-purple-100 text-purple-800' },
    { value: 'emergency', label: 'Emergency', color: 'bg-orange-100 text-orange-800' },
    { value: 'custom', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Get doctor ID from user context or find doctor by userId
      let doctorId = user.doctorId;
      
      if (!doctorId) {
        // If doctorId is not in user object, fetch it from the doctor endpoint
        try {
          const doctorResponse = await fetch('http://localhost:5001/api/doctor/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (doctorResponse.ok) {
            const doctorData = await doctorResponse.json();
            doctorId = doctorData._id;
            
            // Update localStorage with doctorId for future use
            const updatedUser = { ...user, doctorId };
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            const errorData = await doctorResponse.json();
            throw new Error(errorData.message || 'Could not find doctor profile');
          }
        } catch (profileError) {
          console.error('Error fetching doctor profile:', profileError);
          toast.error('Could not load doctor profile. Please contact support.');
          return;
        }
      }
      
      if (!doctorId) {
        toast.error('Doctor profile not found. Please contact support.');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/schedule/doctor/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
        toast.success('Schedule loaded successfully');
      } else {
        const errorData = await response.json();
        console.error('Schedule fetch error:', errorData);
        toast.error(errorData.message || 'Failed to load schedule');
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateSchedule = async () => {
    if (!schedule) return;

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/schedule/doctor/${schedule.doctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          weeklySchedule: schedule.weeklySchedule,
          preferences: schedule.preferences
        })
      });

      if (response.ok) {
        toast.success('Schedule updated successfully');
        fetchSchedule(); // Refresh data
      } else {
        const errorData = await response.json();
        console.error('Schedule update error:', errorData);
        toast.error(errorData.message || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast.error('Error updating schedule');
    } finally {
      setSaving(false);
    }
  };

  const updateDaySchedule = (dayIndex: number, field: string, value: any) => {
    if (!schedule) return;

    const updatedSchedule = { ...schedule };
    updatedSchedule.weeklySchedule[dayIndex] = {
      ...updatedSchedule.weeklySchedule[dayIndex],
      [field]: value
    };

    setSchedule(updatedSchedule);
  };

  const addBreakTime = (dayIndex: number) => {
    if (!schedule) return;

    const updatedSchedule = { ...schedule };
    updatedSchedule.weeklySchedule[dayIndex].breakTimes.push({
      startTime: '12:00',
      endTime: '13:00',
      reason: 'Break'
    });

    setSchedule(updatedSchedule);
  };

  const removeBreakTime = (dayIndex: number, breakIndex: number) => {
    if (!schedule) return;

    const updatedSchedule = { ...schedule };
    updatedSchedule.weeklySchedule[dayIndex].breakTimes.splice(breakIndex, 1);

    setSchedule(updatedSchedule);
  };

  const addException = async () => {
    if (!newException.date || !newException.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/schedule/doctor/${schedule?.doctorId}/exceptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newException)
      });

      if (response.ok) {
        toast.success('Exception added successfully');
        setNewException({
          date: '',
          type: 'leave',
          reason: '',
          isFullDay: true
        });
        fetchSchedule();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add exception');
      }
    } catch (error) {
      console.error('Error adding exception:', error);
      toast.error('Error adding exception');
    }
  };

  const removeException = async (exceptionId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:5001/api/schedule/doctor/${schedule?.doctorId}/exceptions/${exceptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('Exception removed successfully');
        fetchSchedule();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove exception');
      }
    } catch (error) {
      console.error('Error removing exception:', error);
      toast.error('Error removing exception');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load schedule</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Schedule</h2>
          <p className="text-gray-600">Manage your working hours and availability</p>
        </div>
        <button
          onClick={updateSchedule}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'schedule', label: 'Weekly Schedule', icon: Calendar },
            { id: 'exceptions', label: 'Leave & Exceptions', icon: AlertCircle },
            { id: 'preferences', label: 'Preferences', icon: Clock }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Weekly Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {schedule.weeklySchedule.map((day, dayIndex) => (
            <div key={day.dayOfWeek} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold capitalize">{day.dayOfWeek}</h3>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={day.isWorkingDay}
                    onChange={(e) => updateDaySchedule(dayIndex, 'isWorkingDay', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-600">Working Day</span>
                </label>
              </div>

              {day.isWorkingDay && (
                <div className="space-y-4">
                  {/* Working Hours */}
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Start Time</label>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => updateDaySchedule(dayIndex, 'startTime', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">End Time</label>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => updateDaySchedule(dayIndex, 'endTime', e.target.value)}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Slot Duration (minutes)</label>
                      <select
                        value={day.slotDuration}
                        onChange={(e) => updateDaySchedule(dayIndex, 'slotDuration', parseInt(e.target.value))}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>60 minutes</option>
                      </select>
                    </div>
                  </div>

                  {/* Break Times */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium">Break Times</label>
                      <button
                        onClick={() => addBreakTime(dayIndex)}
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Add Break
                      </button>
                    </div>
                    
                    {day.breakTimes.map((breakTime, breakIndex) => (
                      <div key={breakIndex} className="flex items-center gap-2 mb-2">
                        <input
                          type="time"
                          value={breakTime.startTime}
                          onChange={(e) => {
                            const updatedSchedule = { ...schedule };
                            updatedSchedule.weeklySchedule[dayIndex].breakTimes[breakIndex].startTime = e.target.value;
                            setSchedule(updatedSchedule);
                          }}
                          className="border border-gray-300 px-2 py-1 rounded text-sm"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={breakTime.endTime}
                          onChange={(e) => {
                            const updatedSchedule = { ...schedule };
                            updatedSchedule.weeklySchedule[dayIndex].breakTimes[breakIndex].endTime = e.target.value;
                            setSchedule(updatedSchedule);
                          }}
                          className="border border-gray-300 px-2 py-1 rounded text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Reason"
                          value={breakTime.reason}
                          onChange={(e) => {
                            const updatedSchedule = { ...schedule };
                            updatedSchedule.weeklySchedule[dayIndex].breakTimes[breakIndex].reason = e.target.value;
                            setSchedule(updatedSchedule);
                          }}
                          className="flex-1 border border-gray-300 px-2 py-1 rounded text-sm"
                        />
                        <button
                          onClick={() => removeBreakTime(dayIndex, breakIndex)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Exceptions Tab */}
      {activeTab === 'exceptions' && (
        <div className="space-y-6">
          {/* Add New Exception */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Add Leave/Exception</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={newException.date}
                  onChange={(e) => setNewException({ ...newException, date: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newException.type}
                  onChange={(e) => setNewException({ ...newException, type: e.target.value as any })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {exceptionTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Reason</label>
              <input
                type="text"
                placeholder="Enter reason for leave/exception"
                value={newException.reason}
                onChange={(e) => setNewException({ ...newException, reason: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newException.isFullDay}
                  onChange={(e) => setNewException({ ...newException, isFullDay: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Full Day</span>
              </label>

              {!newException.isFullDay && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={newException.startTime || ''}
                    onChange={(e) => setNewException({ ...newException, startTime: e.target.value })}
                    className="border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={newException.endTime || ''}
                    onChange={(e) => setNewException({ ...newException, endTime: e.target.value })}
                    className="border border-gray-300 px-2 py-1 rounded text-sm"
                  />
                </div>
              )}
            </div>

            <button
              onClick={addException}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Exception
            </button>
          </div>

          {/* Existing Exceptions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Scheduled Exceptions</h3>
            
            {schedule.exceptions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No exceptions scheduled</p>
            ) : (
              <div className="space-y-3">
                {schedule.exceptions.map((exception) => {
                  const typeInfo = exceptionTypes.find(t => t.value === exception.type);
                  return (
                    <div key={exception._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo?.color}`}>
                          {typeInfo?.label}
                        </span>
                        <div>
                          <p className="font-medium">{new Date(exception.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{exception.reason}</p>
                          {!exception.isFullDay && (
                            <p className="text-xs text-gray-500">
                              {exception.startTime} - {exception.endTime}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => removeException(exception._id!)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Schedule Preferences</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Max Appointments Per Day</label>
              <input
                type="number"
                min="1"
                max="50"
                value={schedule.preferences.maxAppointmentsPerDay}
                onChange={(e) => setSchedule({
                  ...schedule,
                  preferences: {
                    ...schedule.preferences,
                    maxAppointmentsPerDay: parseInt(e.target.value)
                  }
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Buffer Time (minutes)</label>
              <select
                value={schedule.preferences.bufferTime}
                onChange={(e) => setSchedule({
                  ...schedule,
                  preferences: {
                    ...schedule.preferences,
                    bufferTime: parseInt(e.target.value)
                  }
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>No buffer</option>
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Advance Booking Days</label>
              <input
                type="number"
                min="1"
                max="90"
                value={schedule.preferences.advanceBookingDays}
                onChange={(e) => setSchedule({
                  ...schedule,
                  preferences: {
                    ...schedule.preferences,
                    advanceBookingDays: parseInt(e.target.value)
                  }
                })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">How many days in advance patients can book</p>
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={schedule.preferences.allowOnlineBooking}
                  onChange={(e) => setSchedule({
                    ...schedule,
                    preferences: {
                      ...schedule.preferences,
                      allowOnlineBooking: e.target.checked
                    }
                  })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium">Allow Online Booking</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
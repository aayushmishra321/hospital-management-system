import { useContext, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { FileText, User, Calendar, Search, Heart, Activity, Edit, Eye, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function PatientRecords() {
  const doctorContext = useContext(DoctorContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
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

  if (!doctorContext) {
    return <div>Loading...</div>;
  }

  const { medicalRecords, updateMedicalRecord, searchPatients, loading } = doctorContext;

  const filteredRecords = medicalRecords.filter((record: any) =>
    record.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Medical records quotes
  const recordsQuotes = [
    "Medical records are the foundation of quality healthcare delivery.",
    "Every record tells a story of healing and hope.",
    "Accurate documentation saves lives and improves outcomes.",
    "In medicine, details matter - every record counts.",
    "Good records are the bridge between past care and future healing.",
    "Documentation is not just paperwork, it's patient care.",
    "The pen is mightier than the sword, especially in medicine."
  ];

  const todayQuote = recordsQuotes[new Date().getDate() % recordsQuotes.length];

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record);
    setEditForm({
      diagnosis: record.diagnosis || '',
      symptoms: record.symptoms?.join(', ') || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
      vitals: {
        bloodPressure: record.vitals?.bloodPressure || '',
        temperature: record.vitals?.temperature || '',
        heartRate: record.vitals?.heartRate || '',
        weight: record.vitals?.weight || '',
        height: record.vitals?.height || ''
      },
      followUpDate: record.followUpDate ? new Date(record.followUpDate).toISOString().split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !editForm.diagnosis) {
      toast.error('Diagnosis is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMedicalRecord(selectedRecord._id, {
        ...editForm,
        symptoms: editForm.symptoms.split(',').map(s => s.trim()).filter(s => s),
        vitals: Object.fromEntries(
          Object.entries(editForm.vitals).filter(([_, value]) => value !== '')
        )
      });
      
      toast.success('Medical record updated successfully');
      setShowEditModal(false);
      setSelectedRecord(null);
    } catch (error) {
      toast.error('Failed to update medical record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/Public/Admin and doctors/medical-records-bg.jpg')`
      }}
    >
      <div className="relative z-10 p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center text-white py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <FileText className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Patient Medical Records</h1>
          <p className="text-lg mb-6">View and manage comprehensive patient medical histories</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Activity className="w-5 h-5 text-white mr-2" />
              <span className="font-semibold">Medical Wisdom</span>
            </div>
            <p className="italic">"{todayQuote}"</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search by patient name or diagnosis..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Medical Records */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No medical records found</p>
              <p className="text-gray-400">Medical records will appear here once created</p>
            </div>
          ) : (
            filteredRecords.map((record: any) => (
              <div key={record._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow hover:shadow-lg transition-all hover:bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{record.patientId?.name}</h3>
                        <p className="text-gray-600">{record.patientId?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-500" />
                        Diagnosis
                      </h4>
                      <p className="text-gray-700 bg-gray-50/80 p-3 rounded-lg">{record.diagnosis}</p>
                    </div>

                    {record.symptoms && record.symptoms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.symptoms.map((symptom: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.treatment && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Treatment</h4>
                        <p className="text-gray-700 bg-gray-50/80 p-3 rounded-lg">{record.treatment}</p>
                      </div>
                    )}

                    {record.vitals && Object.keys(record.vitals).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Vitals</h4>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {record.vitals.bloodPressure && (
                            <div className="bg-gray-50/80 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Blood Pressure</p>
                              <p className="font-medium text-gray-800">{record.vitals.bloodPressure}</p>
                            </div>
                          )}
                          {record.vitals.temperature && (
                            <div className="bg-gray-50/80 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Temperature</p>
                              <p className="font-medium text-gray-800">{record.vitals.temperature}°F</p>
                            </div>
                          )}
                          {record.vitals.heartRate && (
                            <div className="bg-gray-50/80 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Heart Rate</p>
                              <p className="font-medium text-gray-800">{record.vitals.heartRate} bpm</p>
                            </div>
                          )}
                          {record.vitals.weight && (
                            <div className="bg-gray-50/80 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">Weight</p>
                              <p className="font-medium text-gray-800">{record.vitals.weight} lbs</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleViewDetails(record)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Record
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Edit Record Modal */}
        {showEditModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Edit Medical Record</h2>
                <p className="text-green-100">Patient: {selectedRecord.patientId?.name}</p>
              </div>
              
              <form onSubmit={handleUpdateRecord} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Diagnosis *
                  </label>
                  <input
                    type="text"
                    value={editForm.diagnosis}
                    onChange={(e) => setEditForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Symptoms</label>
                  <input
                    type="text"
                    placeholder="Comma-separated symptoms (e.g., fever, headache, cough)"
                    value={editForm.symptoms}
                    onChange={(e) => setEditForm(prev => ({ ...prev, symptoms: e.target.value }))}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Treatment</label>
                  <textarea
                    placeholder="Treatment plan and recommendations"
                    value={editForm.treatment}
                    onChange={(e) => setEditForm(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Vitals
                  </label>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Blood Pressure (e.g., 120/80)"
                      value={editForm.vitals.bloodPressure}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        vitals: { ...prev.vitals, bloodPressure: e.target.value } 
                      }))}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Temperature (°F)"
                      value={editForm.vitals.temperature}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        vitals: { ...prev.vitals, temperature: e.target.value } 
                      }))}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Heart Rate (bpm)"
                      value={editForm.vitals.heartRate}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        vitals: { ...prev.vitals, heartRate: e.target.value } 
                      }))}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Weight (lbs)"
                      value={editForm.vitals.weight}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        vitals: { ...prev.vitals, weight: e.target.value } 
                      }))}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Height (inches)"
                      value={editForm.vitals.height}
                      onChange={(e) => setEditForm(prev => ({ 
                        ...prev, 
                        vitals: { ...prev.vitals, height: e.target.value } 
                      }))}
                      className="border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    placeholder="Additional notes and observations"
                    value={editForm.notes}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Follow-up Date</label>
                  <input
                    type="date"
                    value={editForm.followUpDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isSubmitting ? 'Updating...' : 'Update Record'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRecord(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Medical Record Details</h2>
                <p className="text-blue-100">Patient: {selectedRecord.patientId?.name}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Patient Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedRecord.patientId?.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedRecord.patientId?.email}</p>
                      <p><span className="font-medium">Record Date:</span> {new Date(selectedRecord.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Diagnosis</h3>
                    <p className="bg-red-50 p-3 rounded-lg text-red-800">{selectedRecord.diagnosis}</p>
                  </div>
                </div>

                {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Symptoms</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRecord.symptoms.map((symptom: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.treatment && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Treatment</h3>
                    <p className="bg-green-50 p-4 rounded-lg text-green-800">{selectedRecord.treatment}</p>
                  </div>
                )}

                {selectedRecord.vitals && Object.keys(selectedRecord.vitals).length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Vital Signs</h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {Object.entries(selectedRecord.vitals).map(([key, value]) => (
                        value && (
                          <div key={key} className="bg-blue-50 p-4 rounded-lg text-center">
                            <p className="text-sm text-blue-600 font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-lg font-bold text-blue-800">
                              {value}{key === 'temperature' ? '°F' : key === 'heartRate' ? ' bpm' : key === 'weight' ? ' lbs' : ''}
                            </p>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {selectedRecord.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Additional Notes</h3>
                    <p className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedRecord.notes}</p>
                  </div>
                )}

                {selectedRecord.followUpDate && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Follow-up Date</h3>
                    <p className="bg-yellow-50 p-3 rounded-lg text-yellow-800">
                      {new Date(selectedRecord.followUpDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedRecord(null);
                  }}
                  className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
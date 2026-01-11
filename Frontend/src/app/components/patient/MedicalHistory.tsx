import { useContext, useState } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { FileText, Calendar, User, Activity, Heart, Star, Download, Eye, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const medicalQuotes = [
  "Your medical history is the roadmap to your health journey.",
  "Knowledge of your health history empowers better decisions.",
  "Every record tells a story of your path to wellness.",
  "Understanding your medical history helps prevent future issues.",
  "Your health records are valuable assets for your wellbeing."
];

export function MedicalHistory() {
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
  
  const { medicalRecords, loading, refreshPatientData } = patientContext;
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const handleViewDetails = (record: any) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleExportRecord = (record: any, index: number) => {
    const recordContent = `
MEDICAL RECORD #${index + 1}

Date: ${new Date(record.createdAt || Date.now()).toLocaleDateString()}
Doctor: Dr. ${record.doctorId?.userId?.name || record.doctorId?.name || 'Unknown Doctor'}

DIAGNOSIS:
${record.diagnosis || 'No diagnosis recorded'}

SYMPTOMS:
${record.symptoms || 'No symptoms recorded'}

TREATMENT:
${record.treatment || 'No treatment recorded'}

PRESCRIPTION:
${record.prescription || 'No prescription'}

${record.vitals ? `
VITAL SIGNS:
Blood Pressure: ${record.vitals.bloodPressure || 'N/A'}
Heart Rate: ${record.vitals.heartRate || 'N/A'} bpm
Temperature: ${record.vitals.temperature || 'N/A'}°F
Weight: ${record.vitals.weight || 'N/A'} lbs
Height: ${record.vitals.height || 'N/A'} ft
` : ''}

${record.notes ? `
DOCTOR'S NOTES:
${record.notes}
` : ''}

${record.followUpDate ? `
FOLLOW-UP DATE:
${new Date(record.followUpDate).toLocaleDateString()}
` : ''}

This is a computer-generated medical record.
    `;

    const blob = new Blob([recordContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-record-${index + 1}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Medical record exported successfully');
  };

  const todayQuote = medicalQuotes[new Date().getDay() % medicalQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/departments/cardio.jpg" 
          alt="Medical History Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 to-blue-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileText className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-800">Medical History</h1>
            <button
              onClick={() => {
                toast.info('Refreshing medical records...');
                refreshPatientData();
              }}
              className="ml-4 p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              title="Refresh medical records"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-4">Your complete medical records and health journey</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Health Records Wisdom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="space-y-4">
          {medicalRecords.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No medical history available</p>
              <p className="text-gray-400">Your medical records will appear here after doctor consultations</p>
            </div>
          ) : (
            medicalRecords.map((record: any, index: number) => (
              <div key={record._id || index} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-purple-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Medical Record #{index + 1}</h3>
                        <p className="text-gray-600">Dr. {record.doctorId?.userId?.name || record.doctorId?.name || 'Unknown Doctor'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(record.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(record)}
                          className="flex items-center gap-1 bg-purple-50 text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button 
                          onClick={() => handleExportRecord(record, index)}
                          className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                          <p className="text-red-800 font-medium">{record.diagnosis || 'No diagnosis recorded'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <p className="text-orange-800">{record.symptoms || 'No symptoms recorded'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                          <p className="text-green-800">{record.treatment || 'No treatment recorded'}</p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                          <p className="text-blue-800">{record.prescription || 'No prescription'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Section */}
                  {record.vitals && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-600" />
                        Vital Signs
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {record.vitals.bloodPressure && (
                          <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="text-lg font-bold text-red-600">{record.vitals.bloodPressure}</div>
                            <div className="text-xs text-red-600">Blood Pressure</div>
                          </div>
                        )}
                        {record.vitals.heartRate && (
                          <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                            <div className="text-lg font-bold text-pink-600">{record.vitals.heartRate} bpm</div>
                            <div className="text-xs text-pink-600">Heart Rate</div>
                          </div>
                        )}
                        {record.vitals.temperature && (
                          <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-lg font-bold text-orange-600">{record.vitals.temperature}°F</div>
                            <div className="text-xs text-orange-600">Temperature</div>
                          </div>
                        )}
                        {record.vitals.weight && (
                          <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-lg font-bold text-blue-600">{record.vitals.weight} lbs</div>
                            <div className="text-xs text-blue-600">Weight</div>
                          </div>
                        )}
                        {record.vitals.height && (
                          <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-lg font-bold text-green-600">{record.vitals.height} ft</div>
                            <div className="text-xs text-green-600">Height</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes Section */}
                  {record.notes && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes</label>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-gray-800">{record.notes}</p>
                      </div>
                    </div>
                  )}

                  {/* Follow-up Information */}
                  {record.followUpDate && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-600">Follow-up scheduled for:</span>
                        <span className="font-medium text-blue-600">{new Date(record.followUpDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Health Summary */}
        {medicalRecords.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-purple-800">
              <Heart className="w-5 h-5" />
              Health Summary
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{medicalRecords.length}</div>
                <div className="text-sm text-purple-600">Total Records</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {medicalRecords.filter((r: any) => r.diagnosis).length}
                </div>
                <div className="text-sm text-blue-600">Diagnoses</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {medicalRecords.filter((r: any) => r.treatment).length}
                </div>
                <div className="text-sm text-green-600">Treatments</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Medical Record Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Information</label>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800">
                        Dr. {selectedRecord.doctorId?.userId?.name || selectedRecord.doctorId?.name || 'Unknown Doctor'}
                      </p>
                      <p className="text-blue-600 text-sm">
                        {selectedRecord.doctorId?.specialization || 'General Medicine'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <p className="text-gray-800">
                        {new Date(selectedRecord.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <p className="text-red-800 font-medium">
                        {selectedRecord.diagnosis || 'No diagnosis recorded'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <p className="text-orange-800">
                        {selectedRecord.symptoms || 'No symptoms recorded'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Treatment</label>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-800">
                        {selectedRecord.treatment || 'No treatment recorded'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prescription</label>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-blue-800">
                        {selectedRecord.prescription || 'No prescription'}
                      </p>
                    </div>
                  </div>

                  {selectedRecord.vitals && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Vital Signs</label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedRecord.vitals.bloodPressure && (
                          <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                            <div className="text-sm font-bold text-red-600">{selectedRecord.vitals.bloodPressure}</div>
                            <div className="text-xs text-red-600">BP</div>
                          </div>
                        )}
                        {selectedRecord.vitals.heartRate && (
                          <div className="text-center p-2 bg-pink-50 rounded border border-pink-200">
                            <div className="text-sm font-bold text-pink-600">{selectedRecord.vitals.heartRate} bpm</div>
                            <div className="text-xs text-pink-600">HR</div>
                          </div>
                        )}
                        {selectedRecord.vitals.temperature && (
                          <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                            <div className="text-sm font-bold text-orange-600">{selectedRecord.vitals.temperature}°F</div>
                            <div className="text-xs text-orange-600">Temp</div>
                          </div>
                        )}
                        {selectedRecord.vitals.weight && (
                          <div className="text-center p-2 bg-blue-50 rounded border border-blue-200">
                            <div className="text-sm font-bold text-blue-600">{selectedRecord.vitals.weight} lbs</div>
                            <div className="text-xs text-blue-600">Weight</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedRecord.followUpDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-purple-800 font-medium">
                          {new Date(selectedRecord.followUpDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor's Notes</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-800">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useContext, useState } from 'react';
import { PatientContext } from '../../context/PatientContext';
import { Pill, Calendar, User, Download, Star, FileText, RefreshCw, Bell, Share } from 'lucide-react';
import { toast } from 'sonner';

const prescriptionQuotes = [
  "Medicine is not only a science; it is also an art.",
  "The best medicine is a dose of love, care, and attention.",
  "Take your medications as prescribed - your health depends on it.",
  "Consistency with medication leads to better health outcomes.",
  "Your prescription is your pathway to recovery."
];

export function MyPrescriptions() {
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

  const { prescriptions, loading, requestPrescriptionRefill } = patientContext;
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);
  const [refillForm, setRefillForm] = useState({
    message: '',
    urgency: 'medium'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const handleDownload = (prescription: any) => {
    // Generate a simple prescription PDF content
    const prescriptionContent = `
      PRESCRIPTION
      
      Doctor: Dr. ${prescription.doctorId?.userId?.name || prescription.doctorId?.name}
      Specialization: ${prescription.doctorId?.specialization || 'General Medicine'}
      Date: ${new Date(prescription.createdAt).toLocaleDateString()}
      
      PRESCRIBED MEDICINES:
      ${prescription.medicines.map((medicine: any, index: number) => {
        const medicineName = typeof medicine === 'string' ? medicine : medicine.name || 'Unknown Medicine';
        const medicineDetails = typeof medicine === 'object' ? medicine : null;
        let medicineText = `${index + 1}. ${medicineName}`;
        
        if (medicineDetails) {
          if (medicineDetails.dosage) medicineText += ` - ${medicineDetails.dosage}`;
          if (medicineDetails.frequency) medicineText += ` - ${medicineDetails.frequency}`;
          if (medicineDetails.duration) medicineText += ` for ${medicineDetails.duration}`;
          if (medicineDetails.instructions) medicineText += ` (${medicineDetails.instructions})`;
        }
        
        return medicineText;
      }).join('\n')}
      
      INSTRUCTIONS:
      ${prescription.notes || 'Take as directed by your doctor'}
      
      This is a computer-generated prescription.
    `;

    // Create and download the file
    const blob = new Blob([prescriptionContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-${prescription._id.slice(-6)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Prescription downloaded successfully');
  };

  const handleRefillRequest = (prescription: any) => {
    setSelectedPrescription(prescription);
    setRefillForm({ message: '', urgency: 'medium' });
    setShowRefillModal(true);
  };

  const submitRefillRequest = async () => {
    if (!selectedPrescription) return;

    setIsSubmitting(true);
    try {
      await requestPrescriptionRefill(selectedPrescription._id, refillForm);
      toast.success('Refill request sent to doctor successfully');
      setShowRefillModal(false);
      setSelectedPrescription(null);
    } catch (error) {
      toast.error('Failed to send refill request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetReminder = (prescription: any) => {
    // For now, show a success message. In a real app, this would integrate with a notification system
    toast.success(`Reminder set for ${prescription.medicines.join(', ')}`);
  };

  const handleShareWithPharmacy = (prescription: any) => {
    // Generate a shareable link or code
    const shareCode = `RX-${prescription._id.slice(-6).toUpperCase()}`;
    navigator.clipboard.writeText(shareCode);
    toast.success(`Prescription code ${shareCode} copied to clipboard. Share this with your pharmacy.`);
  };

  const todayQuote = prescriptionQuotes[new Date().getDay() % prescriptionQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/departments/pedia.jpg" 
          alt="Prescriptions Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/90 to-blue-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Pill className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">My Prescriptions</h1>
          </div>
          <p className="text-gray-600 mb-4">View your prescribed medications and treatment plans</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Medication Wisdom</p>
              </div>
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-gray-200">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No prescriptions available</p>
              <p className="text-gray-400">Your prescriptions will appear here after doctor visits</p>
            </div>
          ) : (
            prescriptions.map((prescription: any) => (
              <div key={prescription._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Dr. {prescription.doctorId?.userId?.name || prescription.doctorId?.name}</h3>
                        <p className="text-gray-600">{prescription.doctorId?.specialization || prescription.doctorId?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                      <button 
                        onClick={() => handleDownload(prescription)}
                        className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-green-600" />
                        Prescribed Medicines
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {prescription.medicines.map((medicine: any, index: number) => {
                          const medicineName = typeof medicine === 'string' ? medicine : medicine.name || 'Unknown Medicine';
                          const medicineDetails = typeof medicine === 'object' ? medicine : null;
                          
                          return (
                            <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <div className="flex items-center gap-3 mb-2">
                                <Pill className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="font-medium text-green-800">{medicineName}</span>
                              </div>
                              {medicineDetails && (
                                <div className="ml-7 space-y-1 text-sm text-gray-600">
                                  {medicineDetails.dosage && (
                                    <p><span className="font-medium">Dosage:</span> {medicineDetails.dosage}</p>
                                  )}
                                  {medicineDetails.frequency && (
                                    <p><span className="font-medium">Frequency:</span> {medicineDetails.frequency}</p>
                                  )}
                                  {medicineDetails.duration && (
                                    <p><span className="font-medium">Duration:</span> {medicineDetails.duration}</p>
                                  )}
                                  {medicineDetails.instructions && (
                                    <p><span className="font-medium">Instructions:</span> {medicineDetails.instructions}</p>
                                  )}
                                </div>
                              )}
                              {!medicineDetails && (
                                <p className="ml-7 text-xs text-green-600">Take as directed</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Doctor's Instructions
                        </h4>
                        <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">{prescription.notes}</p>
                      </div>
                    )}

                    {prescription.appointmentId && (
                      <div className="pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Related to appointment on {new Date(prescription.appointmentId.date || prescription.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                      onClick={() => handleRefillRequest(prescription)}
                      className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg hover:bg-green-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refill Request
                    </button>
                    <button 
                      onClick={() => handleSetReminder(prescription)}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Set Reminder
                    </button>
                    <button 
                      onClick={() => handleShareWithPharmacy(prescription)}
                      className="flex-1 bg-purple-50 text-purple-600 py-2 rounded-lg hover:bg-purple-100 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <Share className="w-4 h-4" />
                      Share with Pharmacy
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Medication Reminders Section */}
        {prescriptions.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-800">
              <Calendar className="w-5 h-5" />
              Medication Reminders
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium mb-2">💊 Daily Medication Schedule</p>
              <p className="text-blue-600 text-sm">
                Set up reminders for your medications to ensure you never miss a dose. 
                Consistent medication adherence is key to your recovery.
              </p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                Set Up Reminders
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Refill Request Modal */}
      {showRefillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">Request Prescription Refill</h3>
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Requesting refill for: <span className="font-medium">{selectedPrescription?.medicines.join(', ')}</span>
              </p>
              <p className="text-sm text-gray-500">
                Doctor: Dr. {selectedPrescription?.doctorId?.userId?.name || selectedPrescription?.doctorId?.name}
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Urgency Level</label>
                <select
                  value={refillForm.urgency}
                  onChange={e => setRefillForm(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="low">Low - Can wait a few days</option>
                  <option value="medium">Medium - Need within 2-3 days</option>
                  <option value="high">High - Need urgently</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message to Doctor (Optional)</label>
                <textarea
                  value={refillForm.message}
                  onChange={e => setRefillForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Any additional information for your doctor..."
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRefillModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={submitRefillRequest}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
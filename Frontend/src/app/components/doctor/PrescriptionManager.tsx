import { useContext, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { Pill, Plus, User, Calendar, Search, Heart, Activity, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export function PrescriptionManager() {
  const doctorContext = useContext(DoctorContext);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any>(null);

  const [form, setForm] = useState({
    appointmentId: '',
    patientId: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
    notes: ''
  });

  if (!doctorContext) {
    return <div>Loading...</div>;
  }

  const { prescriptions, addPrescription, updatePrescription, deletePrescription, appointments, loading } = doctorContext;

  const filteredPrescriptions = prescriptions.filter((prescription: any) =>
    prescription.patientId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.medicines?.some((med: any) => {
      // Handle both string and object formats
      const medicineName = typeof med === 'string' ? med : med.name || '';
      return medicineName.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  // Prescription management quotes
  const prescriptionQuotes = [
    "The right medicine at the right time can work miracles.",
    "Prescribing is an art that combines science with compassion.",
    "Every prescription is a promise of healing and hope.",
    "Medicine is not just about pills, it's about care and precision.",
    "A well-written prescription is the first step toward recovery.",
    "In prescribing, accuracy and empathy go hand in hand.",
    "The best prescription includes both medicine and understanding."
  ];

  const todayQuote = prescriptionQuotes[new Date().getDate() % prescriptionQuotes.length];

  const handleAddMedicine = () => {
    setForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const handleMedicineChange = (index: number, field: string, value: string) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleRemoveMedicine = (index: number) => {
    setForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleEditAddMedicine = () => {
    setEditForm(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    }));
  };

  const handleEditMedicineChange = (index: number, field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      medicines: prev.medicines.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const handleEditRemoveMedicine = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMedicines = form.medicines.filter(m => m.name.trim());
    if (!form.appointmentId || !form.patientId || validMedicines.length === 0) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await addPrescription({
        appointmentId: form.appointmentId,
        patientId: form.patientId,
        medicines: validMedicines,
        notes: form.notes
      });
      
      toast.success('Prescription created successfully');
      setShowModal(false);
      setForm({
        appointmentId: '',
        patientId: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
        notes: ''
      });
    } catch (error) {
      toast.error('Failed to create prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validMedicines = editForm.medicines.filter(m => m.name.trim());
    if (!selectedPrescription || validMedicines.length === 0) {
      toast.error('Please provide at least one medicine');
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePrescription(selectedPrescription._id, {
        medicines: validMedicines,
        notes: editForm.notes
      });
      
      toast.success('Prescription updated successfully');
      setShowEditModal(false);
      setSelectedPrescription(null);
    } catch (error) {
      toast.error('Failed to update prescription');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (prescriptionId: string) => {
    if (!confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      await deletePrescription(prescriptionId);
      toast.success('Prescription deleted successfully');
    } catch (error) {
      toast.error('Failed to delete prescription');
    }
  };

  const handleEdit = (prescription: any) => {
    setSelectedPrescription(prescription);
    
    // Convert medicines to the new format if they're strings
    const formattedMedicines = prescription.medicines.map((med: any) => {
      if (typeof med === 'string') {
        return { name: med, dosage: '', frequency: '', duration: '', instructions: '' };
      } else {
        return { 
          name: med.name || '', 
          dosage: med.dosage || '', 
          frequency: med.frequency || '', 
          duration: med.duration || '', 
          instructions: med.instructions || '' 
        };
      }
    });
    
    setEditForm({
      medicines: formattedMedicines,
      notes: prescription.notes || ''
    });
    setShowEditModal(true);
  };

  const handleViewDetails = (prescription: any) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handleAppointmentSelect = (appointmentId: string) => {
    const appointment = appointments.find((apt: any) => apt._id === appointmentId);
    if (appointment) {
      setForm(prev => ({
        ...prev,
        appointmentId,
        patientId: appointment.patientId._id || appointment.patientId
      }));
    }
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
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/Public/Admin and doctors/prescription-bg.jpg')`
      }}
    >
      <div className="relative z-10 p-6 space-y-6">
        {/* Header Section */}
        <div className="text-center text-white py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full">
              <Pill className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">Prescription Management</h1>
          <p className="text-lg mb-6">Create and manage patient prescriptions with precision and care</p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-2">
              <Heart className="w-5 h-5 text-white mr-2" />
              <span className="font-semibold">Prescription Wisdom</span>
            </div>
            <p className="italic">"{todayQuote}"</p>
          </div>
        </div>

        {/* Header with New Prescription Button */}
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:opacity-90 flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>

        {/* Search */}
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow">
          <div className="relative">
            <label htmlFor="prescription-search" className="block text-sm font-medium mb-2 text-gray-700">
              Search Prescriptions
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="prescription-search"
                className="w-full border pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search by patient name or medicine..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="space-y-4">
          {filteredPrescriptions.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow p-12 text-center">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No prescriptions found</p>
              <p className="text-gray-400">Create your first prescription to get started</p>
            </div>
          ) : (
            filteredPrescriptions.map((prescription: any) => (
              <div key={prescription._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow hover:shadow-lg transition-all hover:bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{prescription.patientId?.name}</h3>
                        <p className="text-gray-600">{prescription.patientId?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(prescription.createdAt).toLocaleDateString()}</span>
                      </div>
                      {prescription.status && (
                        <span className={`px-2 py-1 rounded-full text-xs mt-1 inline-block ${
                          prescription.status === 'filled' 
                            ? 'bg-green-100 text-green-800'
                            : prescription.status === 'expired'
                            ? 'bg-red-100 text-red-800'
                            : prescription.status === 'cancelled'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {prescription.status}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-green-600" />
                        Medicines
                      </h4>
                      <div className="space-y-2">
                        {prescription.medicines.map((medicine: any, index: number) => {
                          const medicineName = typeof medicine === 'string' ? medicine : medicine.name || 'Unknown Medicine';
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <Activity className="w-4 h-4 text-green-600" />
                              <span className="bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm">
                                {medicineName}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {prescription.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Notes</h4>
                        <p className="text-gray-700 bg-gray-50/80 p-3 rounded-lg">{prescription.notes}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                      <button
                        onClick={() => handleViewDetails(prescription)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      
                      <button
                        onClick={() => handleEdit(prescription)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      
                      <button
                        onClick={() => handleDelete(prescription._id)}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create Prescription Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Create New Prescription</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Select Appointment *</label>
                  <select
                    value={form.appointmentId}
                    onChange={e => handleAppointmentSelect(e.target.value)}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  >
                    <option value="">Choose an appointment</option>
                    {appointments.map((apt: any) => (
                      <option key={apt._id} value={apt._id}>
                        {apt.patientId?.name} - {apt.date} at {apt.time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Medicines *</label>
                  <div className="space-y-4">
                    {form.medicines.map((medicine, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label htmlFor={`medicine-name-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Medicine Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`medicine-name-${index}`}
                              type="text"
                              placeholder="e.g., Amoxicillin"
                              value={medicine.name}
                              onChange={e => handleMedicineChange(index, 'name', e.target.value)}
                              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor={`medicine-dosage-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Dosage
                            </label>
                            <input
                              id={`medicine-dosage-${index}`}
                              type="text"
                              placeholder="e.g., 500mg"
                              value={medicine.dosage}
                              onChange={e => handleMedicineChange(index, 'dosage', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`medicine-frequency-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Frequency
                            </label>
                            <input
                              id={`medicine-frequency-${index}`}
                              type="text"
                              placeholder="e.g., twice daily"
                              value={medicine.frequency}
                              onChange={e => handleMedicineChange(index, 'frequency', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`medicine-duration-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Duration
                            </label>
                            <input
                              id={`medicine-duration-${index}`}
                              type="text"
                              placeholder="e.g., 7 days"
                              value={medicine.duration}
                              onChange={e => handleMedicineChange(index, 'duration', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`medicine-instructions-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Special Instructions
                            </label>
                            <input
                              id={`medicine-instructions-${index}`}
                              type="text"
                              placeholder="e.g., Take with food"
                              value={medicine.instructions}
                              onChange={e => handleMedicineChange(index, 'instructions', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                            />
                          </div>
                        </div>
                        {form.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedicine(index)}
                            className="mt-2 bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Remove Medicine
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddMedicine}
                      className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                    >
                      + Add another medicine
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    placeholder="Additional instructions or notes"
                    value={form.notes}
                    onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                  />
                </div>
              </form>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Prescription'}
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setForm({
                      appointmentId: '',
                      patientId: '',
                      medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }],
                      notes: ''
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Prescription Modal */}
        {showEditModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Edit Prescription</h2>
                <p className="text-green-100">Patient: {selectedPrescription.patientId?.name}</p>
              </div>
              
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Medicines *</label>
                  <div className="space-y-4">
                    {editForm.medicines.map((medicine, index) => (
                      <div key={index} className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="md:col-span-2">
                            <label htmlFor={`edit-medicine-name-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Medicine Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`edit-medicine-name-${index}`}
                              type="text"
                              placeholder="e.g., Amoxicillin"
                              value={medicine.name}
                              onChange={e => handleEditMedicineChange(index, 'name', e.target.value)}
                              className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              required
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-medicine-dosage-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Dosage
                            </label>
                            <input
                              id={`edit-medicine-dosage-${index}`}
                              type="text"
                              placeholder="e.g., 500mg"
                              value={medicine.dosage}
                              onChange={e => handleEditMedicineChange(index, 'dosage', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-medicine-frequency-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Frequency
                            </label>
                            <input
                              id={`edit-medicine-frequency-${index}`}
                              type="text"
                              placeholder="e.g., twice daily"
                              value={medicine.frequency}
                              onChange={e => handleEditMedicineChange(index, 'frequency', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-medicine-duration-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Duration
                            </label>
                            <input
                              id={`edit-medicine-duration-${index}`}
                              type="text"
                              placeholder="e.g., 7 days"
                              value={medicine.duration}
                              onChange={e => handleEditMedicineChange(index, 'duration', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            />
                          </div>
                          <div>
                            <label htmlFor={`edit-medicine-instructions-${index}`} className="block text-sm font-medium mb-1 text-gray-700">
                              Special Instructions
                            </label>
                            <input
                              id={`edit-medicine-instructions-${index}`}
                              type="text"
                              placeholder="e.g., Take with food"
                              value={medicine.instructions}
                              onChange={e => handleEditMedicineChange(index, 'instructions', e.target.value)}
                              className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full"
                            />
                          </div>
                        </div>
                        {editForm.medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleEditRemoveMedicine(index)}
                            className="mt-2 bg-red-100 text-red-600 px-3 py-1 rounded text-sm hover:bg-red-200"
                          >
                            Remove Medicine
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleEditAddMedicine}
                      className="text-green-600 hover:text-green-700 text-sm font-medium"
                    >
                      + Add another medicine
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Notes</label>
                  <textarea
                    placeholder="Additional instructions or notes"
                    value={editForm.notes}
                    onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={3}
                  />
                </div>
              </form>

              <div className="p-6 border-t flex gap-3">
                <button
                  onClick={handleEditSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Updating...' : 'Update Prescription'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPrescription(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showDetailModal && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
                <h2 className="text-2xl font-bold">Prescription Details</h2>
                <p className="text-blue-100">Patient: {selectedPrescription.patientId?.name}</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Patient Information</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Name:</span> {selectedPrescription.patientId?.name}</p>
                      <p><span className="font-medium">Email:</span> {selectedPrescription.patientId?.email}</p>
                      <p><span className="font-medium">Prescribed Date:</span> {new Date(selectedPrescription.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Status</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                      selectedPrescription.status === 'filled' 
                        ? 'bg-green-100 text-green-800'
                        : selectedPrescription.status === 'expired'
                        ? 'bg-red-100 text-red-800'
                        : selectedPrescription.status === 'cancelled'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedPrescription.status || 'Pending'}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3 text-gray-800">Prescribed Medicines</h3>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine: any, index: number) => {
                      const medicineName = typeof medicine === 'string' ? medicine : medicine.name || 'Unknown Medicine';
                      const medicineDetails = typeof medicine === 'object' ? medicine : null;
                      
                      return (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3 mb-2">
                            <Pill className="w-5 h-5 text-green-600" />
                            <span className="text-green-800 font-medium text-lg">{medicineName}</span>
                          </div>
                          {medicineDetails && (
                            <div className="ml-8 space-y-1 text-sm text-gray-600">
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
                        </div>
                      );
                    })}
                  </div>
                </div>

                {selectedPrescription.notes && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-gray-800">Additional Notes</h3>
                    <p className="bg-gray-50 p-4 rounded-lg text-gray-700">{selectedPrescription.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPrescription(null);
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
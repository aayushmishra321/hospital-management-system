import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { AdvancedSearch } from '../shared/AdvancedSearch';
import api from '../../services/api';
import { 
  Search, 
  UserPlus, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Heart, 
  Users, 
  FileText, 
  X, 
  Edit, 
  Eye, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Plus,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const patientQuotes = [
  "Every patient deserves compassionate care.",
  "Patient satisfaction is our mission.",
  "Healthy patients, thriving community.",
  "Care today, trust tomorrow.",
  "Your patients are your priority."
];

interface PatientForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  pincode: string;
  bloodGroup: string;
  emergencyContact: string;
}

export function PatientManagement() {
  const { patients, setPatients, loading } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<any[]>([]);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState<PatientForm>({
    name: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    pincode: '',
    bloodGroup: '',
    emergencyContact: ''
  });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      pincode: '',
      bloodGroup: '',
      emergencyContact: ''
    });
  };

  // Enhanced search functionality
  const handleAdvancedSearch = async (filters: any) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/search/patients?${queryParams.toString()}`);
      setSearchResults(response.data.results);
      toast.success(`Found ${response.data.results.length} patients`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search error occurred');
    }
  };

  const filteredPatients = showAdvancedSearch ? searchResults : (patients?.filter((p: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.userId?.name?.toLowerCase().includes(searchLower) ||
      p.userId?.email?.toLowerCase().includes(searchLower) ||
      p.phone?.toLowerCase().includes(searchLower) ||
      p.bloodGroup?.toLowerCase().includes(searchLower) ||
      p.gender?.toLowerCase().includes(searchLower)
    );
  }) || []);

  // Calculate patient statistics
  const patientStats = {
    total: patients?.length || 0,
    male: patients?.filter((p: any) => p.gender === 'male').length || 0,
    female: patients?.filter((p: any) => p.gender === 'female').length || 0,
    averageAge: patients?.length > 0 
      ? Math.round(patients.reduce((sum: number, p: any) => {
          if (p.dateOfBirth) {
            const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
            return sum + age;
          }
          return sum;
        }, 0) / patients.length) 
      : 0
  };

  // NEW: Add Patient
  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/admin/patients', form);
      setPatients((prev: any) => [response.data.patient, ...prev]);
      toast.success('Patient added successfully');
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Edit Patient
  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setForm({
      name: patient.userId?.name || '',
      email: patient.userId?.email || '',
      password: '', // Don't pre-fill password
      phone: patient.phone || '',
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : '',
      gender: patient.gender || '',
      address: patient.address || '',
      pincode: patient.pincode || '',
      bloodGroup: patient.bloodGroup || '',
      emergencyContact: patient.emergencyContact || ''
    });
    setShowEditModal(true);
  };

  // NEW: Update Patient
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;
    
    setIsSubmitting(true);

    try {
      const updateData = { ...form };
      
      // Remove password if empty
      if (!updateData.password) {
        delete (updateData as any).password;
      }

      const response = await api.put(`/admin/patients/${editingPatient._id}`, updateData);

      setPatients((prev: any) => 
        prev.map((patient: any) => 
          patient._id === editingPatient._id ? response.data.patient : patient
        )
      );

      toast.success('Patient updated successfully');
      setShowEditModal(false);
      setEditingPatient(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Delete Patient
  const handleDelete = async (patientId: string) => {
    if (!confirm('Are you sure you want to delete this patient? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/patients/${patientId}`);
      setPatients((prev: any) => prev.filter((p: any) => p._id !== patientId));
      toast.success('Patient deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete patient');
    }
  };

  // NEW: Toggle Patient Status
  const handleToggleStatus = async (patientId: string) => {
    try {
      const response = await api.patch(`/admin/patients/${patientId}/status`);

      setPatients((prev: any) => 
        prev.map((patient: any) => 
          patient._id === patientId ? response.data.patient : patient
        )
      );

      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update patient status');
    }
  };

  // FIXED: View Patient Details with proper error handling
  const handleViewDetails = async (patientId: string) => {
    try {
      console.log('🔍 Viewing patient details for ID:', patientId);
      const response = await api.get(`/admin/patients/${patientId}`);
      
      // Ensure we have valid patient data
      if (response.data && typeof response.data === 'object') {
        console.log('✅ Patient data received:', response.data);
        setSelectedPatient(response.data);
        setShowDetailModal(true);
      } else {
        console.error('❌ Invalid patient data received:', response.data);
        toast.error('Invalid patient data received');
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch patient details:', error);
      toast.error('Failed to fetch patient details');
    }
  };

  // Existing medical history functionality
  const fetchMedicalHistory = async (patientId: string) => {
    setLoadingHistory(true);
    try {
      const response = await api.get(`/medical-records/patient/${patientId}`);
      setMedicalHistory(response.data);
      setShowMedicalHistory(true);
    } catch (error) {
      console.error('Failed to fetch medical history:', error);
      setMedicalHistory([]);
      setShowMedicalHistory(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleViewMedicalHistory = (patient: any) => {
    setSelectedPatient(patient);
    fetchMedicalHistory(patient._id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const todayQuote = patientQuotes[new Date().getDay() % patientQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Patient/hero.png" 
          alt="Patient Management Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/Patient/about.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Patient Management</h1>
          </div>
          
          {/* Daily Quote */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Heart className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-blue-800 font-medium italic">"{todayQuote}"</p>
                <p className="text-blue-600 text-sm mt-2">— Patient Care Excellence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-blue-600">{patientStats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Male Patients</p>
                <p className="text-3xl font-bold text-green-600">{patientStats.male}</p>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Female Patients</p>
                <p className="text-3xl font-bold text-pink-600">{patientStats.female}</p>
              </div>
              <User className="w-8 h-8 text-pink-600" />
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Age</p>
                <p className="text-3xl font-bold text-purple-600">{patientStats.averageAge}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Search and Add Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search patients by name, email, phone, blood group..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className={`px-4 py-3 rounded-lg border transition-colors ${
                  showAdvancedSearch 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Advanced Search
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Add New Patient
              </button>
            </div>
          </div>

          {/* Advanced Search Component */}
          {showAdvancedSearch && (
            <AdvancedSearch
              searchType="patients"
              onSearch={handleAdvancedSearch}
            />
          )}
        </div>

        {/* Patients Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient: any) => (
            <div key={patient._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100">
              {/* Patient Header */}
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-500">
                <img 
                  src="/Public/Patient/hero.png"
                  alt="Patient"
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-purple-600/80"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggleStatus(patient._id)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      patient.isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    title={patient.isActive ? 'Deactivate Patient' : 'Activate Patient'}
                  >
                    {patient.isActive ? (
                      <ToggleRight className="w-4 h-4 text-white" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    patient.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Patient Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      {String(patient.userId?.name || 'Unknown Name')}
                    </h3>
                    <p className="text-blue-600 font-medium">{String(patient.gender || 'Unknown')}</p>
                    {patient.bloodGroup && (
                      <p className="text-sm text-red-600 font-medium">Blood: {String(patient.bloodGroup)}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{String(patient.userId?.email || 'No email')}</span>
                  </div>
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{String(patient.phone)}</span>
                    </div>
                  )}
                  {patient.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Age: {String(new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear())}
                      </span>
                    </div>
                  )}
                  {patient.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{String(patient.address)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons - FIXED: Added proper error handling */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log('🔍 View button clicked for patient:', patient._id);
                      handleViewDetails(patient._id);
                    }}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(patient)}
                    className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleViewMedicalHistory(patient)}
                    className="flex-1 bg-purple-50 text-purple-600 py-2 px-3 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    History
                  </button>
                  <button
                    onClick={() => handleDelete(patient._id)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first patient to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="glass-modal">
          <div className="glass-modal-content w-full max-w-2xl">
            <div className="glass-modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add New Patient</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="glass-modal-body">
              <form onSubmit={handleAddPatient} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patient-name" className="glass-form-label">Full Name *</label>
                    <input
                      id="patient-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="glass-form-input"
                      placeholder="Enter patient's full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="patient-email" className="glass-form-label">Email Address *</label>
                    <input
                      id="patient-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="glass-form-input"
                      placeholder="patient@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patient-password" className="glass-form-label">Password *</label>
                    <input
                      id="patient-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="glass-form-input"
                      placeholder="Create a secure password (min 8 characters)"
                      required
                      minLength={8}
                    />
                  </div>
                  <div>
                    <label htmlFor="patient-phone" className="glass-form-label">Phone Number *</label>
                    <input
                      id="patient-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="glass-form-input"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="patient-dob" className="glass-form-label">Date of Birth</label>
                    <input
                      id="patient-dob"
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                      className="glass-form-input"
                    />
                  </div>
                  <div>
                    <label htmlFor="patient-gender" className="glass-form-label">Gender</label>
                    <select
                      id="patient-gender"
                      value={form.gender}
                      onChange={(e) => setForm({ ...form, gender: e.target.value })}
                      className="glass-form-input"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="patient-blood-group" className="glass-form-label">Blood Group</label>
                    <select
                      id="patient-blood-group"
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="glass-form-input"
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="patient-address" className="glass-form-label">Address</label>
                    <textarea
                      id="patient-address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="glass-form-input resize-none"
                      rows={3}
                      placeholder="Enter full address"
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patient-pincode" className="glass-form-label">Pincode</label>
                      <input
                        id="patient-pincode"
                        type="text"
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        className="glass-form-input"
                        placeholder="12345"
                      />
                    </div>
                    <div>
                      <label htmlFor="patient-emergency-contact" className="glass-form-label">Emergency Contact</label>
                      <input
                        id="patient-emergency-contact"
                        type="tel"
                        value={form.emergencyContact}
                        onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                        className="glass-form-input"
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="glass-button-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="glass-button-primary flex-1"
                  >
                    {isSubmitting ? 'Adding Patient...' : 'Add Patient'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {showEditModal && editingPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Edit Patient</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Same form fields as Add Patient Modal */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingPatient(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FIXED: Patient Details Modal with proper object handling */}
      {showDetailModal && selectedPatient && (
        <div className="glass-modal">
          <div className="glass-modal-content w-full max-w-2xl">
            <div className="glass-modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Patient Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPatient(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="glass-modal-body space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {String(selectedPatient.userId?.name || 'Unknown Name')}
                </h3>
                <p className="text-blue-600 font-medium text-lg capitalize">{String(selectedPatient.gender || 'Unknown')}</p>
                {selectedPatient.bloodGroup && (
                  <p className="text-red-600 font-medium">Blood Group: {String(selectedPatient.bloodGroup)}</p>
                )}
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium mt-3 ${
                  selectedPatient.isActive 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-gray-100 text-gray-800 border border-gray-200'
                }`}>
                  {selectedPatient.isActive ? '✅ Active Patient' : '❌ Inactive Patient'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass-card-enhanced p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-blue-600" />
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="font-medium">{String(selectedPatient.userId?.email || 'Not provided')}</p>
                      </div>
                    </div>
                    {selectedPatient.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="font-medium">{String(selectedPatient.phone)}</p>
                        </div>
                      </div>
                    )}
                    {selectedPatient.emergencyContact && (
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Emergency Contact</p>
                          <p className="font-medium">{
                            typeof selectedPatient.emergencyContact === 'object' 
                              ? String(selectedPatient.emergencyContact.phone || selectedPatient.emergencyContact.name || 'Not provided')
                              : String(selectedPatient.emergencyContact)
                          }</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="glass-card-enhanced p-4">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    Personal Information
                  </h4>
                  <div className="space-y-3">
                    {selectedPatient.dateOfBirth && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Age</p>
                          <p className="font-medium">
                            {String(new Date().getFullYear() - new Date(selectedPatient.dateOfBirth).getFullYear())} years old
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedPatient.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">Address</p>
                          <p className="font-medium">{String(selectedPatient.address)}</p>
                          {selectedPatient.pincode && (
                            <p className="text-sm text-gray-600">PIN: {String(selectedPatient.pincode)}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Medical Statistics */}
              <div className="glass-card-enhanced p-4">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Medical Statistics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{String(selectedPatient.appointmentsCount || 0)}</p>
                    <p className="text-sm text-blue-700">Total Appointments</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{String(selectedPatient.medicalRecordsCount || 0)}</p>
                    <p className="text-sm text-purple-700">Medical Records</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedPatient(null);
                    handleEdit(selectedPatient);
                  }}
                  className="glass-button-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Patient
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleViewMedicalHistory(selectedPatient);
                  }}
                  className="glass-button-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Medical History
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="glass-button-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Medical History Modal */}
      {showMedicalHistory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">
                  Medical History - {selectedPatient?.userId?.name || 'Unknown Patient'}
                </h2>
                <button
                  onClick={() => {
                    setShowMedicalHistory(false);
                    setSelectedPatient(null);
                    setMedicalHistory([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : medicalHistory.length > 0 ? (
                <div className="space-y-4">
                  {medicalHistory.map((record: any) => (
                    <div key={record._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{record.diagnosis}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(record.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{record.symptoms}</p>
                      <p className="text-gray-600 mb-2"><strong>Treatment:</strong> {record.treatment}</p>
                      {record.notes && (
                        <p className="text-gray-600"><strong>Notes:</strong> {record.notes}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-2">
                        Doctor: {record.doctorId?.userId?.name || 'Unknown'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">No Medical History</h3>
                  <p className="text-gray-500">This patient has no medical records yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
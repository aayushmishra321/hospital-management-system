import { useState, useContext, useEffect } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { Search, Plus, Trash2, Mail, Stethoscope, Star, Edit, Eye, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../services/api';
import { getDepartmentImage } from '../../utils/departmentImages';

const doctorQuotes = [
  "Doctors are the backbone of healthcare excellence.",
  "Quality doctors create quality care.",
  "Invest in your doctors, invest in your patients' future.",
  "A skilled doctor is a hospital's greatest asset.",
  "Empower your doctors to deliver their best."
];

interface DoctorForm {
  name: string;
  email: string;
  password: string;
  specialization: string;
  department: string;
  consultationFee: number;
  experience: number;
  qualifications: string[];
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export function DoctorManagement() {
  const { doctors, departments, setDoctors, loading } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);

  const [form, setForm] = useState<DoctorForm>({
    name: '',
    email: '',
    password: '',
    specialization: '',
    department: '',
    consultationFee: 0,
    experience: 0,
    qualifications: [],
    availability: {
      days: [],
      startTime: '',
      endTime: ''
    }
  });

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      password: '',
      specialization: '',
      department: '',
      consultationFee: 0,
      experience: 0,
      qualifications: [],
      availability: {
        days: [],
        startTime: '',
        endTime: ''
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/admin/doctors', form);
      setDoctors((prev: any) => [response.data.doctor, ...prev]);
      toast.success('Doctor added successfully');
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // NEW: Handle Edit Doctor
  const handleEdit = (doctor: any) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.userId?.name || '',
      email: doctor.userId?.email || '',
      password: '', // Don't pre-fill password for security
      specialization: doctor.specialization || '',
      department: doctor.department?._id || '',
      consultationFee: doctor.consultationFee || 0,
      experience: doctor.experience || 0,
      qualifications: doctor.qualifications || [],
      availability: doctor.availability || {
        days: [],
        startTime: '',
        endTime: ''
      }
    });
    setShowEditModal(true);
  };

  // NEW: Handle Update Doctor
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData = { ...form };
      
      // Remove password if empty (don't update password)
      if (!updateData.password) {
        delete (updateData as any).password;
      }

      const response = await api.put(`/admin/doctors/${editingDoctor?._id}`, updateData);

      // Update the doctors list
      setDoctors((prev: any) => 
        prev.map((doc: any) => 
          doc._id === editingDoctor?._id ? response.data.doctor : doc
        )
      );

      toast.success('Doctor updated successfully');
      setShowEditModal(false);
      setEditingDoctor(null);
      resetForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED: Handle Delete Doctor with API call
  const handleDelete = async (doctorId: string) => {
    if (!confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/admin/doctors/${doctorId}`);
      setDoctors((prev: any) => prev.filter((d: any) => d._id !== doctorId));
      toast.success('Doctor deleted successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  // NEW: Handle Toggle Doctor Status
  const handleToggleStatus = async (doctorId: string) => {
    try {
      const response = await api.patch(`/admin/doctors/${doctorId}/status`);

      // Update the doctors list
      setDoctors((prev: any) => 
        prev.map((doc: any) => 
          doc._id === doctorId ? response.data.doctor : doc
        )
      );

      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update doctor status');
    }
  };

  // NEW: Handle View Doctor Details
  const handleViewDetails = async (doctorId: string) => {
    try {
      const response = await api.get(`/admin/doctors/${doctorId}`);
      setSelectedDoctor(response.data);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error('Failed to fetch doctor details');
    }
  };

  const handleQualificationChange = (index: number, value: string) => {
    const newQualifications = [...form.qualifications];
    newQualifications[index] = value;
    setForm({ ...form, qualifications: newQualifications });
  };

  const addQualification = () => {
    setForm({ ...form, qualifications: [...form.qualifications, ''] });
  };

  const removeQualification = (index: number) => {
    const newQualifications = form.qualifications.filter((_, i) => i !== index);
    setForm({ ...form, qualifications: newQualifications });
  };

  const handleAvailabilityDayChange = (day: string) => {
    const newDays = form.availability.days.includes(day)
      ? form.availability.days.filter(d => d !== day)
      : [...form.availability.days, day];
    
    setForm({
      ...form,
      availability: { ...form.availability, days: newDays }
    });
  };

  // Enhanced search functionality
  const filteredDoctors = doctors?.filter((doctor: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      doctor.userId?.name?.toLowerCase().includes(searchLower) ||
      doctor.specialization?.toLowerCase().includes(searchLower) ||
      doctor.department?.name?.toLowerCase().includes(searchLower) ||
      doctor.userId?.email?.toLowerCase().includes(searchLower)
    );
  }) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const todayQuote = doctorQuotes[new Date().getDay() % doctorQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Admin and doctors/doc.png" 
          alt="Doctor Management Background"
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
            <Stethoscope className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-800">Doctor Management</h1>
          </div>
          
          {/* Daily Quote */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-green-200 max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium italic">"{todayQuote}"</p>
                <p className="text-green-600 text-sm mt-2">— Healthcare Excellence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Add Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-green-100">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search doctors by name, specialization, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <button
              data-add-doctor
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add New Doctor
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor: any) => (
            <div key={doctor._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-green-100">
              {/* Doctor Image Header */}
              <div className="relative h-32 bg-gradient-to-r from-green-500 to-blue-500">
                <img 
                  src={getDepartmentImage(doctor.department?.name)}
                  alt={doctor.department?.name}
                  className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-blue-600/80"></div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* Status Toggle */}
                  <button
                    onClick={() => handleToggleStatus(doctor._id)}
                    className={`p-2 rounded-full transition-all duration-300 ${
                      doctor.isActive 
                        ? 'bg-green-500 hover:bg-green-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                    title={doctor.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                  >
                    {doctor.isActive ? (
                      <ToggleRight className="w-4 h-4 text-white" />
                    ) : (
                      <ToggleLeft className="w-4 h-4 text-white" />
                    )}
                  </button>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    doctor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Doctor Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                      Dr. {doctor.userId?.name}
                    </h3>
                    <p className="text-green-600 font-medium">{doctor.specialization}</p>
                    <p className="text-sm text-gray-600">{doctor.department?.name}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{doctor.userId?.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Experience:</span>
                    <span className="font-medium">{doctor.experience} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Consultation Fee:</span>
                    <span className="font-medium text-green-600">${doctor.consultationFee}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewDetails(doctor._id)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View
                  </button>
                  <button
                    onClick={() => handleEdit(doctor)}
                    className="flex-1 bg-green-50 text-green-600 py-2 px-3 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
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

        {filteredDoctors.length === 0 && (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">No doctors found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria' : 'Add your first doctor to get started'}
            </p>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showModal && (
        <div className="glass-modal">
          <div className="glass-modal-content w-full max-w-2xl">
            <div className="glass-modal-header">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Add New Doctor</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="glass-modal-body">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doctor-name" className="glass-form-label">Full Name *</label>
                    <input
                      id="doctor-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="glass-form-input"
                      placeholder="Enter doctor's full name (e.g., Dr. John Smith)"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-email" className="glass-form-label">Email Address *</label>
                    <input
                      id="doctor-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="glass-form-input"
                      placeholder="doctor@hospital.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doctor-password" className="glass-form-label">Password *</label>
                    <input
                      id="doctor-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="glass-form-input"
                      placeholder="Create a secure password (min 8 characters)"
                      required
                      minLength={8}
                    />
                    <div className="glass-form-success">
                      <span>💡 Use a strong password with letters, numbers, and symbols</span>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="doctor-specialization" className="glass-form-label">Medical Specialization *</label>
                    <input
                      id="doctor-specialization"
                      type="text"
                      value={form.specialization}
                      onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                      className="glass-form-input"
                      placeholder="e.g., Cardiologist, Neurologist, Pediatrician"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="doctor-department" className="glass-form-label">Department *</label>
                    <select
                      id="doctor-department"
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="glass-form-input"
                      required
                    >
                      <option value="">Select Department</option>
                      {departments?.map((dept: any) => (
                        <option key={dept._id} value={dept._id}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="doctor-consultation-fee" className="glass-form-label">Consultation Fee ($) *</label>
                    <input
                      id="doctor-consultation-fee"
                      type="number"
                      value={form.consultationFee}
                      onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                      className="glass-form-input"
                      placeholder="e.g., 100"
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="doctor-experience" className="glass-form-label">Experience (years)</label>
                    <input
                      id="doctor-experience"
                      type="number"
                      value={form.experience}
                      onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                      className="glass-form-input"
                      placeholder="e.g., 5"
                      min="0"
                    />
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <label htmlFor="doctor-qualifications" className="glass-form-label">Medical Qualifications</label>
                  <div className="space-y-2">
                    {form.qualifications.map((qual, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          id={`doctor-qualification-${index}`}
                          type="text"
                          value={qual}
                          onChange={(e) => handleQualificationChange(index, e.target.value)}
                          className="glass-form-input"
                          placeholder="e.g., MBBS, MD, PhD"
                        />
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addQualification}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Qualification
                    </button>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <label className="glass-form-label">Doctor Availability</label>
                  <p className="text-sm text-gray-600 mb-3">Select the days when this doctor will be available for appointments:</p>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <label key={day} className="flex flex-col items-center p-3 border-2 border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={form.availability.days.includes(day)}
                          onChange={() => handleAvailabilityDayChange(day)}
                          className="mb-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-xs capitalize font-medium text-gray-700">{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      💡 <strong>Tip:</strong> Select all days when the doctor will be available. You can set specific hours below.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="doctor-start-time" className="glass-form-label">Start Time</label>
                      <input
                        id="doctor-start-time"
                        type="time"
                        value={form.availability.startTime}
                        onChange={(e) => setForm({
                          ...form,
                          availability: { ...form.availability, startTime: e.target.value }
                        })}
                        className="glass-form-input"
                      />
                    </div>
                    <div>
                      <label htmlFor="doctor-end-time" className="glass-form-label">End Time</label>
                      <input
                        id="doctor-end-time"
                        type="time"
                        value={form.availability.endTime}
                        onChange={(e) => setForm({
                          ...form,
                          availability: { ...form.availability, endTime: e.target.value }
                        })}
                        className="glass-form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
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
                    {isSubmitting ? 'Adding Doctor...' : 'Add Doctor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Doctor Modal */}
      {showEditModal && editingDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Edit Doctor</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDoctor(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              {/* Same form fields as Add Doctor Modal but for editing */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-doctor-name" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    id="edit-doctor-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter doctor's full name (e.g., Dr. John Smith)"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-doctor-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    id="edit-doctor-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="doctor@hospital.com"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-doctor-password" className="block text-sm font-medium text-gray-700 mb-2">New Password (leave blank to keep current)</label>
                  <input
                    id="edit-doctor-password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Leave blank to keep current password"
                  />
                </div>
                <div>
                  <label htmlFor="edit-doctor-specialization" className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                  <input
                    id="edit-doctor-specialization"
                    type="text"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Cardiologist, Neurologist, Pediatrician"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="edit-doctor-department" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    id="edit-doctor-department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments?.map((dept: any) => (
                      <option key={dept._id} value={dept._id}>{dept.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="edit-doctor-consultation-fee" className="block text-sm font-medium text-gray-700 mb-2">Consultation Fee ($)</label>
                  <input
                    id="edit-doctor-consultation-fee"
                    type="number"
                    value={form.consultationFee}
                    onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 100"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="edit-doctor-experience" className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                  <input
                    id="edit-doctor-experience"
                    type="number"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., 5"
                    min="0"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingDoctor(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Details Modal */}
      {showDetailModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Details</h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDoctor(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Dr. {selectedDoctor.userId?.name}
                </h3>
                <p className="text-green-600 font-medium text-lg">{selectedDoctor.specialization}</p>
                <p className="text-gray-600">{selectedDoctor.department?.name}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                  selectedDoctor.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedDoctor.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Email:</span> {selectedDoctor.userId?.email}</p>
                    <p><span className="text-gray-600">Experience:</span> {selectedDoctor.experience} years</p>
                    <p><span className="text-gray-600">Consultation Fee:</span> ${selectedDoctor.consultationFee}</p>
                    {selectedDoctor.appointmentsCount !== undefined && (
                      <p><span className="text-gray-600">Total Appointments:</span> {selectedDoctor.appointmentsCount}</p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Qualifications</h4>
                  {selectedDoctor.qualifications?.length > 0 ? (
                    <ul className="space-y-1">
                      {selectedDoctor.qualifications.map((qual: string, index: number) => (
                        <li key={index} className="text-gray-600">• {qual}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No qualifications listed</p>
                  )}
                </div>
              </div>

              {selectedDoctor.availability && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Availability</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {selectedDoctor.availability.days?.length > 0 ? (
                      <div>
                        <p className="text-gray-600 mb-2">
                          <span className="font-medium">Days:</span> {selectedDoctor.availability.days.map((day: string) => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}
                        </p>
                        {selectedDoctor.availability.startTime && selectedDoctor.availability.endTime && (
                          <p className="text-gray-600">
                            <span className="font-medium">Time:</span> {selectedDoctor.availability.startTime} - {selectedDoctor.availability.endTime}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No availability schedule set</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedDoctor(null);
                    handleEdit(selectedDoctor);
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Doctor
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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
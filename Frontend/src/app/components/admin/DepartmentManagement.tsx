import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { Plus, Building2, Users, Sparkles, Target, Edit, Trash2, UserCheck, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { getDepartmentImage } from '../../utils/departmentImages';
import api from '../../services/api';

const departmentQuotes = [
  "Organization creates efficiency.",
  "Well-managed departments deliver excellence.",
  "Structure enables success.",
  "Coordination is key to hospital excellence.",
  "Strong departments build strong hospitals."
];

export function DepartmentManagement() {
  const { departments, setDepartments, loading, doctors } = useContext(AdminContext);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [headDoctor, setHeadDoctor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<any>(null);

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Department name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/admin/departments', { 
        name: name.trim(),
        description: description.trim() || undefined,
        headDoctor: headDoctor || undefined
      });
      setDepartments((prev: any) => [...prev, response.data.department]);
      setName('');
      setDescription('');
      setHeadDoctor('');
      toast.success('Department added successfully');
    } catch (error: any) {
      console.error('Add department error:', error);
      toast.error(error.response?.data?.message || 'Failed to add department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDepartment = (dept: any) => {
    setEditingDept(dept);
    setName(dept.name);
    setDescription(dept.description || '');
    setHeadDoctor(dept.headDoctor?._id || '');
    setShowEditModal(true);
  };

  const handleUpdateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Department name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.put(`/admin/departments/${editingDept._id}`, {
        name: name.trim(),
        description: description.trim() || undefined,
        headDoctor: headDoctor || undefined
      });
      
      setDepartments((prev: any) => 
        prev.map((d: any) => d._id === editingDept._id ? response.data.department : d)
      );
      
      setShowEditModal(false);
      setEditingDept(null);
      setName('');
      setDescription('');
      setHeadDoctor('');
      toast.success('Department updated successfully');
    } catch (error: any) {
      console.error('Update department error:', error);
      toast.error(error.response?.data?.message || 'Failed to update department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!departmentToDelete) return;

    setIsSubmitting(true);
    try {
      await api.delete(`/admin/departments/${departmentToDelete._id}`);
      setDepartments((prev: any) => prev.filter((d: any) => d._id !== departmentToDelete._id));
      setShowDeleteModal(false);
      setDepartmentToDelete(null);
      toast.success('Department deleted successfully');
    } catch (error: any) {
      console.error('Delete department error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (dept: any) => {
    setDepartmentToDelete(dept);
    setShowDeleteModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingDept(null);
    setName('');
    setDescription('');
    setHeadDoctor('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const todayQuote = departmentQuotes[new Date().getDay() % departmentQuotes.length];

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/Public/Admin and doctors/docHolder.jpg" 
          alt="Department Management Background"
          className="w-full h-full object-cover opacity-10"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/Public/departments/cardio.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90"></div>
      </div>

      <div className="relative z-10 space-y-6 p-6">
        {/* Header with Quote */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Department Management</h1>
          </div>
          <p className="text-gray-600 mb-4">Organize and manage hospital departments</p>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-200 shadow-sm max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-700 font-medium italic">"{todayQuote}"</p>
                <p className="text-gray-500 text-sm mt-1">— Organization Inspiration</p>
              </div>
            </div>
          </div>
        </div>

        {/* Add Department Form */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Add New Department</h2>
          </div>
          <form onSubmit={handleAddDepartment} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                placeholder="Department Name (e.g., Cardiology)"
                disabled={isSubmitting}
                required
              />
              <select
                value={headDoctor}
                onChange={e => setHeadDoctor(e.target.value)}
                className="border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                disabled={isSubmitting}
              >
                <option value="">Select Head Doctor (Optional)</option>
                {doctors?.map((doctor: any) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.userId?.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              placeholder="Department Description (Optional)"
              rows={3}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              {isSubmitting ? 'Adding...' : 'Add Department'}
            </button>
          </form>
        </div>

        {/* Departments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments?.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No departments found</p>
              <p className="text-gray-400">Add your first department to get started</p>
            </div>
          ) : (
            departments?.map((dept: any) => (
              <div key={dept._id} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-blue-100">
                <div className="relative">
                  <img 
                    src={getDepartmentImage(dept.name)} 
                    alt={dept.name}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/Public/Admin and doctors/docHolder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium shadow-sm">
                      Active
                    </span>
                  </div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{dept.name}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Users className="w-4 h-4" />
                    <span>Doctors: {dept.doctorCount || 0}</span>
                    <span className="mx-2">•</span>
                    <span>ID: {dept._id.slice(-6)}</span>
                  </div>
                  
                  {dept.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dept.description}</p>
                  )}
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        {dept.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Head Doctor</span>
                      <span className="text-sm text-blue-600 font-medium">
                        {dept.headDoctor?.userId?.name ? `Dr. ${dept.headDoctor.userId.name}` : 'Not Assigned'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Created</span>
                      <span className="text-sm text-gray-500">
                        {new Date(dept.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleEditDepartment(dept)}
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => confirmDelete(dept)}
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                      disabled={dept.doctorCount > 0}
                      title={dept.doctorCount > 0 ? 'Cannot delete department with doctors' : 'Delete department'}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Department Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-blue-600" />
                  Edit Department
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateDepartment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department Name *
                </label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department Name"
                  disabled={isSubmitting}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Head Doctor
                </label>
                <select
                  value={headDoctor}
                  onChange={e => setHeadDoctor(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                >
                  <option value="">Select Head Doctor (Optional)</option>
                  {doctors?.map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.userId?.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department Description (Optional)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-300"
                >
                  {isSubmitting ? 'Updating...' : 'Update Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && departmentToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Department</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <strong>{departmentToDelete.name}</strong>? 
                This action cannot be undone.
              </p>
              
              {departmentToDelete.doctorCount > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800 text-sm">
                    <strong>Cannot delete:</strong> This department has {departmentToDelete.doctorCount} doctor(s). 
                    Please reassign them to other departments first.
                  </p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDepartment}
                  disabled={isSubmitting || departmentToDelete.doctorCount > 0}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useContext, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';
import { toast } from 'sonner';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserX, 
  Key,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Clock,
  Building2
} from 'lucide-react';

export function ReceptionistManagement() {
  const { 
    receptionists, 
    addReceptionist, 
    updateReceptionist, 
    deleteReceptionist, 
    toggleReceptionistStatus,
    resetReceptionistPassword 
  } = useContext(AdminContext);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReceptionist, setEditingReceptionist] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [viewingReceptionist, setViewingReceptionist] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    shift: '',
    phone: '',
    address: '',
    salary: '',
    experience: '',
    skills: [] as string[],
    languages: ['English'],
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const departments = ['Front Desk', 'Appointments', 'Billing', 'Insurance', 'General'];
  const shifts = ['morning', 'afternoon', 'evening', 'night'];
  const availableSkills = [
    'Customer Service',
    'Phone Etiquette', 
    'Appointment Scheduling',
    'Medical Billing',
    'Insurance Processing',
    'Data Entry',
    'Multi-tasking',
    'Computer Skills',
    'Communication',
    'Problem Solving'
  ];

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeId: '',
      department: '',
      shift: '',
      phone: '',
      address: '',
      salary: '',
      experience: '',
      skills: [],
      languages: ['English'],
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const receptionistData = {
        ...formData,
        salary: parseFloat(formData.salary),
        experience: parseInt(formData.experience) || 0
      };

      if (editingReceptionist) {
        await updateReceptionist(editingReceptionist._id, receptionistData);
        toast.success('Receptionist updated successfully');
        setEditingReceptionist(null);
      } else {
        await addReceptionist(receptionistData);
        toast.success('Receptionist added successfully');
        setShowAddForm(false);
      }
      
      resetForm();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (receptionist: any) => {
    setFormData({
      name: receptionist.userId?.name || '',
      email: receptionist.userId?.email || '',
      password: '',
      employeeId: receptionist.employeeId || '',
      department: receptionist.department || '',
      shift: receptionist.shift || '',
      phone: receptionist.phone || '',
      address: receptionist.address || '',
      salary: receptionist.salary?.toString() || '',
      experience: receptionist.experience?.toString() || '',
      skills: receptionist.skills || [],
      languages: receptionist.languages || ['English'],
      emergencyContact: receptionist.emergencyContact || {
        name: '',
        relationship: '',
        phone: ''
      }
    });
    setEditingReceptionist(receptionist);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this receptionist?')) {
      try {
        await deleteReceptionist(id);
        toast.success('Receptionist deleted successfully');
      } catch (error) {
        toast.error('Failed to delete receptionist');
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleReceptionistStatus(id);
      toast.success('Receptionist status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (id: string) => {
    const newPassword = prompt('Enter new password:');
    if (newPassword) {
      try {
        await resetReceptionistPassword(id, newPassword);
        toast.success('Password reset successfully');
      } catch (error) {
        toast.error('Failed to reset password');
      }
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-7 h-7 text-orange-600" />
            Receptionist Management
          </h2>
          <p className="text-gray-600 mt-1">Manage hospital reception staff</p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingReceptionist(null);
            resetForm();
          }}
          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Receptionist
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border">
          <h3 className="text-xl font-bold mb-4">
            {editingReceptionist ? 'Edit Receptionist' : 'Add New Receptionist'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="receptionist-name" className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  id="receptionist-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter receptionist's full name"
                  required
                />
              </div>

              <div>
                <label htmlFor="receptionist-email" className="block text-sm font-medium mb-2">Email *</label>
                <input
                  id="receptionist-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="receptionist@hospital.com"
                  required
                />
              </div>
            </div>

            {/* Password (only for new receptionists) */}
            {!editingReceptionist && (
              <div>
                <label htmlFor="receptionist-password" className="block text-sm font-medium mb-2">Password *</label>
                <div className="relative">
                  <input
                    id="receptionist-password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Create a secure password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Employee Details */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="receptionist-employee-id" className="block text-sm font-medium mb-2">Employee ID *</label>
                <input
                  id="receptionist-employee-id"
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="REC001"
                  required
                />
              </div>

              <div>
                <label htmlFor="receptionist-department" className="block text-sm font-medium mb-2">Department *</label>
                <select
                  id="receptionist-department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="receptionist-shift" className="block text-sm font-medium mb-2">Shift *</label>
                <select
                  id="receptionist-shift"
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Shift</option>
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>
                      {shift.charAt(0).toUpperCase() + shift.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="receptionist-phone" className="block text-sm font-medium mb-2">Phone *</label>
                <input
                  id="receptionist-phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., +1 (555) 123-4567"
                  required
                />
              </div>

              <div>
                <label htmlFor="receptionist-address" className="block text-sm font-medium mb-2">Address *</label>
                <input
                  id="receptionist-address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter full address"
                  required
                />
              </div>
            </div>

            {/* Salary and Experience */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="receptionist-salary" className="block text-sm font-medium mb-2">Salary (Monthly) *</label>
                <input
                  id="receptionist-salary"
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="50000"
                  required
                />
              </div>

              <div>
                <label htmlFor="receptionist-experience" className="block text-sm font-medium mb-2">Experience (Years)</label>
                <input
                  id="receptionist-experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="2"
                  min="0"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Professional Skills
              </label>
              <p className="text-sm text-gray-600 mb-3">Select all skills that apply to this receptionist:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {availableSkills.map(skill => (
                  <label 
                    key={skill} 
                    htmlFor={`skill-${skill.replace(/\s+/g, '-').toLowerCase()}`}
                    className="flex items-center space-x-2 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors"
                  >
                    <input
                      id={`skill-${skill.replace(/\s+/g, '-').toLowerCase()}`}
                      type="checkbox"
                      checked={formData.skills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="rounded border-gray-300 text-orange-600 focus:ring-orange-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700 select-none">
                      {skill}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Select multiple skills to help match the receptionist with appropriate tasks and responsibilities.
              </p>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block text-sm font-medium mb-2">Emergency Contact</label>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="receptionist-emergency-name" className="block text-sm font-medium mb-1 text-gray-700">
                    Contact Name
                  </label>
                  <input
                    id="receptionist-emergency-name"
                    type="text"
                    placeholder="e.g., John Smith"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                    })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="receptionist-emergency-relationship" className="block text-sm font-medium mb-1 text-gray-700">
                    Relationship
                  </label>
                  <input
                    id="receptionist-emergency-relationship"
                    type="text"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                    })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label htmlFor="receptionist-emergency-phone" className="block text-sm font-medium mb-1 text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="receptionist-emergency-phone"
                    type="tel"
                    placeholder="e.g., +1 (555) 987-6543"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                    })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Saving...' : (editingReceptionist ? 'Update' : 'Add')} Receptionist
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingReceptionist(null);
                  resetForm();
                }}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Receptionists List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Receptionists ({receptionists?.length || 0})</h3>
        </div>

        {receptionists?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No receptionists found. Add your first receptionist to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receptionist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receptionists?.map((receptionist: any) => (
                  <tr key={receptionist._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {receptionist.userId?.name}
                        </div>
                        <div className="text-sm text-gray-500">{receptionist.userId?.email}</div>
                        <div className="text-xs text-gray-400">ID: {receptionist.employeeId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{receptionist.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900 capitalize">{receptionist.shift}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{receptionist.phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        receptionist.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {receptionist.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingReceptionist(receptionist)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(receptionist)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(receptionist._id)}
                          className={`${receptionist.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                          title={receptionist.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {receptionist.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleResetPassword(receptionist._id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(receptionist._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Receptionist Modal */}
      {viewingReceptionist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Receptionist Details</h3>
              <button
                onClick={() => setViewingReceptionist(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Name</label>
                  <p className="text-gray-900">{viewingReceptionist.userId?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{viewingReceptionist.userId?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Employee ID</label>
                  <p className="text-gray-900">{viewingReceptionist.employeeId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Department</label>
                  <p className="text-gray-900">{viewingReceptionist.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Shift</label>
                  <p className="text-gray-900 capitalize">{viewingReceptionist.shift}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{viewingReceptionist.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Salary</label>
                  <p className="text-gray-900">${viewingReceptionist.salary?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600">Experience</label>
                  <p className="text-gray-900">{viewingReceptionist.experience} years</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{viewingReceptionist.address}</p>
              </div>
              
              {viewingReceptionist.skills?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Skills</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {viewingReceptionist.skills.map((skill: string) => (
                      <span key={skill} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {viewingReceptionist.emergencyContact?.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-600">Emergency Contact</label>
                  <p className="text-gray-900">
                    {viewingReceptionist.emergencyContact.name} ({viewingReceptionist.emergencyContact.relationship}) - {viewingReceptionist.emergencyContact.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
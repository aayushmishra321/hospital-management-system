import { useState, useEffect, useContext } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Upload, Camera } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, updateUser } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [originalProfile, setOriginalProfile] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    avatar: ''
  });

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/profile');
      const profileData = {
        name: response.data.user?.name || '',
        email: response.data.user?.email || '',
        phone: response.data.profile?.phone || '',
        address: response.data.profile?.address || '',
        dateOfBirth: response.data.profile?.dateOfBirth ? 
          new Date(response.data.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: response.data.profile?.gender || '',
        avatar: response.data.user?.avatar || ''
      };
      setProfile(profileData);
      setOriginalProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Prepare data for API
      const updateData = {
        name: profile.name,
        email: profile.email,
        profileData: {
          phone: profile.phone,
          address: profile.address,
          dateOfBirth: profile.dateOfBirth,
          gender: profile.gender
        }
      };

      const response = await api.put('/user/profile', updateData);
      
      // Update auth context with new user data
      if (updateUser) {
        updateUser(response.data.user);
      }
      
      setOriginalProfile(profile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/user/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({ ...prev, avatar: response.data.avatarUrl }));
      
      if (updateUser) {
        updateUser({ ...user, avatar: response.data.avatarUrl });
      }
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-6 h-6" />
            My Profile
          </h2>
          <p className="text-gray-600">Manage your personal information</p>
        </div>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-12 h-12 text-gray-400 ${profile.avatar ? 'hidden' : ''}`} />
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{profile.name || 'User Name'}</h3>
              <p className="text-gray-600">{profile.email || 'user@example.com'}</p>
              <p className="text-sm text-gray-500">{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'} Account</p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <User className="w-4 h-4 text-gray-400" />
                    {profile.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {profile.email}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {profile.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium text-gray-900">Additional Information</h4>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                {isEditing ? (
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-start gap-2 text-gray-900">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    {profile.address}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={profile.dateOfBirth}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-gray-900">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                {isEditing ? (
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="text-gray-900 capitalize">{profile.gender}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
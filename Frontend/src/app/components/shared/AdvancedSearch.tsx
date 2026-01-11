import { useState } from 'react';
import { Search, Filter, X, Calendar, User, Stethoscope, DollarSign } from 'lucide-react';

interface SearchFilters {
  query: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  doctor: string;
  patient: string;
  department: string;
  amountMin: string;
  amountMax: string;
  type: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  searchType: 'appointments' | 'patients' | 'medical-records' | 'billing';
  doctors?: any[];
  patients?: any[];
  departments?: any[];
}

export function AdvancedSearch({ 
  onSearch, 
  searchType, 
  doctors = [], 
  patients = [], 
  departments = [] 
}: AdvancedSearchProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    doctor: '',
    patient: '',
    department: '',
    amountMin: '',
    amountMax: '',
    type: ''
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      query: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      doctor: '',
      patient: '',
      department: '',
      amountMin: '',
      amountMax: '',
      type: ''
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const getStatusOptions = () => {
    switch (searchType) {
      case 'appointments':
        return ['booked', 'checked-in', 'completed', 'cancelled'];
      case 'medical-records':
        return ['draft', 'completed', 'reviewed'];
      case 'billing':
        return ['unpaid', 'paid', 'partially_paid', 'refunded'];
      default:
        return [];
    }
  };

  const getTypeOptions = () => {
    switch (searchType) {
      case 'medical-records':
        return ['consultation', 'follow-up', 'emergency', 'routine'];
      case 'billing':
        return ['consultation', 'procedure', 'medication', 'lab-test'];
      default:
        return [];
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search Bar */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <label htmlFor="advanced-search-input" className="block text-sm font-medium mb-2 text-gray-700">
            Search {searchType.replace('-', ' ')}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              id="advanced-search-input"
              type="text"
              placeholder={`Enter ${searchType.replace('-', ' ')} keywords...`}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
            showFilters 
              ? 'bg-blue-50 border-blue-300 text-blue-700' 
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            {getStatusOptions().length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {getStatusOptions().map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Doctor Filter */}
            {doctors.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <Stethoscope className="w-4 h-4 inline mr-1" />
                  Doctor
                </label>
                <select
                  value={filters.doctor}
                  onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Doctors</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.userId?.name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Patient Filter */}
            {patients.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Patient
                </label>
                <select
                  value={filters.patient}
                  onChange={(e) => setFilters({ ...filters, patient: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Patients</option>
                  {patients.map(patient => (
                    <option key={patient._id} value={patient._id}>
                      {patient.userId?.name} - {patient.userId?.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Department Filter */}
            {departments.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Amount Range (for billing) */}
            {searchType === 'billing' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.amountMin}
                    onChange={(e) => setFilters({ ...filters, amountMin: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={filters.amountMax}
                    onChange={(e) => setFilters({ ...filters, amountMax: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Type Filter */}
            {getTypeOptions().length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Types</option>
                  {getTypeOptions().map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Filter Actions */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
            
            <div className="text-sm text-gray-500">
              {Object.values(filters).filter(v => v !== '').length} filter(s) applied
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
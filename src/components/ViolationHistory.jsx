import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

function ViolationHistory() {
  const [violations, setViolations] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    vehicle_id: '',
    geofence_id: '',
    start_date: '',
    end_date: '',
    limit: '50',
  })
  const [vehicles, setVehicles] = useState([])
  const [geofences, setGeofences] = useState([])

  useEffect(() => {
    fetchVehiclesAndGeofences()
  }, [])

  useEffect(() => {
    fetchViolations()
  }, [filters])

  const fetchVehiclesAndGeofences = async () => {
    try {
      const [vehiclesRes, geofencesRes] = await Promise.all([
        apiClient.get('/vehicles'),
        apiClient.get('/geofences'),
      ])
      setVehicles(vehiclesRes.data.vehicles || [])
      setGeofences(geofencesRes.data.geofences || [])
    } catch (error) {
      console.error('Failed to fetch vehicles/geofences:', error)
    }
  }

  const fetchViolations = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.vehicle_id) params.vehicle_id = filters.vehicle_id
      if (filters.geofence_id) params.geofence_id = filters.geofence_id
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.limit) params.limit = filters.limit

      const response = await apiClient.get('/violations/history', { params })
      setViolations(response.data.violations || [])
      setTotalCount(response.data.total_count || 0)
    } catch (error) {
      toast.error('Failed to fetch violation history')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    setFilters({
      vehicle_id: '',
      geofence_id: '',
      start_date: '',
      end_date: '',
      limit: '50',
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Violation History</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={filters.vehicle_id}
              onChange={(e) => handleFilterChange('vehicle_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Geofence</label>
            <select
              value={filters.geofence_id}
              onChange={(e) => handleFilterChange('geofence_id', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">All Geofences</option>
              {geofences.map((geofence) => (
                <option key={geofence.id} value={geofence.id}>
                  {geofence.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="datetime-local"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="datetime-local"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Total Records: {totalCount}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Violations ({violations.length})</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : violations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No violations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geofence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.map((violation) => (
                  <tr key={violation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{violation.vehicle_number}</div>
                      <div className="text-sm text-gray-500">ID: {violation.vehicle_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {violation.geofence_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        violation.event_type === 'entry' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {violation.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {violation.latitude.toFixed(6)}, {violation.longitude.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(violation.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViolationHistory





import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

function AlertConfiguration() {
  const [alerts, setAlerts] = useState([])
  const [geofences, setGeofences] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    geofence_id: '',
    vehicle_id: '',
    event_type: 'entry',
  })
  const [filters, setFilters] = useState({
    geofence_id: '',
    vehicle_id: '',
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [alertsRes, geofencesRes, vehiclesRes] = await Promise.all([
        apiClient.get('/alerts', { params: filters }),
        apiClient.get('/geofences'),
        apiClient.get('/vehicles'),
      ])
      setAlerts(alertsRes.data.alerts || [])
      setGeofences(geofencesRes.data.geofences || [])
      setVehicles(vehiclesRes.data.vehicles || [])
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const payload = {
        geofence_id: formData.geofence_id,
        event_type: formData.event_type,
      }
      if (formData.vehicle_id) {
        payload.vehicle_id = formData.vehicle_id
      }
      await apiClient.post('/alerts/configure', payload)
      toast.success('Alert configured successfully')
      setShowForm(false)
      setFormData({ geofence_id: '', vehicle_id: '', event_type: 'entry' })
      fetchData()
    } catch (error) {
      toast.error(error.response?.data || 'Failed to configure alert')
      console.error(error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Alert Configuration</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Configure Alert'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Geofence</label>
          <select
            value={filters.geofence_id}
            onChange={(e) => setFilters({ ...filters, geofence_id: e.target.value })}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Vehicle</label>
          <select
            value={filters.vehicle_id}
            onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value })}
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
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configure New Alert</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Geofence *</label>
              <select
                required
                value={formData.geofence_id}
                onChange={(e) => setFormData({ ...formData, geofence_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">-- Select Geofence --</option>
                {geofences.map((geofence) => (
                  <option key={geofence.id} value={geofence.id}>
                    {geofence.name} ({geofence.category})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle (Optional)</label>
              <select
                value={formData.vehicle_id}
                onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">All Vehicles</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicle_number} - {vehicle.driver_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
              <select
                required
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="entry">Entry</option>
                <option value="exit">Exit</option>
                <option value="both">Both</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Configure Alert
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Configured Alerts ({alerts.length})</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No alerts configured</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Geofence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {alerts.map((alert) => (
                  <tr key={alert.alert_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {alert.geofence_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {alert.vehicle_number || 'All Vehicles'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        alert.event_type === 'entry' ? 'bg-red-100 text-red-800' : 
                        alert.event_type === 'exit' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {alert.event_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        alert.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {alert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(alert.created_at).toLocaleDateString()}
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

export default AlertConfiguration





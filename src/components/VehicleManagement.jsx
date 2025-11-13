import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

function VehicleManagement() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    vehicle_number: '',
    driver_name: '',
    vehicle_type: 'truck',
    phone: '',
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/vehicles')
      setVehicles(response.data.vehicles || [])
    } catch (error) {
      toast.error('Failed to fetch vehicles')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiClient.post('/vehicles', formData)
      toast.success('Vehicle registered successfully')
      setShowForm(false)
      setFormData({ vehicle_number: '', driver_name: '', vehicle_type: 'truck', phone: '' })
      fetchVehicles()
    } catch (error) {
      toast.error(error.response?.data || 'Failed to register vehicle')
      console.error(error)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Register Vehicle'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Register New Vehicle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number *</label>
              <input
                type="text"
                required
                value={formData.vehicle_number}
                onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="KA-01-AB-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name *</label>
              <input
                type="text"
                required
                value={formData.driver_name}
                onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type *</label>
              <select
                required
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="truck">Truck</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="motorcycle">Motorcycle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                placeholder="+1234567890"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Register Vehicle
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Registered Vehicles ({vehicles.length})</h2>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No vehicles registered</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
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
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {vehicle.vehicle_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.driver_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.vehicle_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehicle.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        vehicle.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {vehicle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(vehicle.created_at).toLocaleDateString()}
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

export default VehicleManagement





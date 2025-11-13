import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import apiClient from '../api/client'
import toast from 'react-hot-toast'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function GeofenceManagement() {
  const [geofences, setGeofences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'delivery_zone',
    coordinates: [],
  })
  const [drawingMode, setDrawingMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  useEffect(() => {
    fetchGeofences()
  }, [selectedCategory])

  const fetchGeofences = async () => {
    try {
      setLoading(true)
      const url = selectedCategory ? `/geofences?category=${selectedCategory}` : '/geofences'
      const response = await apiClient.get(url)
      setGeofences(response.data.geofences || [])
    } catch (error) {
      toast.error('Failed to fetch geofences')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.coordinates.length < 4) {
      toast.error('Please draw at least 3 points on the map (polygon will auto-close)')
      return
    }

    // Ensure polygon is closed
    const coords = [...formData.coordinates]
    if (coords.length > 0) {
      const first = coords[0]
      const last = coords[coords.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        coords.push([first[0], first[1]])
      }
    }

    try {
      const payload = {
        ...formData,
        coordinates: coords,
      }
      await apiClient.post('/geofences', payload)
      toast.success('Geofence created successfully')
      setShowForm(false)
      setFormData({ name: '', description: '', category: 'delivery_zone', coordinates: [] })
      setDrawingMode(false)
      fetchGeofences()
    } catch (error) {
      toast.error(error.response?.data || 'Failed to create geofence')
      console.error(error)
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      delivery_zone: 'blue',
      restricted_zone: 'red',
      toll_zone: 'yellow',
      customer_area: 'green',
    }
    return colors[category] || 'gray'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Geofence Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ Create Geofence'}
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2"
        >
          <option value="">All Categories</option>
          <option value="delivery_zone">Delivery Zone</option>
          <option value="restricted_zone">Restricted Zone</option>
          <option value="toll_zone">Toll Zone</option>
          <option value="customer_area">Customer Area</option>
        </select>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Geofence</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
                rows="3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="delivery_zone">Delivery Zone</option>
                <option value="restricted_zone">Restricted Zone</option>
                <option value="toll_zone">Toll Zone</option>
                <option value="customer_area">Customer Area</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={() => setDrawingMode(!drawingMode)}
                className={`px-4 py-2 rounded-lg ${
                  drawingMode ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {drawingMode ? 'Stop Drawing' : 'Start Drawing on Map'}
              </button>
              {formData.coordinates.length > 0 && (
                <span className="ml-4 text-sm text-gray-600">
                  {formData.coordinates.length} point{formData.coordinates.length !== 1 ? 's' : ''} drawn
                </span>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Geofence
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow" style={{ height: '600px' }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{s}/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {drawingMode && <MapDrawer setCoordinates={(coords) => setFormData({ ...formData, coordinates: coords })} />}
          {geofences.map((geofence) => (
            <Polygon
              key={geofence.id}
              positions={geofence.coordinates.map(coord => [coord[0], coord[1]])}
              pathOptions={{
                color: getCategoryColor(geofence.category),
                fillColor: getCategoryColor(geofence.category),
                fillOpacity: 0.3,
              }}
            />
          ))}
        </MapContainer>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Geofences ({geofences.length})</h2>
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : geofences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No geofences found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {geofences.map((geofence) => (
              <div key={geofence.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{geofence.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    geofence.category === 'restricted_zone' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {geofence.category}
                  </span>
                </div>
                {geofence.description && (
                  <p className="text-sm text-gray-600 mb-2">{geofence.description}</p>
                )}
                <p className="text-xs text-gray-500">
                  Created: {new Date(geofence.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MapDrawer({ setCoordinates }) {
  useMapEvents({
    click(e) {
      const newPoint = [e.latlng.lat, e.latlng.lng]
      setCoordinates((prev) => [...prev, newPoint])
    },
  })

  return null
}

export default GeofenceManagement


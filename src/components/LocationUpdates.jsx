import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
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

function LocationUpdates() {
  const [vehicles, setVehicles] = useState([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 })
  const [currentGeofences, setCurrentGeofences] = useState([])
  const [loading, setLoading] = useState(false)
  const [vehicleLocations, setVehicleLocations] = useState({})

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleLocation(selectedVehicle)
    }
  }, [selectedVehicle])

  const fetchVehicles = async () => {
    try {
      const response = await apiClient.get('/vehicles')
      setVehicles(response.data.vehicles || [])
    } catch (error) {
      toast.error('Failed to fetch vehicles')
      console.error(error)
    }
  }

  const fetchVehicleLocation = async (vehicleId) => {
    try {
      const response = await apiClient.get(`/vehicles/location/${vehicleId}`)
      if (response.data.current_location) {
        setLocation({
          lat: response.data.current_location.latitude,
          lng: response.data.current_location.longitude,
        })
        setCurrentGeofences(response.data.current_geofences || [])
      }
    } catch (error) {
      // Vehicle might not have location yet
      console.log('No location data for vehicle')
    }
  }

  const handleUpdateLocation = async () => {
    if (!selectedVehicle) {
      toast.error('Please select a vehicle')
      return
    }

    try {
      setLoading(true)
      const payload = {
        vehicle_id: selectedVehicle,
        latitude: location.lat,
        longitude: location.lng,
        timestamp: new Date().toISOString(),
      }
      const response = await apiClient.post('/vehicles/location', payload)
      setCurrentGeofences(response.data.current_geofences || [])
      toast.success('Location updated successfully')
      fetchVehicleLocation(selectedVehicle)
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update location')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleMapClick = (e) => {
    setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Location Updates</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Vehicle *</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">-- Select Vehicle --</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.vehicle_number} - {vehicle.driver_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpdateLocation}
              disabled={loading || !selectedVehicle}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Location'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
            <input
              type="number"
              step="any"
              value={location.lat}
              onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
            <input
              type="number"
              step="any"
              value={location.lng}
              onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) || 0 })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4">
          Click on the map below to set the location, or enter coordinates manually.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow" style={{ height: '600px' }}>
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{s}/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onMapClick={handleMapClick} />
          <Marker position={[location.lat, location.lng]}>
            <Popup>
              <div>
                <p className="font-semibold">Selected Location</p>
                <p>Lat: {location.lat.toFixed(6)}</p>
                <p>Lng: {location.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      {currentGeofences.length > 0 && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Current Geofences</h2>
          <div className="space-y-2">
            {currentGeofences.map((geofence, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold">{geofence.geofence_name}</p>
                <p className="text-sm text-gray-600">{geofence.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e)
    },
  })
  return null
}

export default LocationUpdates





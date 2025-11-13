import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import toast from 'react-hot-toast'

function Dashboard({ alerts }) {
  const [stats, setStats] = useState({
    geofences: 0,
    vehicles: 0,
    activeAlerts: 0,
    violations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const [geofencesRes, vehiclesRes, alertsRes, violationsRes] = await Promise.all([
        apiClient.get('/geofences'),
        apiClient.get('/vehicles'),
        apiClient.get('/alerts'),
        apiClient.get('/violations/history?limit=1'),
      ])

      setStats({
        geofences: geofencesRes.data.geofences?.length || 0,
        vehicles: vehiclesRes.data.vehicles?.length || 0,
        activeAlerts: alertsRes.data.alerts?.length || 0,
        violations: violationsRes.data.total_count || 0,
      })
    } catch (error) {
      toast.error('Failed to fetch statistics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Geofences" value={stats.geofences} icon="📍" color="blue" />
        <StatCard title="Vehicles" value={stats.vehicles} icon="🚗" color="green" />
        <StatCard title="Active Alerts" value={stats.activeAlerts} icon="🔔" color="yellow" />
        <StatCard title="Total Violations" value={stats.violations} icon="📊" color="red" />
      </div>

      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 10).map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.event_type === 'entry' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {alert.vehicle.vehicle_number} - {alert.vehicle.driver_name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {alert.event_type === 'entry' ? 'Entered' : 'Exited'} {alert.geofence.geofence_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    alert.geofence.category === 'restricted_zone' ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'
                  }`}>
                    {alert.geofence.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color]} rounded-full p-3`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

export default Dashboard





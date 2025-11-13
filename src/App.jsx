import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import GeofenceManagement from './components/GeofenceManagement'
import VehicleManagement from './components/VehicleManagement'
import LocationUpdates from './components/LocationUpdates'
import AlertConfiguration from './components/AlertConfiguration'
import ViolationHistory from './components/ViolationHistory'
import Dashboard from './components/Dashboard'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        <AppContent />
      </div>
    </Router>
  )
}

function AppContent() {
  const location = useLocation()
  const [alerts, setAlerts] = useState([])
  
  useWebSocket((alert) => {
    setAlerts((prev) => [alert, ...prev].slice(0, 50)) // Keep last 50 alerts
  })

  const isActive = (path) => location.pathname === path

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Geofencing System</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/geofences"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/geofences') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  Geofences
                </Link>
                <Link
                  to="/vehicles"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/vehicles') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  Vehicles
                </Link>
                <Link
                  to="/locations"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/locations') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  Locations
                </Link>
                <Link
                  to="/alerts"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/alerts') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  Alerts
                </Link>
                <Link
                  to="/violations"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/violations') ? 'border-white' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  History
                </Link>
              </div>
            </div>
            {alerts.length > 0 && (
              <div className="flex items-center">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {alerts.length} Active Alert{alerts.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard alerts={alerts} />} />
          <Route path="/geofences" element={<GeofenceManagement />} />
          <Route path="/vehicles" element={<VehicleManagement />} />
          <Route path="/locations" element={<LocationUpdates />} />
          <Route path="/alerts" element={<AlertConfiguration />} />
          <Route path="/violations" element={<ViolationHistory />} />
        </Routes>
      </main>
    </div>
  )
}

export default App





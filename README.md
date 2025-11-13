# Frontend - Geofencing & Real-time Alert System

## Overview

React-based web application with real-time alert notifications, map visualization, and comprehensive geofencing management.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Leaflet** - Interactive maps
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## Structure

```
src/
├── components/
│   ├── Dashboard.jsx          # Main dashboard with stats
│   ├── GeofenceManagement.jsx # Create and manage geofences
│   ├── VehicleManagement.jsx  # Register and list vehicles
│   ├── LocationUpdates.jsx    # Update vehicle locations
│   ├── AlertConfiguration.jsx # Configure alert rules
│   └── ViolationHistory.jsx   # View historical events
├── hooks/
│   └── useWebSocket.js        # WebSocket connection hook
├── api/
│   └── client.js              # Axios API client
├── App.jsx                    # Main app component with routing
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## Features

- ✅ Interactive map with geofence visualization
- ✅ Real-time WebSocket alerts
- ✅ Geofence creation by drawing on map
- ✅ Vehicle location updates
- ✅ Alert configuration
- ✅ Violation history with filtering
- ✅ Responsive design

## Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws/alerts
```

## Development

The app runs on `http://localhost:3000` by default.

See main `SETUP.md` for detailed setup instructions.





import { useEffect, useRef } from 'react'
import toast from 'react-hot-toast'

export function useWebSocket(onMessage) {
  const wsRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)

  useEffect(() => {
    const connect = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws/alerts'
      
      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('WebSocket connected')
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
            reconnectTimeoutRef.current = null
          }
        }

        ws.onmessage = (event) => {
          try {
            const alert = JSON.parse(event.data)
            onMessage(alert)
            
            // Show toast notification
            toast.success(
              `${alert.vehicle.vehicle_number} ${alert.event_type === 'entry' ? 'entered' : 'exited'} ${alert.geofence.geofence_name}`,
              {
                duration: 5000,
                icon: alert.event_type === 'entry' ? '🚨' : '✅',
              }
            )
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('WebSocket disconnected, attempting to reconnect...')
          // Reconnect after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            connect()
          }, 3000)
        }
      } catch (error) {
        console.error('Error connecting WebSocket:', error)
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 3000)
      }
    }

    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [onMessage])
}





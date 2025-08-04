'use client'

import { MapPin, Plane } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false })
const Polyline = dynamic(() => import('react-leaflet').then(mod => mod.Polyline), { ssr: false })

interface Drone {
  id: string
  name: string
  model: string
  status: 'available' | 'in-mission' | 'charging' | 'maintenance' | 'returning'
  battery: number
  location: { lat: number; lng: number; alt: number }
  site: string
  currentMission?: string
}

interface Mission {
  id: string
  name: string
  droneId?: string
  surveyArea?: {
    coordinates: { lat: number; lng: number }[]
  }
  flightPlan?: {
    waypoints: { lat: number; lng: number; alt: number }[]
  }
  progress: number
}

interface DroneMapProps {
  drones: Drone[]
  missions: Mission[]
}

export const DroneMap: React.FC<DroneMapProps> = ({ drones, missions }) => {
  const [isClient, setIsClient] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)

  useEffect(() => {
    setIsClient(true)

    const loadLeaflet = async () => {
      if (typeof window !== 'undefined') {
        const L = await import('leaflet')

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })

        setLeafletLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#22c55e'
      case 'in-mission':
        return '#3b82f6'
      case 'charging':
        return '#f59e0b'
      case 'maintenance':
        return '#ef4444'
      case 'returning':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const createDroneIcon = (status: string) => {
    if (typeof window === 'undefined') return null

    const L = require('leaflet')
    const color = getStatusColor(status)

    return L.divIcon({
      className: 'custom-drone-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      popupAnchor: [0, -13]
    })
  }

  const getMissionForDrone = (droneId: string) => {
    return missions.find(m => m.droneId === droneId)
  }

  const getFlightPath = (mission: Mission) => {
    if (!mission.flightPlan?.waypoints) return []
    return mission.flightPlan.waypoints.map(wp => [wp.lat, wp.lng])
  }

  const getSurveyAreaPath = (mission: Mission) => {
    if (!mission.surveyArea?.coordinates) return []
    return mission.surveyArea.coordinates.map(coord => [coord.lat, coord.lng])
  }

  const defaultCenter: [number, number] = [process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT || 39.8283, process.env.NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG || -98.5795]
  const defaultZoom = process.env.NEXT_PUBLIC_MAP_DEFAULT_ZOOM || 4

  if (!isClient || !leafletLoaded) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Drone Map</h2>
            <p className="text-sm text-gray-600">Real-time positions and flight paths</p>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <span className="text-sm font-medium text-gray-700">Global View</span>
          </div>
        </div>
        <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
            <p className="text-gray-500">Loading map...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Live Drone Map</h2>
          <p className="text-sm text-gray-600">Real-time positions and flight paths</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span>In Mission</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span>Charging</span>
            </div>
          </div>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={drones.find(d => d.status === 'available')?.location || defaultCenter}
          zoom={Number(defaultZoom)}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
          boundsOptions={{ padding: [50, 50] }}
          bounds={(() => {
            const drone = drones.find(d => d.status === 'available')
            if (drone) {
              const mission = getMissionForDrone(drone.id)
              if (mission) {
                const flightPath = getFlightPath(mission)
                const surveyArea = getSurveyAreaPath(mission)
                return flightPath.length > 0 ? flightPath.map(p => [p[0], p[1]]) : surveyArea.map(p => [p[0], p[1]])
              }
            }
          })()}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {drones.map((drone) => {
            const mission = getMissionForDrone(drone.id)
            return (
              <Marker
                key={drone.id}
                position={[drone.location.lat, drone.location.lng]}
                icon={createDroneIcon(drone.status)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center space-x-2 mb-2">
                      <Plane className="w-4 h-4 text-primary-500" />
                      <h3 className="font-semibold text-gray-900">{drone.name}</h3>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Model: {drone.model}</div>
                      <div>Status: <span className="capitalize">{drone.status}</span></div>
                      <div>Battery: {drone.battery}%</div>
                      <div>Altitude: {drone.location.alt}m</div>
                      <div>Site: {drone.site}</div>
                      {mission && (
                        <div>Mission: {mission.name}</div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )
          })}

          {/* Flight Paths for Active Missions */}
          {missions.map((mission) => {
            const flightPath = getFlightPath(mission)
            const surveyArea = getSurveyAreaPath(mission)

            return (
              <div key={mission.id}>
                {surveyArea.length > 0 && (
                  <Polyline
                    positions={[...surveyArea, surveyArea[0]]}
                    color="#f59e0b"
                    weight={2}
                    opacity={0.7}
                    dashArray="5, 5"
                  />
                )}

                {flightPath.length > 0 && (
                  <Polyline
                    positions={flightPath}
                    color="#3b82f6"
                    weight={3}
                    opacity={0.8}
                  />
                )}
              </div>
            )
          })}
        </MapContainer>
      </div>

      {drones.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No drones to display</p>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { formatDistanceToNow } from 'date-fns'
import { Battery, Clock, MapPin, Plane } from 'lucide-react'

interface Drone {
  id: string
  name: string
  model: string
  status: 'available' | 'in-mission' | 'charging' | 'maintenance' | 'returning'
  battery: number
  location: { lat: number; lng: number; alt: number }
  lastSeen: string
  site: string
  currentMission?: string
}

interface FleetOverviewProps {
  drones: Drone[]
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ drones }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-success-600 bg-success-100'
      case 'in-mission':
        return 'text-primary-600 bg-primary-100'
      case 'charging':
        return 'text-warning-600 bg-warning-100'
      case 'maintenance':
        return 'text-danger-600 bg-danger-100'
      case 'returning':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getBatteryColor = (battery: number) => {
    if (battery > 70) return 'text-success-600'
    if (battery > 30) return 'text-warning-600'
    return 'text-danger-600'
  }

  const getBatteryBgColor = (battery: number) => {
    if (battery > 70) return 'bg-success-500'
    if (battery > 30) return 'bg-warning-500'
    return 'bg-danger-500'
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Fleet Overview</h2>
          <p className="text-sm text-gray-600">Real-time drone status and locations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Plane className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">{drones.length} Drones</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {drones.map((drone) => (
          <div
            key={drone.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  <Plane className="w-6 h-6 text-gray-600" />
                </div>
                <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${getStatusColor(drone.status)}`}>
                  <div className="w-2 h-2 bg-current rounded-full"></div>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{drone.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(drone.status)}`}>
                    {drone.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{drone.model}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{drone.site}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(drone.lastSeen), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Battery Indicator */}
              <div className="flex items-center space-x-2">
                <Battery className={`w-4 h-4 ${getBatteryColor(drone.battery)}`} />
                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getBatteryBgColor(drone.battery)}`}
                    style={{ width: `${drone.battery}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${getBatteryColor(drone.battery)}`}>
                  {Math.floor(drone.battery)}%
                </span>
              </div>

              {/* Altitude */}
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {drone.location.alt}m
                </div>
                <div className="text-xs text-gray-500">Altitude</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drones.length === 0 && (
        <div className="text-center py-8">
          <Plane className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No drones available</p>
        </div>
      )}
    </div>
  )
}
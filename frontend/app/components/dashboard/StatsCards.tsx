'use client'

import { AlertTriangle, BarChart3, Battery, Map, Plane, TrendingUp } from 'lucide-react'

interface Drone {
  status: 'available' | 'in-mission' | 'charging' | 'maintenance' | 'returning'
  battery: number
}

interface Mission {
  status: 'draft' | 'scheduled' | 'in-progress' | 'paused' | 'completed' | 'aborted'
}

interface Survey {
  status: string
  distance: number
  area: number
}

interface StatsCardsProps {
  drones: Drone[]
  missions: Mission[]
  surveys: Survey[]
}

export const StatsCards: React.FC<StatsCardsProps> = ({ drones, missions, surveys }) => {
  const activeDrones = drones.filter(d => ['available', 'in-mission'].includes(d.status)).length
  const avgBattery = drones.length > 0
    ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
    : 0
  const activeMissions = missions.filter(m => m.status === 'in-progress').length
  const completedMissions = missions.filter(m => m.status === 'completed').length
  const totalDistance = surveys.reduce((sum, s) => sum + s.distance, 0)
  const totalArea = surveys.reduce((sum, s) => sum + s.area, 0)
  const lowBatteryDrones = drones.filter(d => d.battery < 30).length

  const stats = [
    {
      title: 'Active Drones',
      value: activeDrones,
      total: drones.length,
      icon: Plane,
      color: 'primary',
      trend: '+5.2%',
      subtitle: `${drones.length} total fleet`
    },
    {
      title: 'Fleet Battery',
      value: `${avgBattery}%`,
      icon: Battery,
      color: avgBattery > 70 ? 'success' : avgBattery > 30 ? 'warning' : 'danger',
      trend: lowBatteryDrones > 0 ? `${lowBatteryDrones} low` : 'Good',
      subtitle: 'Average battery level'
    },
    {
      title: 'Active Missions',
      value: activeMissions,
      total: missions.length,
      icon: Map,
      color: 'primary',
      trend: `${completedMissions} completed`,
      subtitle: `${missions.length} total missions`
    },
    {
      title: 'Surveys Completed',
      value: surveys.length,
      icon: BarChart3,
      color: 'success',
      trend: '+12.5%',
      subtitle: 'This month'
    },
    {
      title: 'Distance Covered',
      value: `${(totalDistance / 1000).toFixed(1)}km`,
      icon: TrendingUp,
      color: 'primary',
      trend: '+8.3%',
      subtitle: 'Total surveyed'
    },
    {
      title: 'Area Mapped',
      value: `${(totalArea / 10000).toFixed(1)}ha`,
      icon: AlertTriangle,
      color: 'success',
      trend: '+15.7%',
      subtitle: 'Hectares covered'
    }
  ]

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'primary':
        return 'bg-primary-500 text-white'
      case 'success':
        return 'bg-success-500 text-white'
      case 'warning':
        return 'bg-warning-500 text-white'
      case 'danger':
        return 'bg-danger-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const getTrendColor = (trend: string) => {
    if (trend.includes('+')) return 'text-success-600'
    if (trend.includes('-')) return 'text-danger-600'
    if (trend.includes('low')) return 'text-danger-600'
    return 'text-gray-600'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <span className={`text-sm font-medium ${getTrendColor(stat.trend)}`}>
              {stat.trend}
            </span>
          </div>

          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {stat.value}
              </span>
              {stat.total && (
                <span className="text-sm text-gray-500">
                  / {stat.total}
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 mt-1">
              {stat.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {stat.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
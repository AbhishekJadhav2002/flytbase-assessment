'use client'

import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, Clock, Map, Pause, Play, Square } from 'lucide-react'
import { useSocket } from '../providers/SocketProvider'

interface Mission {
  id: string
  name: string
  type: string
  status: 'draft' | 'scheduled' | 'in-progress' | 'paused' | 'completed' | 'aborted'
  priority: 'low' | 'medium' | 'high' | 'critical'
  droneId?: string
  site: string
  progress: number
  createdAt: string
  schedule: {
    startTime: string
    estimatedDuration: number
    actualDuration?: number
  }
}

interface ActiveMissionsProps {
  missions: Mission[]
}

export const ActiveMissions: React.FC<ActiveMissionsProps> = ({ missions }) => {
  const { socket } = useSocket()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600 bg-red-100'
      case 'high':
        return 'text-orange-600 bg-orange-100'
      case 'medium':
        return 'text-yellow-600 bg-yellow-100'
      case 'low':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'inspection':
        return '🔍'
      case 'security':
        return '🛡️'
      case 'mapping':
        return '🗺️'
      case 'monitoring':
        return '📊'
      default:
        return '📋'
    }
  }

  const handleMissionControl = (action: string, missionId: string) => {
    if (socket) {
      socket.emit(`mission:${action}`, missionId)
    }
  }

  const getEstimatedTimeRemaining = (mission: Mission) => {
    if (mission.progress === 0) return mission.schedule.estimatedDuration

    const elapsed = (mission.progress / 100) * mission.schedule.estimatedDuration
    return Math.max(0, mission.schedule.estimatedDuration - elapsed)
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Active Missions</h2>
          <p className="text-sm text-gray-600">Currently running drone operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <Map className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">{missions.length} Active</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">{getTypeIcon(mission.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900">{mission.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(mission.priority)}`}>
                      {mission.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{mission.site}</p>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {Math.round(getEstimatedTimeRemaining(mission))}min remaining
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>
                        Started {formatDistanceToNow(new Date(mission.schedule.startTime), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {mission.status === 'in-progress' && (
                  <>
                    <button
                      onClick={() => handleMissionControl('pause', mission.id)}
                      className="p-2 text-warning-600 hover:bg-warning-100 rounded-lg transition-colors duration-200"
                      title="Pause Mission"
                    >
                      <Pause className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMissionControl('abort', mission.id)}
                      className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors duration-200"
                      title="Abort Mission"
                    >
                      <Square className="w-4 h-4" />
                    </button>
                  </>
                )}
                {mission.status === 'paused' && (
                  <button
                    onClick={() => handleMissionControl('resume', mission.id)}
                    className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors duration-200"
                    title="Resume Mission"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-900">{Math.round(mission.progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-500 transition-all duration-500 ease-out"
                  style={{ width: `${mission.progress}%` }}
                />
              </div>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  mission.status === 'in-progress' ? 'bg-success-500 animate-pulse' :
                  mission.status === 'paused' ? 'bg-warning-500' : 'bg-gray-500'
                }`} />
                <span className="text-sm text-gray-600 capitalize">
                  {mission.status.replace('-', ' ')}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                ID: {mission.id.slice(0, 8)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {missions.length === 0 && (
        <div className="text-center py-8">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active missions</p>
          <p className="text-sm text-gray-400">Missions will appear here when started</p>
        </div>
      )}
    </div>
  )
}
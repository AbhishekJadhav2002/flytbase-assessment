'use client'

import { formatDistanceToNow } from 'date-fns'
import { AlertCircle, BarChart3, CheckCircle, Clock, MapPin } from 'lucide-react'

interface Survey {
  id: string
  missionId: string
  missionName: string
  site: string
  type: string
  completedAt: string
  duration: number
  distance: number
  area: number
  dataPoints: number
  status: string
}

interface RecentSurveysProps {
  surveys: Survey[]
}

export const RecentSurveys: React.FC<RecentSurveysProps> = ({ surveys }) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-success-600'
      case 'warning':
        return 'text-warning-600'
      case 'error':
        return 'text-danger-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`
    }
    return `${distance}m`
  }

  const formatArea = (area: number) => {
    if (area >= 10000) {
      return `${(area / 10000).toFixed(1)}ha`
    }
    return `${area}m²`
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Recent Surveys</h2>
          <p className="text-sm text-gray-600">Latest completed survey operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">{surveys.length} Recent</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-hide">
        {surveys?.map((survey) => (
          <div
            key={survey.id}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start space-x-3">
                <div className="text-xl">{getTypeIcon(survey.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {survey.missionName}
                    </h3>
                    {survey.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-success-500" />
                    ) : (
                      <AlertCircle className={`w-4 h-4 ${getStatusColor(survey.status)}`} />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 mb-1">
                    <MapPin className="w-3 h-3" />
                    <span>{survey.site}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(new Date(survey.completedAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Survey Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{survey.duration}min</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Distance</span>
                  <span className="font-medium text-gray-900">
                    {formatDistance(survey.distance)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Area</span>
                  <span className="font-medium text-gray-900">
                    {formatArea(survey.area)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Data Points</span>
                  <span className="font-medium text-gray-900">{survey.dataPoints}</span>
                </div>
              </div>
            </div>

            {/* Survey ID */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Survey ID: {survey.id.slice(0, 8)}</span>
                <span className="capitalize">{survey.type} Survey</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {surveys.length === 0 && (
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No recent surveys</p>
          <p className="text-sm text-gray-400">Completed surveys will appear here</p>
        </div>
      )}

      {surveys.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              View All Surveys →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
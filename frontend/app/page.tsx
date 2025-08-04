'use client'

import { useEffect, useState } from 'react'
import { ActiveMissions } from './components/dashboard/ActiveMissions'
import { DroneMap } from './components/dashboard/DroneMap'
import { FleetOverview } from './components/dashboard/FleetOverview'
import { RecentSurveys } from './components/dashboard/RecentSurveys'
import { StatsCards } from './components/dashboard/StatsCards'
import { useSocket } from './components/providers/SocketProvider'

interface Drone {
  id: string
  name: string
  model: string
  status: 'available' | 'in-mission' | 'charging' | 'maintenance' | 'returning'
  battery: number
  location: { lat: number; lng: number; alt: number }
  lastSeen: string
  capabilities: string[]
  maxFlightTime: number
  maxRange: number
  site: string
  currentMission?: string
}

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

export default function Dashboard() {
  const { socket, isConnected } = useSocket()
  const [drones, setDrones] = useState<Drone[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isConnected && socket) {
      socket.on('drones:list', (droneList: Drone[]) => {
        setDrones(droneList)
      })

      socket.on('missions:list', (missionList: Mission[]) => {
        setMissions(missionList)
      })

      socket.on('drone:updated', (updatedDrone: Drone) => {
        setDrones(prev => prev.map(drone =>
          drone.id === updatedDrone.id ? updatedDrone : drone
        ))
      })

      socket.on('mission:updated', (updatedMission: Mission) => {
        setMissions(prev => prev.map(mission =>
          mission.id === updatedMission.id ? updatedMission : mission
        ))
      })

      socket.on('mission:progress', ({ missionId, progress }: { missionId: string; progress: number }) => {
        setMissions(prev => prev.map(mission =>
          mission.id === missionId ? { ...mission, progress } : mission
        ))
      })

      socket.on('survey:completed', (survey: Survey) => {
        setSurveys(prev => [survey, ...prev])
      })

      const fetchData = async () => {
        try {
          const [dronesRes, missionsRes, surveysRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/drones`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/missions`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/surveys`)
          ])

          const [dronesData, missionsData, surveysData] = await Promise.all([
            dronesRes.json(),
            missionsRes.json(),
            surveysRes.json()
          ])

          if (dronesData.success) setDrones(dronesData.data)
          if (missionsData.success) setMissions(missionsData.data)
          if (surveysData.success) setSurveys(surveysData.data)
        } catch (error) {
          console.error('Error fetching dashboard data:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchData()

      return () => {
        socket.off('drones:list')
        socket.off('missions:list')
        socket.off('drone:updated')
        socket.off('mission:updated')
        socket.off('mission:progress')
        socket.off('survey:completed')
      }
    }
  }, [isConnected, socket])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const activeMissions = missions.filter(m => m.status === 'in-progress')
  const recentSurveys = surveys.slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your drone fleet and mission operations</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Last updated</div>
          <div className="text-sm font-medium text-gray-900">
            {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      <StatsCards drones={drones} missions={missions} surveys={surveys} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FleetOverview drones={drones} />

        <ActiveMissions missions={activeMissions} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <DroneMap drones={drones} missions={activeMissions} />
        </div>

        <RecentSurveys surveys={recentSurveys} />
      </div>
    </div>
  )
}
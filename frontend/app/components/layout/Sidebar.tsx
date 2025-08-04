'use client'

import {
  Activity,
  Home,
  Plane,
  Shield,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSocket } from '../providers/SocketProvider'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
]

export const Sidebar = () => {
  const pathname = usePathname()
  const { isConnected } = useSocket()

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-white border-r border-gray-200">
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
              <Plane className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">Fyltbase Assessment</h1>
              <p className="text-xs text-gray-500">Survey Management</p>
            </div>
          </div>
        </div>

        <div className="px-4 mt-4">
          <div className={`flex items-center px-3 py-2 rounded-lg ${
            isConnected ? 'bg-success-50' : 'bg-danger-50'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-success-500' : 'bg-danger-500'
            }`} />
            <span className={`text-xs font-medium ${
              isConnected ? 'text-success-700' : 'text-danger-700'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            {isConnected && <Activity className="w-3 h-3 ml-auto animate-pulse text-success-500" />}
          </div>
        </div>

        <nav className="mt-8 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border-primary-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
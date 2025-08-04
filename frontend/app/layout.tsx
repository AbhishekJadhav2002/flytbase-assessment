import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { SocketProvider } from './components/providers/SocketProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'],
  display: 'swap' })

export const metadata: Metadata = {
  title: 'Drone Survey Management System',
  description: 'Professional drone fleet management and mission control platform',
  keywords: 'drone, survey, management, fleet, missions, inspection',
  authors: [{ name: 'FlytBase' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <SocketProvider>
          <div className="flex h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-auto p-6">
                {children}
              </main>
            </div>
          </div>
        </SocketProvider>
      </body>
    </html>
  )
}
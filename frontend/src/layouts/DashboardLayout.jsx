import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}

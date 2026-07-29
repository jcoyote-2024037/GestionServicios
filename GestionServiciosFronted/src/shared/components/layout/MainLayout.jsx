import { useRef, useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { BottomNav } from './BottomNav'
import { SocketListener } from '../chat/SocketListener'

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()
  const outletRef = useRef(null)

  useEffect(() => {
    if (outletRef.current) {
      outletRef.current.classList.remove('animate-fade-in')
      void outletRef.current.offsetWidth
      outletRef.current.classList.add('animate-fade-in')
    }
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-app overflow-x-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
      />
      <SocketListener />
      <div className={`min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="p-4 md:p-6 pb-24 md:pb-6">
          <div className="max-w-7xl mx-auto">
            <div ref={outletRef} className="animate-fade-in">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}

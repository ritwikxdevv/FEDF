import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface">
      {/* Ambient glow orb */}
      <div
        className="ambient-orb w-[500px] h-[500px] bg-primary"
        style={{ top: '20%', right: '10%' }}
      />

      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

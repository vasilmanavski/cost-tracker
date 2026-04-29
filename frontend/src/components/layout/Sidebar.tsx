import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import {
  HomeIcon,
  CurrencyDollarIcon,
  PlusCircleIcon,
  CameraIcon,
  ArrowRightStartOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

const navItems = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/expenses', label: 'Expenses', icon: CurrencyDollarIcon },
  { to: '/expenses/new', label: 'Add Expense', icon: PlusCircleIcon },
  { to: '/expenses/upload', label: 'Scan Receipt', icon: CameraIcon },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Cost Tracker</h1>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          aria-label="Close menu"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-gray-200">
        <div className="px-3 py-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user?.displayName || user?.email}
          </p>
          {user?.displayName && (
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          )}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-semibold text-gray-900">Cost Tracker</h1>
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900"
          aria-label="Open menu"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>
    </>
  )
}

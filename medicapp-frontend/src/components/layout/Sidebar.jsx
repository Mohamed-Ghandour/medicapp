import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  Activity,
  FileText,
  UserPlus,
  BarChart2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Sidebar = () => {
  const { user } = useAuth();

  const commonLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/statistics', label: 'Statistics', icon: BarChart2 },
  ];

  const patientLinks = [
    { to: '/doctors', label: 'Doctors', icon: Users },
    { to: '/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/dossier', label: 'Medical Record', icon: FileText },
  ];

  const doctorLinks = [
    { to: '/doctor/overview', label: 'My Overview', icon: Users },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/availability', label: 'Availability', icon: Clock },
  ];

  const adminLinks = [
    { to: '/admin/users', label: 'Manage Users', icon: Users },
    { to: '/admin/create-doctor', label: 'Create Doctor', icon: UserPlus },
  ];

  const links = [
    ...commonLinks,
    ...(user?.role === 'PATIENT' ? patientLinks : []),
    ...(user?.role === 'MEDECIN' ? doctorLinks : []),
    ...(user?.role === 'ADMIN' ? adminLinks : []),
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <Activity className="h-6 w-6 text-primary-600 mr-2" />
        <span className="text-xl font-bold text-slate-900">MedicAPP</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to + link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              twMerge(
                clsx(
                  'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )
              )
            }
          >
            <link.icon className="mr-3 flex-shrink-0 h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

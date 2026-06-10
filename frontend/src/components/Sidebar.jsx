import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, History, Settings, ShieldCheck, Map } from 'lucide-react';

const Sidebar = ({ user }) => {
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff';

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: isAdmin ? '/admin' : '/dashboard' },
        { icon: Map, label: 'Slot Map', path: '/map' },
        ...(isAdmin || isStaff ? [] : [{ icon: Calendar, label: 'My Bookings', path: '/bookings' }]),
        { icon: History, label: 'History', path: '/history' },
        ...(isAdmin ? [{ icon: ShieldCheck, label: 'Management', path: '/management' }] : []),
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside className="w-64 glass h-[calc(100vh-120px)] rounded-3xl p-6 hidden md:block">
            <div className="flex flex-col gap-4">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-2xl transition-all
                            ${isActive 
                                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/30' 
                                : 'text-gray-500 hover:bg-white/50 hover:text-brand-primary'}
                        `}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;

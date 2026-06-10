import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';
import { Users, Car, Wallet, Clock, TrendingUp } from 'lucide-react';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/v1/dashboard/stats');
                setStats(res.data.data);
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();

        // Socket integration for real-time updates
        const socket = io('http://localhost:5001');
        socket.on('slotUpdated', () => fetchStats());
        socket.on('bookingCreated', () => fetchStats());

        return () => socket.disconnect();
    }, [token]);

    if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

    const slotData = stats ? [
        { name: 'Free', value: stats.slots.free, color: '#10b981' },
        { name: 'Occupied', value: stats.slots.occupied, color: '#ef4444' },
        { name: 'Reserved', value: stats.slots.reserved, color: '#f59e0b' }
    ] : [];

    const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold">Admin Overview</h1>
                <p className="text-gray-500">Real-time parking ecosystem monitoring</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Revenue', value: `$${stats?.revenue}`, icon: Wallet, color: 'text-green-600', bg: 'bg-green-100' },
                    { label: 'Active Bookings', value: stats?.activeBookings, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-100' },
                    { label: 'Occupied Slots', value: stats?.slots.occupied, icon: Car, color: 'text-red-600', bg: 'bg-red-100' },
                    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' }
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-3xl flex items-center gap-4">
                        <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{stat.label}</p>
                            <h3 className="text-2xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-3xl min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6">Slot Availability Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={slotData}
                                cx="50%"
                                cy="50%"
                                innerRadius={80}
                                outerRadius={120}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {slotData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        {slotData.map((item, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-sm text-gray-500">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass p-8 rounded-3xl min-h-[400px]">
                    <h3 className="text-xl font-bold mb-6">Revenue Trend (Weekly)</h3>
                    <p className="text-gray-400 text-center py-20 italic">Data visualization coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/v1/bookings');
                setBookings(res.data.data.filter(b => b.status === 'active'));
            } catch (err) {
                console.error('Error fetching bookings:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, []);

    return (
        <div className="flex flex-col gap-8">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Hello, {user?.username}!</h1>
                    <p className="text-gray-500">Ready to park your vehicle today?</p>
                </div>
                <Link 
                    to="/map" 
                    className="bg-brand-primary text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:shadow-lg hover:shadow-brand-primary/30 transition-all"
                >
                    <Calendar className="w-5 h-5" />
                    Book New Slot
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Bookings */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Clock className="text-brand-primary" /> Active Bookings
                    </h2>
                    
                    {loading ? (
                        <div className="glass p-12 text-center text-gray-500 rounded-3xl">Loading bookings...</div>
                    ) : bookings.length > 0 ? (
                        bookings.map((booking) => (
                            <motion.div 
                                key={booking._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass p-6 rounded-3xl flex justify-between items-center"
                            >
                                <div className="flex gap-6 items-center">
                                    <div className="bg-brand-primary/10 p-4 rounded-2xl text-brand-primary">
                                        <MapPin className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Slot {booking.slot.slotNumber}</h3>
                                        <p className="text-gray-500">{booking.slot.zone} • {booking.slot.floor} Floor</p>
                                        <div className="flex gap-4 mt-2 text-sm">
                                            <span className="flex items-center gap-1 text-green-600">
                                                <CheckCircle2 className="w-4 h-4" /> Paid
                                            </span>
                                            <span className="text-gray-400">Ends at: {new Date(booking.endTime).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-3 hover:bg-white/50 rounded-2xl transition-colors">
                                    <ArrowRight className="text-gray-400" />
                                </button>
                            </motion.div>
                        ))
                    ) : (
                        <div className="glass p-12 text-center rounded-3xl">
                            <p className="text-gray-400 mb-4">No active bookings found.</p>
                            <Link to="/map" className="text-brand-primary font-semibold">Book your first slot →</Link>
                        </div>
                    )}
                </div>

                {/* Quick Info / Tips */}
                <div className="flex flex-col gap-6">
                    <h2 className="text-xl font-bold">Quick Actions</h2>
                    <div className="glass p-6 rounded-3xl flex flex-col gap-4">
                        <button className="w-full text-left p-4 hover:bg-white/50 rounded-2xl transition-colors flex items-center gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                <History className="w-5 h-5" />
                            </div>
                            <span>View History</span>
                        </button>
                        <button className="w-full text-left p-4 hover:bg-white/50 rounded-2xl transition-colors flex items-center gap-3">
                            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                                <Star className="w-5 h-5" />
                            </div>
                            <span>Favorite Spots</span>
                        </button>
                    </div>

                    <div className="bg-mesh p-8 rounded-3xl text-white">
                        <h3 className="text-xl font-bold mb-2">Pro Tip</h3>
                        <p className="text-sm opacity-80">
                            Book in advance during peak hours to get the best spots near the entrance!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;

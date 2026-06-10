import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, ShieldInfo } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SlotMap = () => {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [bookingSuccess, setBookingSuccess] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await axios.get('http://localhost:5001/api/v1/slots');
                setSlots(res.data.data);
            } catch (err) {
                console.error('Error fetching slots:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSlots();

        const socket = io('http://localhost:5001');
        socket.on('slotUpdated', (updatedSlot) => {
            setSlots(prev => prev.map(s => s._id === updatedSlot._id ? { ...s, status: updatedSlot.status } : s));
        });

        return () => socket.disconnect();
    }, []);

    const handleBook = async () => {
        if (!selectedSlot) return;
        try {
            // Simulated booking for 1 hour
            const startTime = new Date();
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

            await axios.post('http://localhost:5001/api/v1/bookings', {
                slot: selectedSlot._id,
                startTime,
                endTime,
                totalAmount: selectedSlot.pricePerHour,
                vehicleNumber: 'KA-01-MJ-1234' // Placeholder
            });

            // Simulate payment
            await axios.post('http://localhost:5001/api/v1/payments', {
                bookingId: 'placeholder', // Ideally returned from booking
                amount: selectedSlot.pricePerHour,
                paymentMethod: 'card'
            });

            const passDetails = {
                slot: selectedSlot.slotNumber,
                floor: selectedSlot.floor,
                zone: selectedSlot.zone,
                expiry: endTime.toLocaleTimeString(),
                code: 'PK-' + Math.random().toString(36).substr(2, 6).toUpperCase()
            };

            setSelectedSlot(null);
            setBookingSuccess(passDetails);
        } catch (err) {
            alert(err.response?.data?.error || 'Booking failed');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Map...</div>;

    const floors = [...new Set(slots.map(s => s.floor))];

    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl font-bold">Interactive Slot Map</h1>
                <p className="text-gray-500">Select an available slot to reserve your space</p>
                
                <div className="flex gap-6 mt-6">
                    <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-green-500"></div> Available</div>
                    <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-red-500"></div> Occupied</div>
                    <div className="flex items-center gap-2 text-sm"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Reserved</div>
                </div>
            </header>

            {floors.map(floor => (
                <div key={floor} className="flex flex-col gap-4">
                    <h2 className="text-xl font-bold">Floor {floor}</h2>
                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {slots.filter(s => s.floor === floor).map(slot => (
                            <motion.button
                                key={slot._id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => slot.status === 'available' && setSelectedSlot(slot)}
                                className={`
                                    h-24 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all
                                    ${slot.status === 'available' ? 'bg-green-50 border-green-200 hover:border-green-500 text-green-700' : 
                                      slot.status === 'occupied' ? 'bg-red-50 border-red-200 text-red-700 cursor-not-allowed' : 
                                      'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed'}
                                `}
                            >
                                <span className="text-xs font-bold opacity-60 uppercase">{slot.type}</span>
                                <span className="text-lg font-bold">{slot.slotNumber}</span>
                                <span className="text-[10px] opacity-60">${slot.pricePerHour}/hr</span>
                            </motion.button>
                        ))}
                    </div>
                </div>
            ))}

            {/* Booking Modal */}
            <AnimatePresence>
                {selectedSlot && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedSlot(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
                        >
                            <motion.div 
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                onClick={e => e.stopPropagation()}
                                className="glass bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl"
                            >
                                <h2 className="text-3xl font-bold mb-2">Book Slot {selectedSlot.slotNumber}</h2>
                                <p className="text-gray-500 mb-8">Confirm your reservation details below</p>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-gray-500">Zone</span>
                                        <span className="font-bold">{selectedSlot.zone}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl">
                                        <span className="text-gray-500">Floor</span>
                                        <span className="font-bold">{selectedSlot.floor}</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-slate-50 rounded-2xl text-brand-primary font-bold">
                                        <span>Price (1 hour)</span>
                                        <span>${selectedSlot.pricePerHour}</span>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setSelectedSlot(null)}
                                        className="flex-1 glass py-4 rounded-2xl font-bold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleBook}
                                        className="flex-1 bg-brand-primary text-white py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-brand-primary/30 transition-all"
                                    >
                                        Pay & Book
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Success Pass Modal */}
            <AnimatePresence>
                {bookingSuccess && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, rotateX: 20 }}
                            animate={{ scale: 1, rotateX: 0 }}
                            className="w-full max-w-sm"
                        >
                            <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                                <div className="bg-brand-primary p-8 text-white text-center pb-20">
                                    <div className="bg-white/20 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                                    <p className="opacity-80">Your parking pass is ready</p>
                                </div>
                                
                                <div className="p-8 -mt-12 bg-white rounded-t-[2.5rem] relative">
                                    <div className="flex justify-between mb-8">
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Slot</p>
                                            <p className="text-2xl font-bold text-gray-800">{bookingSuccess.slot}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Zone</p>
                                            <p className="text-2xl font-bold text-gray-800">{bookingSuccess.zone}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Floor</span>
                                            <span className="font-bold">{bookingSuccess.floor}</span>
                                        </div>
                                        <div className="flex justify-between border-b pb-2">
                                            <span className="text-gray-500">Valid Until</span>
                                            <span className="font-bold">{bookingSuccess.expiry}</span>
                                        </div>
                                    </div>

                                    {/* Simulated QR Code */}
                                    <div className="bg-slate-100 p-6 rounded-3xl aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300">
                                        <div className="grid grid-cols-4 gap-2 opacity-20">
                                            {[...Array(16)].map((_, i) => (
                                                <div key={i} className="w-8 h-8 bg-black rounded-sm"></div>
                                            ))}
                                        </div>
                                        <p className="mt-4 font-mono font-bold text-slate-400">{bookingSuccess.code}</p>
                                    </div>

                                    <button 
                                        onClick={() => setBookingSuccess(null)}
                                        className="w-full bg-brand-primary text-white py-4 rounded-2xl font-bold mt-8 hover:shadow-lg transition-all"
                                    >
                                        Close Pass
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SlotMap;

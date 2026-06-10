import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Zap, Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <div className="flex flex-col items-center">
            {/* Hero Section */}
            <section className="text-center py-20 px-6 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-6xl font-extrabold mb-6 leading-tight">
                        Smart Parking for a <span className="text-brand-primary">Smarter City</span>
                    </h1>
                    <p className="text-xl text-gray-500 mb-10 leading-relaxed">
                        Effortlessly find and book parking slots in real-time. Secure, fast, and 
                        premium parking experience tailored for you.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/register" className="bg-brand-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-brand-primary/40 transition-all transform hover:-translate-y-1">
                            Book Your Slot Now
                        </Link>
                        <Link to="/about" className="glass px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/40 transition-all">
                            Learn More
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-20 w-full max-w-6xl">
                {[
                    { icon: Shield, title: 'Safe & Secure', desc: '24/7 surveillance and secure booking system.' },
                    { icon: Zap, title: 'Real-time Updates', desc: 'Live availability status for all parking zones.' },
                    { icon: Clock, title: 'Hourly Booking', desc: 'Flexible duration options to suit your needs.' },
                    { icon: Star, title: 'VIP Services', desc: 'Premium slots with extra space and priority.' }
                ].map((feature, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className="glass p-8 rounded-3xl text-center flex flex-col items-center"
                    >
                        <div className="bg-brand-primary/10 p-4 rounded-2xl mb-4">
                            <feature.icon className="text-brand-primary w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                        <p className="text-gray-500">{feature.desc}</p>
                    </motion.div>
                ))}
            </section>

            {/* Visual Teaser */}
            <section className="w-full max-w-6xl px-6 py-20">
                <div className="relative h-[400px] rounded-[3rem] overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-mesh"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-white text-center p-12 glass shadow-none">
                        <div>
                            <h2 className="text-4xl font-bold mb-4 text-white">Advanced Dashboard</h2>
                            <p className="text-lg opacity-80 mb-8 max-w-2xl mx-auto">
                                Monitor your bookings, track your expense, and find your car in seconds 
                                with our interactive map integration.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

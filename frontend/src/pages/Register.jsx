import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, Loader2 } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'user'
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] py-10">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass p-10 rounded-3xl w-full max-w-lg"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                    <p className="text-gray-500">Join ParkSmart today</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl mb-6 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            name="username"
                            type="text" 
                            placeholder="Full Name"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-white/50 px-12 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            name="email"
                            type="email" 
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-white/50 px-12 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            name="phoneNumber"
                            type="text" 
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-white/50 px-12 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input 
                            name="password"
                            type="password" 
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-white/50 px-12 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm text-gray-400 ml-2">Register as:</label>
                        <select 
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full bg-white/50 border border-white/50 px-6 py-4 rounded-2xl focus:ring-2 focus:ring-brand-primary outline-none transition-all"
                        >
                            <option value="user">User (Vehicle Owner)</option>
                            <option value="staff">Parking Staff</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <button 
                        type="submit"
                        disabled={submitting}
                        className="bg-brand-primary text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-brand-primary/30 transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {submitting ? <Loader2 className="animate-spin" /> : 'Get Started'}
                    </button>
                </form>

                <div className="text-center mt-8 text-gray-500">
                    Already have an account? <Link to="/login" className="text-brand-primary font-semibold">Login</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;

import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Car } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center mb-8">
            <Link to="/" className="flex items-center gap-2">
                <div className="bg-brand-primary p-2 rounded-lg">
                    <Car className="text-white w-6 h-6" />
                </div>
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-primary to-brand-secondary">
                    ParkSmart
                </span>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-600 hover:text-brand-primary transition-colors flex items-center gap-1">
                            <User className="w-5 h-5" />
                            {user.username}
                        </Link>
                        <button 
                            onClick={logout}
                            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-4 py-2 rounded-full transition-all flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="text-gray-600 hover:text-brand-primary transition-colors">Login</Link>
                        <Link to="/register" className="bg-brand-primary text-white px-6 py-2 rounded-full hover:shadow-lg hover:shadow-brand-primary/30 transition-all">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

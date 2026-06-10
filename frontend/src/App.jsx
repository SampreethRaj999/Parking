import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SlotMap from './pages/SlotMap';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="p-20 text-center text-gray-400">Loading Session...</div>;
    if (!user) return <Navigate to="/login" />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
    
    return children;
};

const Layout = ({ children }) => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <div className="container mx-auto px-6 flex flex-col md:flex-row gap-8 flex-1">
                {user && <Sidebar user={user} />}
                <main className="flex-1 pb-20">
                    {children}
                </main>
            </div>
            <footer className="py-10 text-center text-gray-400 text-sm">
                &copy; 2026 ParkSmart Management System. All rights reserved.
            </footer>
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        <Route path="/dashboard" element={
                            <ProtectedRoute roles={['user', 'staff', 'admin']}>
                                <UserDashboard />
                            </ProtectedRoute>
                        } />
                        
                        <Route path="/admin" element={
                            <ProtectedRoute roles={['admin', 'staff']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/map" element={
                            <ProtectedRoute>
                                <SlotMap />
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </Layout>
            </Router>
        </AuthProvider>
    );
}

export default App;

# ParkSmart Management System (MERN Stack)

ParkSmart is a premium, full-stack parking management system designed with a modern glassmorphism UI. It features real-time slot tracking, secure role-based access control, and a data-driven dashboard.

## 🚀 Features
- **Authentication**: JWT-based login/signup with role-based access (Admin, Staff, User).
- **Slot Management**: Create, update, and track parking slots (Car, Bike, EV, VIP).
- **Real-time Map**: Interactive map with live availability updates using Socket.IO.
- **Booking System**: Reserve slots by the hour with automated conflict detection.
- **Admin Analytics**: Interactive charts for revenue monitoring and occupancy stats.
- **Payment Simulation**: Seamless payment flow simulation for bookings.

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS (v4), Framer Motion, Recharts.
- **Backend**: Node.js, Express.js, Socket.IO.
- **Database**: MongoDB (Mongoose).

## 📦 Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
node seed.js # To populate initial slots
npm start
```
*Note: Ensure your `.env` file is configured with the correct `MONGODB_URI` and `JWT_SECRET`.*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📡 API Documentation (v1)

### Auth
- `POST /api/v1/auth/register` - Create new account
- `POST /api/v1/auth/login` - Authenticate user
- `GET /api/v1/auth/me` - Get current user profile

### Parking Slots
- `GET /api/v1/slots` - Get all slots
- `POST /api/v1/slots` - Create slot (Admin/Staff)
- `PUT /api/v1/slots/:id` - Update slot

### Bookings
- `POST /api/v1/bookings` - Create reservation
- `GET /api/v1/bookings` - Get user/system bookings
- `PUT /api/v1/bookings/:id/cancel` - Cancel reservation

## 🛡️ Security
- Password hashing with Bcrypt.
- Protected routes using JWT Middleware.
- Role-based authorization (RBAC).

## 📄 License
MIT
# Parking

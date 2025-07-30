# 🏢 Advanced Employee Attendance System

A modern, full-stack employee attendance management system built with React.js, Node.js, Express.js, and MongoDB.

## ✨ Features

### 🔐 Authentication & Authorization

- JWT-based secure authentication
- Role-based access control (Admin, Manager, Employee)
- Protected routes and API endpoints

### 👥 User Management

- Employee registration and profile management
- Department and position tracking
- Admin dashboard for user management

### ⏰ Attendance Tracking

- Real-time check-in/check-out with GPS location
- Automatic working hours calculation
- Attendance status tracking (Present, Absent, Late, Half-day)

### 📊 Analytics & Reports

- Monthly attendance statistics
- Working hours tracking
- Department-wise analytics
- Individual employee reports

### 🎨 Modern UI/UX

- Responsive design with Tailwind CSS
- Professional dashboard interface
- Real-time updates and notifications
- Mobile-friendly design

## 🛠️ Tech Stack

### Frontend

- **React.js** - UI Library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Lucide React** - Icons

### Backend

- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Installation Steps

#### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd employee-attendance-system
\`\`\`

#### 2. Backend Setup

\`\`\`bash

# Navigate to backend directory

cd backend

# Install dependencies

npm install

# Create .env file with your configuration

# (Already provided in your case)

# Start the backend server

npm run dev
\`\`\`

#### 3. Frontend Setup

\`\`\`bash

# Open new terminal and navigate to frontend directory

cd frontend

# Install dependencies

npm install

# Start the development server

npm run dev
\`\`\`

### 🔧 Environment Variables

Create a `.env` file in the backend directory:

\`\`\`env
MONGO_URI=mongodb+srv://abhishekjha2707:TempPass2025@cluster0.is4cvmz.mongodb.net/employee-attendance-system?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super$ecret@123!
FRONTEND_URL=http://localhost:5173
PORT=5000
\`\`\`

## 🎯 Usage Instructions

### First Time Setup

1. **Start Both Servers**

   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`

2. **Create Admin Account**

   - Go to `http://localhost:5173/register`
   - Register with role "admin"
   - Login with admin credentials

3. **Add Employees**
   - Use admin dashboard to add employees
   - Or employees can self-register

### Daily Usage

#### For Employees:

1. **Login** to your account
2. **Check In** when you arrive at work
3. **Check Out** when leaving
4. **View** your attendance history and statistics

#### For Admins:

1. **Monitor** all employee attendance
2. **Manage** user accounts
3. **View** comprehensive reports
4. **Track** department-wise statistics

## 📱 Features Walkthrough

### 🏠 Dashboard

- Real-time clock and date
- Quick check-in/check-out buttons
- Current status display
- Monthly statistics overview

### 👤 Profile Management

- Update personal information
- View employment details
- Change password

### 📋 Attendance Logs

- View detailed attendance history
- Filter by date range
- Export reports (coming soon)

### 🔧 Admin Panel

- User management
- System-wide statistics
- Department analytics
- Attendance monitoring

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Role-based Access** - Granular permissions
- **Input Validation** - Server-side validation
- **CORS Protection** - Cross-origin security

## 📊 Database Schema

### Users Collection

- Employee ID, Name, Email
- Department, Position, Role
- Contact information
- Employment details

### Attendance Collection

- User reference
- Check-in/Check-out times
- Working hours calculation
- Location tracking
- Status and notes

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)

\`\`\`bash

# Build for production

npm run build

# Deploy to your preferred platform

\`\`\`

### Frontend Deployment (Vercel/Netlify)

\`\`\`bash

# Build for production

npm run build

# Deploy dist folder

\`\`\`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Ensure MongoDB connection is working
3. Verify environment variables
4. Check if both servers are running

## 🔮 Future Enhancements

- [ ] Leave management system
- [ ] Email notifications
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Integration with payroll systems
- [ ] Biometric authentication
- [ ] Shift management
- [ ] Holiday calendar

---

**Happy Coding! 🎉**

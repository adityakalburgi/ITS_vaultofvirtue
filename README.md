# Vault of Virtue Challenge Platform

A horror-themed technical challenge platform featuring the Seven Deadly Sins as different challenge categories. Players navigate through various programming puzzles and cybersecurity challenges to escape the digital underworld.

Developed by **Aditya Kalburgi** for the IEEE ITS WITH WIE event at KLS Gogte Institute of Technology, where around 60 teams participated in this immersive technical challenge experience.

**Live Website:** [www.vaultofvirtue.netlify.app](https://www.vaultofvirtue.netlify.app)

## 🎮 Project Overview

Vault of Virtue is an interactive web application that presents technical challenges in a dark, atmospheric interface. Each challenge is themed around one of the Seven Deadly Sins, creating an immersive experience that combines learning with entertainment.

### Challenge Categories
- **Pride** - Binary and code reversal puzzles
- **Greed** - Bitwise operations and algorithmic challenges  
- **Lust** - Web development and color manipulation
- **Envy** - Logic puzzles and pattern recognition
- **Wrath** - Advanced programming challenges
- **Gluttony** - Data processing and optimization
- **Sloth** - Efficiency and performance challenges

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Fast development server and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **React Query** - Data fetching and state management

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Firebase Admin SDK** - Backend services and authentication
- **Firebase Firestore** - NoSQL database
- **Firebase Authentication** - User management
- **JSON Web Tokens (JWT)** - Secure authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd <YOUR_PROJECT_NAME>
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication
   - Generate a service account key and save it as `server/config/serviceAccountKey.json`

5. **Set up environment variables**
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   FIREBASE_DATABASE_URL=your_firebase_database_url
   ```

6. **Start the development servers**

   Backend server:
   ```bash
   cd server
   npm run dev
   ```

   Frontend development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:8080` with the backend API at `http://localhost:5000`.

## 📁 Project Structure

```
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── challenges/          # Challenge-specific components
│   │   └── ui/                  # Reusable UI components
│   ├── contexts/                # React context providers
│   ├── hooks/                   # Custom React hooks
│   ├── pages/                   # Application pages
│   └── lib/                     # Utility functions
├── server/                       # Backend source code
│   ├── config/                  # Configuration files
│   ├── controllers/             # Route controllers
│   ├── middleware/              # Express middleware
│   ├── routes/                  # API routes
│   └── utils/                   # Utility functions
└── public/                      # Static assets
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Challenges
- `GET /api/challenges` - Get all challenges
- `POST /api/challenges/submit` - Submit challenge solution
- `GET /api/challenges/user-progress` - Get user progress

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/promote` - Promote user to admin
- `GET /api/admin/logs` - Get security logs

## 🎨 Features

- **Dark Horror Theme** - Atmospheric UI with terminal-style design
- **Real-time Leaderboard** - Live scoring and rankings
- **Challenge Progress Tracking** - Track completed challenges per user
- **Admin Dashboard** - User management and system monitoring
- **Responsive Design** - Works on desktop and mobile devices
- **Security Logging** - Comprehensive audit trail
- **JWT Authentication** - Secure user sessions
- **Role-based Access** - Admin and user permissions

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Admin role verification
- Input validation and sanitization
- CORS configuration
- Security event logging

## 🚀 Deployment

### Frontend Deployment
The frontend is deployed on Netlify at [www.vaultofvirtue.netlify.app](https://www.vaultofvirtue.netlify.app)

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider

### Backend Deployment
The backend can be deployed to services like Heroku, Railway, or DigitalOcean:

1. Set up environment variables on your hosting platform
2. Ensure Firebase credentials are properly configured
3. Deploy the `server` directory

## 🏆 Event Details

This platform was successfully used for the IEEE ITS WITH WIE event at KLS Gogte Institute of Technology, where approximately 60 teams participated in the technical challenge competition. The event showcased students' programming and problem-solving skills through the immersive horror-themed interface.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Developer

**Aditya Kalburgi** - Full Stack Developer

- Platform Architecture and Development
- Backend API with Node.js, Express.js, and Firebase
- Frontend Development with React and TypeScript
- Challenge Design and Implementation
- Event Management and Deployment

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues in the repository
2. Create a new issue with a detailed description
3. Contact the developer for event-specific queries

## 🎯 Future Enhancements

- Additional challenge types and categories
- Team-based competitions
- Real-time multiplayer challenges
- Achievement system
- Challenge creation tools for admins
- Mobile app version

---

Built with ❤️ using React, Node.js, Express.js, and Firebase by **Aditya Kalburgi**

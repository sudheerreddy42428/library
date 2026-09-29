# Smart Library Management System 📚

A complete, production-ready Full-Stack Library Management System with automated book tracking, fine management, and reservation systems. Built for modern library administration and student experience.

## Features ✨
- **Role-based Access Control**: Distinct dashboards for Admin/Librarian and Students.
- **Book Management**: Complete CRUD operations for books with physical shelf tracking.
- **Issue & Return Workflow**: Automated quantity management upon checkout and returns.
- **Fine Management**: Automatic overdue fine calculations.
- **Reservation System**: Queue-based reservation when books are unavailable.
- **Analytics Dashboard**: Real-time stats and visual charts using Recharts.
- **Modern UI**: Built with React, Tailwind CSS, and Lucide Icons.

## Technology Stack 💻
- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router, Axios, Recharts
- **Backend**: Node.js, Express.js, TypeScript, JWT Auth, bcrypt
- **Database**: PostgreSQL, Prisma ORM

## Prerequisites 🛠️
- Node.js (v18 or higher)
- PostgreSQL (or use the provided Docker Compose file)

## Database Setup (Docker) 🐳
If you don't have PostgreSQL installed locally, you can use the provided `docker-compose.yml`:
```bash
cd library-management-system
docker-compose up -d
```
This will start a PostgreSQL database accessible at `localhost:5432`.

## Environment Variables 🔐
Ensure the following `.env` is present in `server/.env`:
```env
PORT=5000
DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/library_db?schema=public"
JWT_SECRET="supersecretjwtkey_change_in_production"
```

## Setup Instructions 🚀

### 1. Backend Setup
```bash
cd library-management-system/server
npm install

# Apply database migrations
npx prisma db push

# Seed the database with demo data (Admin, Students, Books)
npm run prisma seed

# Start the server (Development)
npm run dev
```

### 2. Frontend Setup
```bash
cd library-management-system/client
npm install

# Start the client (Development)
npm run dev
```

## Demo Credentials 🔑
The seeder creates these accounts automatically:

**Librarian / Admin:**
- Email: `admin@library.edu`
- Password: `admin123`

**Student:**
- Email: `student1@library.edu`
- Password: `student123`

## Architecture overview 🏗️
The project uses a standard REST API architecture:
- `client/` - React frontend powered by Vite
- `server/` - Express backend with controllers and Prisma client
- `server/prisma/` - Database schema and seed logic

## Future Enhancements 🔮
- Email/SMS notifications for overdue books.
- Digital Library resource upload.
- QR/Barcode scanning integration in the UI.
- Advanced AI Recommendation algorithm.

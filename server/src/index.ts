import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import studentRoutes from './routes/student.routes';
import issueRoutes from './routes/issue.routes';
import fineRoutes from './routes/fine.routes';
import reservationRoutes from './routes/reservation.routes';
import statRoutes from './routes/stat.routes';
import authorRoutes from './routes/author.routes';
import categoryRoutes from './routes/category.routes';
import seatRoutes from './routes/seat.routes';
import purchaseRequestRoutes from './routes/purchaseRequest.routes';
import bookConditionRoutes from './routes/bookCondition.routes';
import settingRoutes from './routes/setting.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());



// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/book-conditions', bookConditionRoutes);
app.use('/api/settings', settingRoutes);

// Serve static frontend files
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL_ENV === undefined) {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

export default app;

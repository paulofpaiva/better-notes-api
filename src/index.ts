import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

import { authRoutes } from './routes/auth.js';
import { notesRoutes } from './routes/notes.js';

const app = express();
const port = parseInt(process.env.PORT || '3000');

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:8000'
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.get('/', (req, res) => {
  res.json({ message: 'Better Notes API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  const errorMessage = err.message || 'Something went wrong!';
  res.status(500).json({ error: errorMessage });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Better Notes API running on port ${port}`);
});

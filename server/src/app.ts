import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

import authRoutes from './routes/auth.routes';
import cooperativeRoutes from './routes/cooperative.routes';
import invoiceRoutes from './routes/invoice.routes';
import adminRoutes from './routes/admin.routes';
import db from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Initialize database
db.initTables().catch(console.error);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cooperatives', cooperativeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/admin', adminRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});

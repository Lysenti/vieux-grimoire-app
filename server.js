import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js'; 
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Servir les fichiers statiques du répertoire 'uploads'

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello, Vieux grimoire !');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

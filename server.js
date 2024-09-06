import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js'; 
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

//Activation de CORS
app.use(cors({
  origin: '*', // Accepter toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Accepter toutes les méthodes HTTP
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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

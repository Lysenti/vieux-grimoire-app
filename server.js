import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer'; // Importer multer pour la gestion des fichiers
import connectDB from './config/db.js'; 
import bookRoutes from './routes/bookRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware pour JSON
app.use(express.json());

// Activation de CORS
app.use(cors({
  origin: '*', // Accepter toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], // Accepter toutes les méthodes HTTP
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configuration de multer pour la gestion des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Répertoire où les fichiers seront sauvegardés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Nomme le fichier de manière unique
  }
});

// Filtrer les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Format de fichier non pris en charge'), false);
  }
};

// Créer l'instance multer
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

// Servir les fichiers statiques du répertoire 'uploads'
app.use('/uploads', express.static('uploads'));

// Passer le middleware upload à bookRoutes via les options de route
app.use('/api/books', bookRoutes(upload)); 
app.use('/api/auth', userRoutes);

// Route pour l'upload de fichiers
app.post('/api/upload', upload.single('image'), (req, res) => {
  console.log('Corps de la requête:', req.body);
  console.log('Fichier reçu:', req.file);

  if (!req.file) {
    return res.status(400).send('Aucun fichier reçu');
  }

  res.send('Fichier uploadé avec succès');
});

app.get('/', (req, res) => {
  res.send('Hello, Vieux grimoire !');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

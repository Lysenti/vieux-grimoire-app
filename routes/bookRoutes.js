import express from 'express';
import multer from 'multer';
import auth from '../middlewares/authMiddleware.js';
import {
  createBook,
  getAllBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  rateBook,
  getBestRatedBooks
} from '../controllers/bookController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Fonction pour générer l'URL complète de l'image
const saveImageUrl = (imagePath) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3000';  // URL du backend, avec fallback si non défini
  const imageUrl = `${backendUrl}/${imagePath}`;  // Génération de l'URL complète
  return imageUrl;
};

// Créer un livre avec upload d'image
export const createBook = async (req, res) => {
  try {
    // Si une image est envoyée, on génère l'URL complète de l'image
    let imageUrl;
    if (req.file) {
      imageUrl = saveImageUrl(`uploads/${req.file.filename}`);
    }

    // Créer un nouveau livre avec les données envoyées et l'URL de l'image (si présente)
    const book = new book({
      userId: req.body.userId,  
      title: req.body.title,
      author: req.body.author,
      imageUrl: imageUrl || '',  
      year: req.body.year, 
      genre: req.body.genre,  
      ratings: [],  
      averageRating: 0 ,  
     });

    // Sauvegarder le livre dans la base de données
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
};

router.post('/', auth, upload.single('image'), createBook);
router.get('/', getAllBooks); 
router.get('/bestrating', getBestRatedBooks);
router.get('/:id', getBookById);
router.put('/:id', auth, upload.single('image'), updateBookById);
router.delete('/:id', auth, deleteBookById);
router.post('/:id/rating', auth, rateBook);

export default router;


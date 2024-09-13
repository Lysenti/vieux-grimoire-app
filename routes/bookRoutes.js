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

// Fonction pour configurer les routes
const configureBookRoutes = (upload) => {
  // Middleware personnalisé pour gérer les requêtes avec ou sans fichier
  const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: 'Erreur de téléchargement de fichier.' });
      } else if (err) {
        return res.status(500).json({ message: 'Erreur serveur lors du téléchargement de fichier.' });
      }
      next();
    });
  };

  router.post('/', auth, uploadMiddleware, createBook);
  router.get('/', getAllBooks); 
  router.get('/bestrating', getBestRatedBooks);
  router.get('/:id', getBookById);
  router.put('/:id', auth, uploadMiddleware, updateBookById); // Utilisation du middleware personnalisé ici
  router.delete('/:id', auth, deleteBookById);
  router.post('/:id/rating', auth, rateBook);

  return router;
};

export default configureBookRoutes;


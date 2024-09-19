import express from 'express';
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
import uploadMiddleware from '../middlewares/MulterMiddleware.js';
import optimize from '../middlewares/sharpMiddleware.js';

const router = express.Router();

router.post('/', auth, uploadMiddleware, optimize, createBook);
router.get('/', getAllBooks);
router.get('/bestrating', getBestRatedBooks);
router.get('/:id', getBookById);
router.put('/:id', auth, uploadMiddleware, optimize, updateBookById);
router.delete('/:id', auth, deleteBookById);
router.post('/:id/rating', auth, rateBook);

export default router;



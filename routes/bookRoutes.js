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



router.post('/', auth, upload.single('image'), createBook);
router.get('/', getAllBooks); 
router.get('/bestrating', getBestRatedBooks);
router.get('/:id', getBookById);
router.put('/:id', auth, upload.single('image'), updateBookById);
router.delete('/:id', auth, deleteBookById);
router.post('/:id/rating', auth, rateBook);

export default router;


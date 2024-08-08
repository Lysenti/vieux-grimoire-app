const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middlewares/authMiddleware');
const bookController = require('../controllers/bookController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/', auth, upload.single('image'), bookController.createBook);
router.get('/', bookController.getAllBooks);
router.get('/bestrating', bookController.getBestRatedBooks);
router.get('/:id', bookController.getBookById);
router.put('/:id', auth, upload.single('image'), bookController.updateBookById);
router.delete('/:id', auth, bookController.deleteBookById);
router.post('/:id/rating', auth, bookController.rateBook);

module.exports = router;

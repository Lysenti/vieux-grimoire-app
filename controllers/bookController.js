import Book from '../models/book.js';

// Créer un livre
export const createBook = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);

    if (!req.body.book) {
      throw new Error('No book data provided');
    }

    const bookData = JSON.parse(req.body.book);

    if (!bookData.title || !bookData.author || !bookData.year || !bookData.genre) {
      throw new Error('Missing required book fields');
    }

    if (!req.file) {
      throw new Error('No image file provided');
    }

    const book = new Book({
      ...bookData,
      userId: req.user._id,
      imageUrl: `/uploads/${req.file.filename}` // Stocker le chemin relatif de l'image
    });

    console.log('Book data to save:', book);

    await book.save();
    res.status(201).send({ message: 'Book created successfully', book });
  } catch (err) {
    console.error('Error:', err.message);
    res.status(400).send({ error: err.message });
  }
};



// Obtenir tous les livres
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).send(books);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir un livre par ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.status(200).send(book);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Mettre à jour un livre par ID
export const updateBookById = async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    if (req.file) {
      bookData.imageUrl = `/uploads/${req.file.filename}`;
    }
    const book = await Book.findByIdAndUpdate(req.params.id, bookData, { new: true });
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.status(200).send(book);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Supprimer un livre par ID
export const deleteBookById = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }
    res.status(200).send({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Noter un livre
export const rateBook = async (req, res) => {
  try {
    const { grade } = req.body;
    
    if (!grade) {
      return res.status(400).send({ error: 'Grade is required' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }

    book.ratings.push({ userId: req.user._id, grade });

    book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).send(book);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Obtenir les livres les mieux notés
export const getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(5);
    res.status(200).send(books);
  } catch (err) {
    res.status(500).send(err);
  }
};

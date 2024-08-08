const Book = require('../models/book');

exports.createBook = async (req, res) => {
  try {
    const book = new Book({
      ...req.body,
      userId: req.user._id,
      imageUrl: req.file.path
    });
    await book.save();
    res.status(201).send({ message: 'Book created successfully', book });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).send(books);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(3);
    res.status(200).send(books);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send();
    }
    res.status(200).send(book);
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.updateBookById = async (req, res) => {
  try {
    const updates = req.file
      ? { ...req.body, imageUrl: req.file.path }
      : req.body;

    const book = await Book.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!book) {
      return res.status(404).send();
    }
    res.status(200).send({ message: 'Book updated successfully', book });
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.deleteBookById = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).send();
    }
    res.status(200).send({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).send(err);
  }
};

exports.rateBook = async (req, res) => {
  try {
    const { rating } = req.body;
    if (rating < 0 || rating > 5) {
      return res.status(400).send({ message: 'Rating must be between 0 and 5' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send();
    }

    const alreadyRated = book.ratings.find(r => r.userId.equals(req.user._id));
    if (alreadyRated) {
      return res.status(400).send({ message: 'You have already rated this book' });
    }

    book.ratings.push({ userId: req.user._id, grade: rating });
    book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).send(book);
  } catch (err) {
    res.status(500).send(err);
  }
};

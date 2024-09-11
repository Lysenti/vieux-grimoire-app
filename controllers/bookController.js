import Book from '../models/book.js';



// Fonction pour générer l'URL complète de l'image
const saveImageUrl = (imagePath) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000'; 
  const imageUrl = `${backendUrl}/${imagePath}`; // Génération de l'URL complète
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

    const reqBook = JSON.parse(req.body.book);
    const rating = reqBook.ratings ? reqBook.ratings[0] : undefined;
    if (rating) {
      rating.userId = req.user._id.toString();  // Convertit en chaîne de caractères
    }

    // Créer un nouveau livre avec les données envoyées et l'URL de l'image (si présente)
    const book = new Book({
      userId: req.user._id.toString(),  // Convertit en chaîne de caractères
      title: reqBook.title,
      author: reqBook.author,
      imageUrl: imageUrl || '',  
      year: reqBook.year, 
      genre: reqBook.genre,  
      ratings: rating ? [rating] : [],  
      averageRating: rating ? rating.grade : 0 ,  
     });

    // Sauvegarder le livre dans la base de données
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création du livre.' });
  }
};



// Obtenir tous les livres
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find().populate('userId', 'name email');

    // Convertir userId en chaîne de caractères dans chaque livre
    const booksWithStringUserId = books.map(book => {
      // Convertit userId en chaîne si c'est un objet
      if (book.userId && typeof book.userId === 'object') {
        book.userId = book.userId._id.toString();
      }
      return book;
    });

    res.status(200).send(booksWithStringUserId);
  } catch (err) {
    console.error('Erreur lors de la récupération des livres:', err.message); 
    res.status(500).send({ error: 'Erreur serveur lors de la récupération des livres.' });
  }
};

// Obtenir un livre par ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('userId', 'name email');

    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }

    // Convertit userId en chaîne si c'est un objet
    if (book.userId && typeof book.userId === 'object') {
      book.userId = book.userId._id.toString();
    }

    res.status(200).send(book);
  } catch (err) {
    console.error('Erreur lors de la récupération du livre par ID:', err.message); 
    res.status(500).send({ error: 'Erreur serveur lors de la récupération du livre.' });
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

  const { rating } = req.body;

  try {
    const { grade } = req.body;

    if (!rating) {
      return res.status(400).send({ error: 'Rating is required' });
    }

    // Vérifie que l'utilisateur est authentifié
    if (!req.user || !req.user._id) {
      return res.status(401).send({ error: 'User is not authenticated.' });
    }

    // Récupère le livre par ID
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }

    // Vérifie si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find(
      (rating) => rating.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).send({ error: 'You have already rated this book.' });
    }

    // Ajoute la nouvelle notation
    book.ratings.push({ userId: req.user._id, grade: rating }); // Utilise `rating` pour définir `grade`

    // Recalcule la moyenne des notations
    book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

    // Sauvegarde le livre avec la nouvelle notation
    await book.save();

    res.status(200).send(book);
  } catch (err) {
    console.error('Erreur lors de la notation du livre:', err.message); 
    res.status(500).send({ error: 'Erreur serveur lors de la notation du livre.' });
  }
};



export const getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ averageRating: -1 }).limit(5).populate('userId', 'name email');

    // Convertir userId en chaîne de caractères dans chaque livre
    const booksWithStringUserId = books.map(book => {
      if (book.userId && typeof book.userId === 'object') {
        book.userId = book.userId._id.toString();
      }
      return book;
    });

    res.status(200).send(booksWithStringUserId);
  } catch (err) {
    console.error('Erreur lors de la récupération des livres les mieux notés:', err.message);
    res.status(500).send({ error: 'Erreur serveur lors de la récupération des livres les mieux notés.' });
  }
};

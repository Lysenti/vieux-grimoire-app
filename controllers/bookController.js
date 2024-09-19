import Book from '../models/book.js';



// Fonction pour générer l'URL complète de l'image
const saveImageUrl = (imagePath) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const imageUrl = `${backendUrl}/${imagePath.replace(/\\/g, '/')}`; 
  return imageUrl;
};

// Middleware pour l'upload d'image
//export const uploadImage = upload.single('image');

// Créer un nouveau livre
export const createBook = async (req, res) => {
  try {
    const { book } = req.body;
    const parsedBook = JSON.parse(book);

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Image non reçue ou invalide.' });
    }

    //const optimizedImagePath = `uploads/optimized-${Date.now()}-${req.file.originalname}`;


   
    const newBook = new Book({
      ...parsedBook,
      imageUrl: req.file.path,
    });

    await newBook.save();

    res.status(201).json(newBook);
  } catch (error) {
    console.error('Erreur lors de la création du livre:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir tous les livres
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    res.status(500).json({ message: error.message });
  }
};

// Obtenir un livre par ID
export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: 'Livre non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un livre par ID
export const updateBookById = async (req, res) => {
  try {
    let book;
    if ("book" in req.body) {
      book = JSON.parse(req.body.book);
    } else{
      book = req.body;
    }


    if (!book) {
      return res.status(404).json({ message: 'Book data is missing or invalid' });
    }

    const bookToUpdate = await Book.findById(req.params.id);

    if(!bookToUpdate) {
      return res.status(404).json({ message: 'Book not found'});
    }

    if (!req.user || !req.user._id) {
      return res.status(401).send({ error: 'User is not authenticated.' });
    }

    const isCreator = bookToUpdate.userId.toString() === req.user._id.toString();

    if (isCreator) {
    
      if (req.file && req.file.path) {
        bookToUpdate.imageUrl = req.file.path;
      }

      console.log('Données avant mise à jour du livre :', {
        title: bookToUpdate.title,
        author: bookToUpdate.author,
        year: bookToUpdate.year,
        genre: bookToUpdate.genre,
        imageUrl: bookToUpdate.imageUrl
      });

      bookToUpdate.title = book.title || bookToUpdate.title;
      bookToUpdate.author = book.author || bookToUpdate.author;
      bookToUpdate.year = book.year || bookToUpdate.year;
      bookToUpdate.genre = book.genre || bookToUpdate.genre;


      console.log('Données après mise à jour du livre :', {
        title: bookToUpdate.title,
        author: bookToUpdate.author,
        year: bookToUpdate.year,
        genre: bookToUpdate.genre,
        imageUrl: bookToUpdate.imageUrl
      });

    } else {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez pas modifier ce livre.' });
    }

    // Mise à jour des notes (ratings) si elles sont fournies
    if (book.rating) {
      const existingRating = bookToUpdate.ratings.find(
        (rating) => rating.userId.toString() === req.user._id.toString()
      );

      if (existingRating) {
        // Mise à jour de la note si l'utilisateur a déjà noté le livre
        existingRating.grade = book.rating;
      } else {
        // Ajout d'une nouvelle note si l'utilisateur n'a pas encore noté le livre
        bookToUpdate.ratings.push({ userId: req.user._id, grade: book.rating });
      }

      // Calcul de la moyenne des notes
      bookToUpdate.averageRating = bookToUpdate.ratings.reduce((acc, curr) => acc + curr.grade, 0) / bookToUpdate.ratings.length;
    }

    const updatedBook = await bookToUpdate.save();
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du livre:', error);
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un livre par ID
export const deleteBookById = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (book) {
      res.status(200).json({ message: 'Livre supprimé avec succès' });
    } else {
      res.status(404).json({ message: 'Livre non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    res.status(500).json({ message: error.message });
  }
};

// Ajouter une note à un livre
export const rateBook = async (req, res) => {
  const { rating } = req.body;

  try {
    if (!rating) {
      return res.status(400).send({ error: 'Rating is required' });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).send({ error: 'User is not authenticated.' });
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send({ error: 'Book not found' });
    }

    const existingRating = book.ratings.find(
      (rating) => rating.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).send({ error: 'You have already rated this book.' });
    }

    book.ratings.push({ userId: req.user._id, grade: rating });

    book.averageRating = book.ratings.reduce((acc, rating) => acc + rating.grade, 0) / book.ratings.length;

    await book.save();
    res.status(200).send(book);
  } catch (err) {
    console.error('Erreur lors de la notation du livre:', err.message); 
    res.status(500).send({ error: 'Erreur serveur lors de la notation du livre.' });
  }
};

// Obtenir les livres les mieux notés
export const getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ averageRating: -1 }).limit(3);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres les mieux notés:', error);
    res.status(500).json({ message: error.message });
  }
};

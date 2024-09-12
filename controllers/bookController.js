import Book from '../models/book.js';
import multer from 'multer';


// Configure multer pour l'upload en mémoire
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Fonction pour générer l'URL complète de l'image
const saveImageUrl = (imagePath) => {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  const imageUrl = `${backendUrl}/${imagePath.replace(/\\/g, '/')}`; 
  return imageUrl;
};

// Middleware pour l'upload d'image
export const uploadImage = upload.single('image');

// Créer un nouveau livre
export const createBook = async (req, res) => {
  try {
    // Extraire le champ 'book' du corps de la requête et le parser
    const { book } = req.body;
    const parsedBook = JSON.parse(book);

    // Vérifier que le fichier a été reçu et qu'il est valide
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: 'Image non reçue ou invalide.' });
    }

     // Générer l'URL complète de l'image
     const imageUrl = saveImageUrl(`uploads/${req.file.filename}`);


    // Créer un nouvel objet livre avec les données reçues
    const newBook = new Book({
      ...parsedBook,
      imageUrl,
    });

    // Enregistrer le nouveau livre dans la base de données
    await newBook.save();

    // Retourner le livre créé avec succès
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

export const updateBookById = async (req, res) => {
  try {
    const { book } = req.body;


    if (!book) {
      return res.status(400).json({ message: 'Les données du livre sont manquantes ou invalides.' });
    }

    const parsedBook = JSON.parse(book);

    console.log('Contenu de book:', book);
    console.log('Données analysées de book:', parsedBook);


    // Recherche du livre par ID pour mettre à jour ses propriétés
    const bookToUpdate = await Book.findById(req.params.id);

    if (!bookToUpdate) {
      return res.status(404).json({ message: 'Livre non trouvé' });
    }

     // Vérifie que l'utilisateur est authentifié
     if (!req.user || !req.user._id) {
      return res.status(401).send({ error: 'User is not authenticated.' });
    }

    // Vérifie si l'utilisateur est le créateur du livre
    const isCreator = bookToUpdate.userId.toString() === req.user._id.toString();

    // Si l'utilisateur est le créateur, permettre la mise à jour complète
    if (isCreator) {

      let imageUrl = bookToUpdate.imageUrl;
      if (req.file) {
        imageUrl = saveImageUrl(`uploads/${req.file.filename}`);
        console.log('Nouvelle image URL:', imageUrl);
      }


      console.log('Données avant mise à jour du livre :', {
        title: bookToUpdate.title,
        author: bookToUpdate.author,
        year: bookToUpdate.year,
        genre: bookToUpdate.genre,
        imageUrl: bookToUpdate.imageUrl
      });

      // Mettre à jour les propriétés du livre
      bookToUpdate.title = parsedBook.title || bookToUpdate.title;
      bookToUpdate.author = parsedBook.author || bookToUpdate.author;
      bookToUpdate.year = parsedBook.year || bookToUpdate.year;
      bookToUpdate.genre = parsedBook.genre || bookToUpdate.genre;
      bookToUpdate.imageUrl = imageUrl;

      console.log('Données après mise à jour du livre :', {
        title: bookToUpdate.title,
        author: bookToUpdate.author,
        year: bookToUpdate.year,
        genre: bookToUpdate.genre,
        imageUrl: bookToUpdate.imageUrl
      });

      

      console.log('Livre à mettre à jour après modification:', bookToUpdate);

    } else {
      return res.status(403).json({ message: 'Accès refusé : vous ne pouvez pas modifier ce livre.' });

    }

    // Mise à jour du rating (note) pour tous les utilisateurs
    if (parsedBook.rating) {
      const existingRating = bookToUpdate.ratings.find(
        (rating) => rating.userId.toString() === req.auth.userId.toString()
      );

      if (existingRating) {
        existingRating.grade = parsedBook.rating;
      } else {
        bookToUpdate.ratings.push({ userId: req.auth.userId, grade: parsedBook.rating });
      }

      // Recalculer la note moyenne
      bookToUpdate.averageRating = bookToUpdate.ratings.reduce((acc, curr) => acc + curr.grade, 0) / bookToUpdate.ratings.length;
    }

    // Sauvegarder le livre mis à jour
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
    book.ratings.push({ userId: req.user._id, grade: rating });

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


// Obtenir les livres les mieux notés
export const getBestRatedBooks = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ averageRating: -1 }).limit(5);
    res.status(200).json(books);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres les mieux notés:', error);
    res.status(500).json({ message: error.message });
  }
};

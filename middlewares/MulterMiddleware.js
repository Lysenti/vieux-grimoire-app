import multer from 'multer';

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

// Créez une instance de multer avec la configuration de stockage
const upload = multer({ storage });

// Middleware pour gérer les téléchargements d'images
const uploadMiddleware = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: 'Erreur de téléchargement de fichier.' });
    } else if (err) {
      return res.status(500).json({ message: 'Erreur serveur lors du téléchargement du fichier' });
    }
    next();
  });
};

export default uploadMiddleware;
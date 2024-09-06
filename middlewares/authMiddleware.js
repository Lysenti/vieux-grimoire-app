import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const auth = async (req, res, next) => {
  try {

 // Vérifie que le token est présent dans l'en-tête
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).send({ error: 'Authentication token is required.' });
    }

    // Vérifie et décode le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);

    // Si l'utilisateur n'est pas trouvé, retourne une erreur
    if (!user) {
      return res.status(401).send({ error: 'User not found.' });
    }

    // Attache l'utilisateur et le token à l'objet de requête
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    console.error('Erreur d\'authentification:', err.message); 
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;

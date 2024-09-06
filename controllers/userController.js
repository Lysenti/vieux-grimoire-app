import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User created successfully', user });
  } catch (err) {
    res.status(400).send(err);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Unable to login');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Unable to login');
    }

    // Génère le token JWT
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Retourne la réponse au format attendu par le front-end
    res.send({
      userId: user._id.toString(), // Met directement userId dans la réponse
      token
    });
  } catch (err) {
    res.status(400).send({ error: 'Unable to login' });
  }
};


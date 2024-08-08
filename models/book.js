import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      grade: { type: Number, required: true }
    }
  ],
  averageRating: { type: Number, default: 0 }
});

const Book = mongoose.model('Book', bookSchema);

export default Book;


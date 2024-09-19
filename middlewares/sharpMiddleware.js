import sharp from 'sharp';

const optimize = async (req, res, next) => {
  if (!req.file || !req.file.path) {
    return next();
  }

  const optimizedImagePath = `uploads/optimized-${Date.now()}-${req.file.originalname}`;

  await sharp(req.file.path)
    .resize({ width: 800 })
    .toFormat('jpeg')
    .jpeg({ quality: 80 })
    .toFile(optimizedImagePath);

  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
  req.file.path = `${backendUrl}/${optimizedImagePath.replace(/\\/g, '/')}`;
  
  next();
};

export default optimize;

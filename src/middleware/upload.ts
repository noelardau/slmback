import multer, { FileFilterCallback } from 'multer';

// Configuration du storage en mémoire
const storage = multer.memoryStorage();

// Filtre pour accepter uniquement les images
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return callback(null, true);
  } else {
    callback(new Error('Seules les images sont autorisées'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});
import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload } from '../middleware/upload';

const router = Router();

// Upload de photo de collectif
router.post('/upload/collectif-photo', upload.single('photo'), uploadController.uploadCollectifPhoto);

// Suppression de photo de collectif
router.delete('/upload/:path', uploadController.deleteCollectifPhoto);

export default router;
import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import { upload } from '../middleware/upload';

const router = Router();

router.post('/upload/collectif-photo', upload.single('photo'), uploadController.uploadCollectifPhoto);
router.delete('/upload/:path', uploadController.deleteCollectifPhoto);
router.post('/upload/membre-photo', upload.single('photo'), uploadController.uploadMembrePhoto);
router.delete('/upload/membre/:path', uploadController.deleteMembrePhoto);
router.post('/upload/tournoi-affiche', upload.single('affiche'), uploadController.uploadTournoiAffiche);
router.delete('/upload/tournoi/:path', uploadController.deleteTournoiAffiche);

export default router;
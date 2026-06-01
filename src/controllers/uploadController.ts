import { Request, Response } from 'express';
import { supabase, STORAGE_BUCKET, STORAGE_FOLDER } from '../config/supabase';

export const uploadController = {
  async uploadCollectifPhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const file = req.file;
      const fileName = `collectif-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
      const filePath = `${STORAGE_FOLDER}/${fileName}`;

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('Erreur upload Supabase:', uploadError);
        return res.status(500).json({ error: 'Erreur lors de l\'upload' });
      }

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return res.json({
        url: urlData.publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  },

  async deleteCollectifPhoto(req: Request, res: Response) {
    try {
      const { path } = req.params;

      if (!path || Array.isArray(path)) {
        return res.status(400).json({ error: 'Chemin invalide' });
      }

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) {
        console.error('Erreur suppression Supabase:', error);
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      res.json({ message: 'Photo supprimée avec succès' });
    } catch (error) {
      console.error('Erreur suppression:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  },

  async uploadMembrePhoto(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const file = req.file;
      const fileName = `membre-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
      const filePath = `${STORAGE_FOLDER}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('Erreur upload Supabase:', uploadError);
        return res.status(500).json({ error: 'Erreur lors de l\'upload' });
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return res.json({
        url: urlData.publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  },

  async deleteMembrePhoto(req: Request, res: Response) {
    try {
      const { path } = req.params;

      if (!path || Array.isArray(path)) {
        return res.status(400).json({ error: 'Chemin invalide' });
      }

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) {
        console.error('Erreur suppression Supabase:', error);
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      res.json({ message: 'Photo supprimée avec succès' });
    } catch (error) {
      console.error('Erreur suppression:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  },

  async uploadTournoiAffiche(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const file = req.file;
      const fileName = `tournoi-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.originalname.split('.').pop()}`;
      const filePath = `${STORAGE_FOLDER}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) {
        console.error('Erreur upload Supabase:', uploadError);
        return res.status(500).json({ error: 'Erreur lors de l\'upload' });
      }

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return res.json({
        url: urlData.publicUrl,
        path: filePath,
      });
    } catch (error) {
      console.error('Erreur upload:', error);
      res.status(500).json({ error: 'Erreur lors de l\'upload' });
    }
  },

  async deleteTournoiAffiche(req: Request, res: Response) {
    try {
      const { path } = req.params;

      if (!path || Array.isArray(path)) {
        return res.status(400).json({ error: 'Chemin invalide' });
      }

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([path]);

      if (error) {
        console.error('Erreur suppression Supabase:', error);
        return res.status(500).json({ error: 'Erreur lors de la suppression' });
      }

      res.json({ message: 'Affiche supprimée avec succès' });
    } catch (error) {
      console.error('Erreur suppression:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
  },
};
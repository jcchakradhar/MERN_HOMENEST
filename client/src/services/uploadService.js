// src/services/uploadService.js
// ✅ CORRECT WAY in uploadService.js
import { supabase } from '../supabase';


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


class UploadService {
  async uploadImage(file, folder = 'listings') {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName);

      return {
        path: fileName,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Upload error:', error.message);
      throw error;
    }
  }

  async deleteImage(path) {
    try {
      const { error } = await supabase.storage
        .from('listing-images')
        .remove([path]);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Delete error:', error.message);
      throw error;
    }
  }
}

export const uploadService = new UploadService();

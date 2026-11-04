import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class StorageService {
  // Bucket público: los logos y firmas se muestran directamente en los certificados
  private readonly bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'uploads';

  constructor(private readonly supabase: SupabaseService) {}

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${path}/${uuid()}.${fileExt}`;
    const storage = this.supabase.client.storage.from(this.bucket);

    const { error } = await storage.upload(fileName, file.buffer, {
      contentType: file.mimetype,
    });
    if (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      throw new InternalServerErrorException('No se pudo subir el archivo');
    }

    return storage.getPublicUrl(fileName).data.publicUrl;
  }
}

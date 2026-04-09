import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UploadResponse {
  url: string;
  id: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ImageService {
  private readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private http: HttpClient) {}

  /**
   * Valida un archivo de imagen antes de subir
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Formato no soportado. Usa JPG, PNG, GIF o WebP' };
    }
    if (file.size > this.MAX_FILE_SIZE) {
      return { valid: false, error: 'Archivo muy grande. Máximo 5MB' };
    }
    return { valid: true };
  }

  /**
   * Lee un archivo y genera preview con DataURL
   */
  generatePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Sube una imagen de producto
   */
  uploadProductImage(file: File): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'producto');
    return this.http.post<UploadResponse>(`${environment.apiUrl}/upload`, formData);
  }

  /**
   * Obtiene la URL completa de una imagen
   */
  getImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.apiUrl}/images/${imagePath}`;
  }

  /**
   * Obtiene la URL para una imagen de producto
   */
  getProductImageUrl(imagePath: string): string {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${environment.apiUrl}/images/productos/${imagePath}`;
  }

  /**
   * Elimina una imagen
   */
  deleteImage(imageId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/images/${imageId}`);
  }

  /**
   * Obtiene metadatos de una imagen (tamaño, dimensiones, etc)
   */
  getImageMetadata(file: File): Promise<ImageMetadata> {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.onload = () => {
          resolve({
            fileName: file.name,
            fileSize: file.size,
            width: img.width,
            height: img.height,
            type: file.type,
            lastModified: file.lastModified
          });
        };
        img.src = e.target?.result as string;
      };
      
      reader.readAsDataURL(file);
    });
  }
}

export interface ImageMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  type: string;
  lastModified: number;
}

/**
 * CLOUDINARY UPLOAD PIPELINE
 * Unsigned direct uploads to Cloudinary with progress tracking and security safeguards.
 */

export interface CloudinaryUploadOptions {
  onProgress?: (percent: number) => void;
  folder?: string;
}

export function isCloudinaryConfigured(): boolean {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  return Boolean(cloudName && uploadPreset);
}

export const CLOUDINARY_MISSING_MSG =
  'لم يتم ضبط بيانات Cloudinary (VITE_CLOUDINARY_CLOUD_NAME و VITE_CLOUDINARY_UPLOAD_PRESET). يمكنك إدخال أو لصق رابط مباشر للصورة/الفيديو بدلاً من ذلك.';

export async function uploadToCloudinary(
  file: File | Blob,
  options?: CloudinaryUploadOptions
): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(CLOUDINARY_MISSING_MSG);
  }

  // Security: No SVG uploads to prevent potential embedded script injection
  if (file.type === 'image/svg+xml') {
    throw new Error('رفع ملفات SVG غير مسموح لدواعي الأمان. يرجى استخدام صيغ WebP أو JPEG أو PNG.');
  }

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', options?.folder || 'hayaah');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    if (xhr.upload && options?.onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress!(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          if (res.secure_url) {
            resolve(res.secure_url);
          } else {
            reject(new Error('Cloudinary response did not return secure_url'));
          }
        } catch (e: any) {
          reject(new Error('Failed to parse Cloudinary response: ' + e.message));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err?.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('فشل الاتصال بخدمة Cloudinary. يرجى التحقق من اتصال الإنترنت.'));
    };

    xhr.send(formData);
  });
}

/**
 * Hayaah Dental Clinic - Client-Side Image Compressor (WebP)
 * Compresses images before uploading to Firestore documents in Firebase mode.
 * Hard limit of ~200KB with clear error message if larger.
 */

export const MAX_CMS_IMAGE_SIZE_BYTES = 200 * 1024; // ~200 KB

export interface CompressOptions {
  maxDimension?: number;
  maxSizeBytes?: number;
}

export async function compressImageToWebP(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const maxDimension = options.maxDimension || 1400;
  const maxSizeBytes = options.maxSizeBytes || MAX_CMS_IMAGE_SIZE_BYTES;

  return new Promise((resolve, reject) => {
    // Basic file type check
    if (!file.type.startsWith('image/')) {
      reject(new Error('الملف المختار ليس صورة صالحة / The selected file is not a valid image.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('فشل قراءة ملف الصورة / Failed to read image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('فشل معالجة الصورة المحددة / Failed to process image.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Downscale while preserving aspect ratio if exceeding maxDimension
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر إنشاء مساحة معالجة الصورة في المتصفح / Failed to initialize canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try stepped qualities to achieve target size <= maxSizeBytes
        const qualitySteps = [0.85, 0.75, 0.65, 0.50, 0.35];
        let chosenDataUrl: string | null = null;

        for (const quality of qualitySteps) {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          // Base64 size estimation in bytes
          const byteLength = Math.round((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 0.75);
          if (byteLength <= maxSizeBytes) {
            chosenDataUrl = dataUrl;
            break;
          }
        }

        // If still over limit, downscale further to max 900px
        if (!chosenDataUrl && (width > 900 || height > 900)) {
          const secondaryScale = 900 / Math.max(width, height);
          canvas.width = Math.round(width * secondaryScale);
          canvas.height = Math.round(height * secondaryScale);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          for (const quality of [0.70, 0.50, 0.35, 0.25]) {
            const dataUrl = canvas.toDataURL('image/webp', quality);
            const byteLength = Math.round((dataUrl.length - (dataUrl.indexOf(',') + 1)) * 0.75);
            if (byteLength <= maxSizeBytes) {
              chosenDataUrl = dataUrl;
              break;
            }
          }
        }

        if (chosenDataUrl) {
          resolve(chosenDataUrl);
        } else {
          reject(
            new Error(
              'حجم الصورة بعد الضغط يتجاوز الحد الأقصى المسموح (200 كيلوبايت). يرجى اختيار صورة أصغر أو تقليل دقتها / ' +
              'Compressed image exceeds the 200KB limit. Please choose a smaller image or crop it before uploading.'
            )
          );
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}

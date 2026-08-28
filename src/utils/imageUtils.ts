/**
 * Image processing utilities for transaction receipt uploads
 * Automatically resizes and compresses images to maintain optimal performance and storage efficiency.
 */

export async function processReceiptFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File yang diunggah harus berupa gambar (JPG, PNG, WebP).'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        // Calculate aspect ratio resizing
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to original read if canvas context fails
          resolve(event.target?.result as string);
          return;
        }

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height);

        // Export as JPEG with controlled quality for compact size
        try {
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch {
          resolve(event.target?.result as string);
        }
      };

      img.onerror = () => {
        reject(new Error('Gagal memproses gambar struk. Format tidak didukung.'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file gambar.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format bytes to readable string (e.g. 150 KB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

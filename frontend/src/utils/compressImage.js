// Resizes/compresses an image in the browser before it's uploaded, so large
// phone photos don't get sent to the server (and Cloudinary) at full size.
// Returns a new File with the same name, JPEG-encoded.

export default function compressImage(file, { maxDimension = 1600, quality = 0.82 } = {}) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width <= maxDimension && height <= maxDimension) {
        resolve(file); // already small enough, skip compression
        return;
      }

      const scale = maxDimension / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // fall back to original if compression fails
            return;
          }
          const compressed = new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
            type: 'image/jpeg',
          });
          resolve(compressed);
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file); // fall back to original on any decode error
    };

    img.src = objectUrl;
  });
}

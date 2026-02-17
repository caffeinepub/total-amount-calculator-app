/**
 * Reads an image file and converts it to a data URL
 * @param file - The image file to read
 * @returns Promise that resolves to the data URL string
 * @throws Error if file is not an image or reading fails
 */
export function readImageFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate that it's an image file
    if (!file.type.startsWith('image/')) {
      reject(new Error('File must be an image'));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as data URL'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

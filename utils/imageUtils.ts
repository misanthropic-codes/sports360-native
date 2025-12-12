import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerResult {
  localUri: string;      // Local file URI for display
  apiUrl: string;        // Constant placeholder URL for backend
  fileName: string;      // Original filename
}

/**
 * Picks an image from the device library and stores it locally
 * @param category - Category for organizing images (e.g., 'team', 'profile', 'ground')
 * @returns Object with local URI and constant API URL
 */
export const pickAndStoreImage = async (
  category: string = 'general'
): Promise<ImagePickerResult | null> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Permission to access media library was denied');
      return null;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile/logo images
      quality: 0.8,   // Compress to 80% quality
    });

    if (result.canceled) {
      return null;
    }

    const selectedAsset = result.assets[0];
    const localUri = selectedAsset.uri;
    const fileName = localUri.split('/').pop() || `${category}_${Date.now()}.jpg`;

    // Create uploads directory if it doesn't exist
    const uploadsDir = `${FileSystem.documentDirectory}uploads/`;
    const dirInfo = await FileSystem.getInfoAsync(uploadsDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(uploadsDir, { intermediates: true });
    }

    // Copy image to local uploads folder
    const newPath = `${uploadsDir}${category}_${Date.now()}_${fileName}`;
    await FileSystem.copyAsync({
      from: localUri,
      to: newPath,
    });

    console.log('✅ Image stored locally at:', newPath);

    // Generate constant placeholder URL for backend
    // Using placehold.co with a consistent pattern
    const apiUrl = `https://placehold.co/400x400/3B82F6/FFFFFF?text=${category.toUpperCase()}`;

    return {
      localUri: newPath,
      apiUrl,
      fileName,
    };
  } catch (error) {
    console.error('Error picking image:', error);
    return null;
  }
};

/**
 * Picks multiple images from the device library
 * Useful for uploading ground images, etc.
 * @param category - Category for organizing images
 * @param maxCount - Maximum number of images to select
 * @returns Array of image picker results
 */
export const pickMultipleImages = async (
  category: string = 'general',
  maxCount: number = 5
): Promise<ImagePickerResult[]> => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      console.error('Permission to access media library was denied');
      return [];
    }

    // Launch image picker with multiple selection
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: maxCount,
    });

    if (result.canceled || !result.assets) {
      return [];
    }

    const results: ImagePickerResult[] = [];

    // Create uploads directory if it doesn't exist
    const uploadsDir = `${FileSystem.documentDirectory}uploads/`;
    const dirInfo = await FileSystem.getInfoAsync(uploadsDir);
    
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(uploadsDir, { intermediates: true });
    }

    // Process each selected image
    for (let i = 0; i < result.assets.length; i++) {
      const asset = result.assets[i];
      const localUri = asset.uri;
      const fileName = localUri.split('/').pop() || `${category}_${Date.now()}_${i}.jpg`;

      // Copy image to local uploads folder
      const newPath = `${uploadsDir}${category}_${Date.now()}_${i}_${fileName}`;
      await FileSystem.copyAsync({
        from: localUri,
        to: newPath,
      });

      console.log(`✅ Image ${i + 1} stored locally at:`, newPath);

      // Generate constant placeholder URL for backend
      const apiUrl = `https://placehold.co/600x400/3B82F6/FFFFFF?text=${category.toUpperCase()}-${i + 1}`;

      results.push({
        localUri: newPath,
        apiUrl,
        fileName,
      });
    }

    return results;
  } catch (error) {
    console.error('Error picking multiple images:', error);
    return [];
  }
};

/**
 * Cleans up old images from the uploads folder
 * @param olderThanDays - Delete images older than this many days
 */
export const cleanupOldImages = async (olderThanDays: number = 7): Promise<void> => {
  try {
    const uploadsDir = `${FileSystem.documentDirectory}uploads/`;
    const dirInfo = await FileSystem.getInfoAsync(uploadsDir);
    
    if (!dirInfo.exists) {
      return;
    }

    const files = await FileSystem.readDirectoryAsync(uploadsDir);
    const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    for (const file of files) {
      const filePath = `${uploadsDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && fileInfo.modificationTime && fileInfo.modificationTime < cutoffTime) {
        await FileSystem.deleteAsync(filePath);
        console.log('🗑️ Deleted old image:', file);
      }
    }
  } catch (error) {
    console.error('Error cleaning up old images:', error);
  }
};

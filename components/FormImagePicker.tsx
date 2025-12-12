import { UploadCloud } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { ImagePickerResult, pickAndStoreImage } from '../utils/imageUtils';

interface FormImagePickerProps {
  label: string;
  onImagePicked: (result: ImagePickerResult) => void;
  imageUrl?: string | null;
  category?: string;
}

const FormImagePicker: React.FC<FormImagePickerProps> = ({ 
  label, 
  onImagePicked, 
  imageUrl,
  category = 'general'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectImage = async () => {
    setIsLoading(true);
    try {
      const result = await pickAndStoreImage(category);
      if (result) {
        onImagePicked(result);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="mb-4 items-center">
      <Text className="text-base font-semibold text-slate-600 mb-2 self-start">{label}</Text>
      <TouchableOpacity
        onPress={handleSelectImage}
        disabled={isLoading}
        className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-full items-center justify-center"
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#3B82F6" />
        ) : imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full rounded-full" />
        ) : (
          <View className="items-center">
            <UploadCloud size={32} color="#94A3B8" />
            <Text className="text-slate-500 mt-2 text-center">Upload Logo</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default FormImagePicker;
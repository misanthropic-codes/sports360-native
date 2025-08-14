import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { UploadCloud } from 'lucide-react-native';

interface FormImagePickerProps {
  label: string;
  onSelectImage: () => void;
  imageUrl?: string | null;
}

const FormImagePicker: React.FC<FormImagePickerProps> = ({ label, onSelectImage, imageUrl }) => {
  return (
    <View className="mb-4 items-center">
      <Text className="text-base font-semibold text-slate-600 mb-2 self-start">{label}</Text>
      <TouchableOpacity
        onPress={onSelectImage}
        className="w-32 h-32 bg-slate-50 border-2 border-dashed border-slate-300 rounded-full items-center justify-center"
      >
        {imageUrl ? (
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
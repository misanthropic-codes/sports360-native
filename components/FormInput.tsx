import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => {
  return (
    <View className="mb-4">
      <Text className="text-base font-semibold text-slate-600 mb-2">{label}</Text>
      <TextInput
        className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-base text-slate-800"
        placeholderTextColor="#94A3B8"
        {...props}
      />
    </View>
  );
};

export default FormInput;
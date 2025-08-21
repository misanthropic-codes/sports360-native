import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Calendar, MapPin, Users } from 'lucide-react-native';

interface UpcomingEventCardProps {
  title: string;
  subtitle: string;
  status: string;
  price: string | number;
  date: string;
  location: string;
  participants: number;
}

const UpcomingEventCard: React.FC<UpcomingEventCardProps> = ({
  title,
  subtitle,
  status,
  price,
  date,
  location,
  participants,
}) => {
  return (
    <View className="bg-white p-4 rounded-2xl border border-slate-200 mx-4 mb-3 shadow-sm">
      {/* Top Section: Title, Status, Price */}
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          <Text className="text-base font-bold text-slate-800">{title}</Text>
          <Text className="text-sm text-slate-500">{subtitle}</Text>
        </View>
        <View className="items-end">
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 text-xs font-bold">{status}</Text>
          </View>
          <Text className="text-lg font-bold text-slate-800 mt-1">{price}</Text>
        </View>
      </View>

      {/* Bottom Section: Details and Join Button */}
      <View className="flex-row justify-between items-center mt-3">
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center">
            <Calendar size={14} color="#94A3B8" />
            <Text className="text-xs text-slate-500 ml-1">{date}</Text>
          </View>
          <View className="flex-row items-center">
            <MapPin size={14} color="#EF4444" />
            <Text className="text-xs text-red-500 font-semibold ml-1">{location}</Text>
          </View>
          <View className="flex-row items-center">
            <Users size={14} color="#94A3B8" />
            <Text className="text-xs text-slate-500 ml-1">{participants} joined</Text>
          </View>
        </View>
        <TouchableOpacity className="bg-indigo-600 px-6 py-2 rounded-lg">
          <Text className="text-white font-bold text-sm">Join Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UpcomingEventCard;

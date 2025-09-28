import { Heart, MapPin, Star } from "lucide-react-native";
import React, { useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";

interface VenueCardProps {
  imageUrl: string;
  availabilityText: string;
  initialIsFavorited?: boolean;
  rating: number;
  stadiumName: string;
  location: string;
  price: string;
  features: string[];
  onBookNowPress: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  imageUrl,
  availabilityText,
  initialIsFavorited = false,
  rating,
  stadiumName,
  location,
  price,
  features,
  onBookNowPress,
}) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited);

  return (
    <View className="bg-white rounded-2xl shadow-lg m-4 border border-slate-100">
      {/* Image Section */}
      <ImageBackground
        source={{ uri: imageUrl }}
        className="h-48 w-full"
        imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <View className="flex-1 p-3 justify-between">
          {/* Top Row */}
          <View className="flex-row justify-between items-start">
            <View className="bg-green-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-bold">
                {availabilityText}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsFavorited((prev) => !prev)}
              className="bg-white rounded-full w-10 h-10 items-center justify-center shadow-md"
            >
              <Heart
                size={22}
                color={isFavorited ? "#F43F5E" : "#94A3B8"}
                fill={isFavorited ? "#F43F5E" : "none"}
              />
            </TouchableOpacity>
          </View>

          {/* Rating */}
          <View className="self-end bg-white/90 rounded-full px-3 py-2 flex-row items-center shadow-md">
            <Text className="text-slate-800 font-bold mr-1">
              {rating.toFixed(1)}
            </Text>
            <Star size={16} color="#FBBF24" fill="#FBBF24" />
          </View>
        </View>
      </ImageBackground>

      {/* Info Section */}
      <View className="p-4">
        <View className="flex-row justify-between items-start">
          <View>
            <Text className="text-xl font-bold text-slate-800">
              {stadiumName}
            </Text>
            <View className="flex-row items-center mt-1">
              <MapPin size={16} color="#EF4444" />
              <Text className="text-slate-500 ml-1">{location}</Text>
            </View>
          </View>
          <Text className="text-lg font-bold text-green-600">{price}</Text>
        </View>

        {/* Features & Button */}
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row gap-2 flex-wrap">
            {features.map((feature: string, index: number) => (
              <View
                key={`${feature}-${index}`}
                className={`px-4 py-2 rounded-lg ${
                  index % 2 === 0 ? "bg-green-100" : "bg-indigo-100"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    index % 2 === 0 ? "text-green-700" : "text-indigo-700"
                  }`}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
          <TouchableOpacity
            onPress={onBookNowPress}
            className="bg-blue-500 rounded-lg px-6 py-3 shadow"
          >
            <Text className="text-white font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VenueCard;

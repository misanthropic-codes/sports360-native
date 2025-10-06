import { Heart, MapPin, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useGroundStore } from "../store/groundStore"; // ✅ Zustand store

interface VenueCardProps {
  groundId: string;
  imageUrl: string;
  availabilityText: string;
  initialIsFavorited?: boolean;
  stadiumName: string;
  location: string;
  price: string;
  features: string[];
  onBookNowPress: () => void;
}

const VenueCard: React.FC<VenueCardProps> = ({
  groundId,
  imageUrl,
  availabilityText,
  initialIsFavorited = false,
  stadiumName,
  location,
  price,
  features,
  onBookNowPress,
}) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited);

  // ✅ Get review data from Zustand store
  const reviewsData = useGroundStore((state) => state.groundReviews[groundId]);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    if (reviewsData && typeof reviewsData.averageRating === "number") {
      setAverageRating(reviewsData.averageRating);
    }
  }, [reviewsData]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View className="flex-row items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={16} color="#FBBF24" fill="#FBBF24" />
        ))}
        {halfStar && <Star key="half" size={16} color="#FBBF24" fill="none" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={16} color="#CBD5E1" fill="none" />
        ))}
        <Text className="ml-1 text-slate-800 font-bold">
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

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

          {/* Rating Section */}
          {averageRating > 0 && (
            <View className="self-end bg-white/90 rounded-full px-3 py-2 flex-row items-center shadow-md">
              {renderStars(averageRating)}
            </View>
          )}
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
          <View className="flex-row gap-2 flex-wrap flex-1">
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
            className="bg-blue-500 rounded-lg px-6 py-3 shadow ml-2"
          >
            <Text className="text-white font-bold">Book Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VenueCard;

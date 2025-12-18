import { Clock, Heart, MapPin, Navigation, Phone, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    Image,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Ground, useGroundStore } from "../store/groundStore";

interface VenueCardProps {
  ground: Ground;
  distance?: number; // Distance in kilometers
  onBookNowPress: () => void;
  initialIsFavorited?: boolean;
}

// Mock images for different grounds
const MOCK_GROUND_IMAGES = [
  "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&h=600&fit=crop",
];

const VenueCard: React.FC<VenueCardProps> = ({
  ground,
  distance,
  onBookNowPress,
  initialIsFavorited = false,
}) => {
  const [isFavorited, setIsFavorited] = useState<boolean>(initialIsFavorited);

  const reviewsData = useGroundStore((state) => state.groundReviews[ground.id]);
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    if (reviewsData && typeof reviewsData.averageRating === "number") {
      setAverageRating(reviewsData.averageRating);
    }
  }, [reviewsData]);

  // Get a consistent mock image based on ground ID
  const mockImage = MOCK_GROUND_IMAGES[parseInt(ground.id || "0") % MOCK_GROUND_IMAGES.length];
  const imageUrl = ground.businessLogoUrl || ground.profileImageUrl || mockImage;

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    return (
      <View className="flex-row items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={12} color="#FBBF24" fill="#FBBF24" />
        ))}
        <Text className="ml-1 text-slate-700 font-bold text-xs">
          {rating.toFixed(1)}
        </Text>
      </View>
    );
  };

  return (
    <View 
      className="bg-white rounded-3xl mx-4 mb-4 overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Image Section */}
      <View className="relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-52"
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View className="absolute top-3 left-3 right-3 flex-row justify-between items-start">
          <View className="flex-row gap-2">
            {ground.acceptOnlineBookings && (
              <View className="bg-green-500 rounded-full px-3 py-1.5 shadow-lg">
                <Text className="text-white text-xs font-bold">
                  Available
                </Text>
              </View>
            )}
            
            {/* Distance Badge */}
            {distance !== undefined && distance !== Infinity && (
              <View className="bg-blue-500 rounded-full px-3 py-1.5 shadow-lg flex-row items-center">
                <Navigation size={12} color="#FFF" fill="#FFF" />
                <Text className="text-white text-xs font-bold ml-1">
                  {distance < 1 
                    ? `${Math.round(distance * 1000)}m` 
                    : `${distance.toFixed(1)}km`}
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity
            onPress={() => setIsFavorited((prev) => !prev)}
            className="bg-white/90 rounded-full w-9 h-9 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Heart
              size={18}
              color={isFavorited ? "#F43F5E" : "#94A3B8"}
              fill={isFavorited ? "#F43F5E" : "none"}
            />
          </TouchableOpacity>
        </View>

        {/* Rating Badge - Bottom Right */}
        {averageRating > 0 && (
          <View className="absolute bottom-3 right-3 bg-white rounded-full px-3 py-1.5 shadow-lg">
            {renderStars(averageRating)}
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-4 bg-white">
        {/* Title and Location */}
        <View className="mb-3">
          <Text className="text-xl font-semibold text-gray-900 mb-2" numberOfLines={1}>
            {ground.name || ground.businessName || ground.groundOwnerName}
          </Text>
          
          {(ground.address || ground.location || ground.businessAddress || ground.primaryLocation) && (
            <View className="flex-row items-start mt-1">
              <MapPin size={16} color="#000000" />
              <Text className="ml-2 text-gray-700 text-sm flex-1" numberOfLines={2}>
                {ground.address || ground.location || ground.businessAddress || ground.primaryLocation}
              </Text>
            </View>
          )}
        </View>

        {/* Info Pills */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ground.contactPhone && (
            <View className="flex-row items-center px-3 py-2 rounded-full bg-blue-100 border border-blue-200">
              <Phone size={14} color="#1E40AF" />
              <Text className="ml-2 text-blue-900 font-medium text-sm">
                {ground.contactPhone.slice(0, 10)}
              </Text>
            </View>
          )}
          
          <View className="flex-row items-center px-3 py-2 rounded-full bg-green-100 border border-green-200">
            <Clock size={14} color="#065F46" />
            <Text className="ml-2 text-green-900 font-medium text-sm">
              Open Now
            </Text>
          </View>
        </View>

        {/* Bio */}
        {(ground.groundDescription || ground.bio) && (
          <Text className="text-gray-700 text-sm mb-4 leading-5" numberOfLines={2}>
            {ground.groundDescription || ground.bio}
          </Text>
        )}

        {/* Book Now Button */}
        <TouchableOpacity
          onPress={onBookNowPress}
          className="rounded-xl py-3.5 items-center"
          activeOpacity={0.8}
          style={{
            backgroundColor: '#3B82F6',
            shadowColor: "#3B82F6",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Text className="text-white font-bold text-base">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VenueCard;

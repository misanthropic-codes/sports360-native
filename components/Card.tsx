import { Globe, Heart, Mail, MapPin, Phone, Star } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ground, useGroundStore } from "../store/groundStore";

interface VenueCardProps {
  ground: Ground; // Pass the full Ground object
  onBookNowPress: () => void;
  initialIsFavorited?: boolean;
}

const VenueCard: React.FC<VenueCardProps> = ({
  ground,
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

  const handleLinkPress = (url?: string) => {
    if (url) Linking.openURL(url);
  };

  return (
    <View className="bg-white rounded-2xl shadow-lg m-4 border border-slate-100">
      {/* Image Section */}
      <ImageBackground
        source={{ uri: ground.businessLogoUrl || ground.profileImageUrl }}
        className="h-48 w-full"
        imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
      >
        <View className="flex-1 p-3 justify-between">
          {/* Top Row */}
          <View className="flex-row justify-between items-start">
            <View className="bg-green-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-bold">
                {ground.acceptOnlineBookings
                  ? "Online Booking Enabled"
                  : "Unavailable"}
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
        <Text className="text-xl font-bold text-slate-800">
          {ground.businessName}
        </Text>
        <Text className="text-slate-600 mb-2">{ground.ownerName}</Text>
        <Text className="text-slate-500 mb-3">{ground.bio}</Text>

        {/* Contact & Website Features */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {ground.contactPhone && (
            <TouchableOpacity
              onPress={() => handleLinkPress(`tel:${ground.contactPhone}`)}
              className="flex-row items-center px-3 py-1 rounded-lg bg-green-100"
            >
              <Phone size={16} color="#16A34A" />
              <Text className="ml-1 text-green-700 font-semibold">
                {ground.contactPhone}
              </Text>
            </TouchableOpacity>
          )}
          {ground.contactEmail && (
            <TouchableOpacity
              onPress={() => handleLinkPress(`mailto:${ground.contactEmail}`)}
              className="flex-row items-center px-3 py-1 rounded-lg bg-indigo-100"
            >
              <Mail size={16} color="#4F46E5" />
              <Text className="ml-1 text-indigo-700 font-semibold">
                {ground.contactEmail}
              </Text>
            </TouchableOpacity>
          )}
          {ground.website && (
            <TouchableOpacity
              onPress={() => handleLinkPress(ground.website)}
              className="flex-row items-center px-3 py-1 rounded-lg bg-yellow-100"
            >
              <Globe size={16} color="#CA8A04" />
              <Text className="ml-1 text-yellow-700 font-semibold">
                {ground.website}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Address */}
        {ground.businessAddress && (
          <View className="flex-row items-center mb-4">
            <MapPin size={16} color="#EF4444" />
            <Text className="ml-1 text-slate-500">
              {ground.businessAddress}
            </Text>
          </View>
        )}

        {/* Book Now Button */}
        <TouchableOpacity
          onPress={onBookNowPress}
          className="bg-blue-500 rounded-lg px-6 py-3 shadow items-center"
        >
          <Text className="text-white font-bold">Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VenueCard;

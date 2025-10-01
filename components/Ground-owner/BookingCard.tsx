import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

// Types
interface BookingCardProps {
  booking: any;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-green-100 border-green-300";
    case "pending":
      return "bg-yellow-50 border-yellow-300";
    case "rejected":
      return "bg-red-100 border-red-300";
    default:
      return "bg-gray-100 border-gray-300";
  }
};

const getStatusTextColor = (status: string) => {
  switch (status) {
    case "approved":
      return "#166534";
    case "pending":
      return "#854d0e";
    case "rejected":
      return "#991b1b";
    default:
      return "#374151";
  }
};

const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  expandedId,
  setExpandedId,
  formatDate,
  formatTime,
}) => {
  return (
    <View className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <View className="p-4">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 pr-2">
            <View className="flex-row items-center gap-2 mb-1">
              <Text className="text-gray-400">👤</Text>
              <Text className="font-semibold text-gray-900 flex-1">
                {booking.user.fullName}
              </Text>
            </View>
            <Text className="text-xs text-gray-500">{booking.user.email}</Text>
          </View>
          <View
            className={`px-3 py-1 rounded-full border ${getStatusStyle(
              booking.status
            )}`}
          >
            <Text
              className="text-xs font-medium capitalize"
              style={{ color: getStatusTextColor(booking.status) }}
            >
              {booking.status}
            </Text>
          </View>
        </View>

        {/* Date and Time */}
        <View className="bg-green-50 rounded-lg p-3 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1">
              <Text className="text-green-700">📅</Text>
              <Text className="font-medium text-green-900 text-sm">
                {formatDate(booking.startTime)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Text className="text-green-700">🕐</Text>
              <Text className="text-green-900 text-sm">
                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
              </Text>
            </View>
          </View>
        </View>

        {/* Purpose */}
        <View className="flex-row items-center gap-2 mb-2">
          <Text className="text-xs font-medium text-gray-500">Purpose:</Text>
          <View className="bg-green-100 px-2 py-1 rounded">
            <Text className="text-sm text-green-800 capitalize">
              {booking.purpose}
            </Text>
          </View>
        </View>

        {/* Message Preview */}
        <Text className="text-sm text-gray-700" numberOfLines={2}>
          {booking.message}
        </Text>

        {/* Expand Button */}
        <TouchableOpacity
          onPress={() =>
            setExpandedId(expandedId === booking.id ? null : booking.id)
          }
          className="mt-3 items-center"
        >
          <Text className="text-green-600 text-sm font-medium">
            {expandedId === booking.id ? "▲ Less Details" : "▼ More Details"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Details */}
      {expandedId === booking.id && (
        <View className="border-t border-gray-200 bg-gray-50 p-4">
          <Text className="text-sm text-gray-700">{booking.message}</Text>
        </View>
      )}
    </View>
  );
};

export default BookingCard;

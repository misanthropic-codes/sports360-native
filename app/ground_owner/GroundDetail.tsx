// screens/GroundDetailsScreen.jsx
import { useGroundStore } from "@/store/groundTStore";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

export default function GroundDetailsScreen() {
  const ground = useGroundStore((state) => state.selectedGround);

  if (!ground) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {ground.imageUrls.split(",").map((url: any, index: React.Key | null | undefined) => (
          <Image key={index} source={{ uri: url }} style={styles.image} />
        ))}

        <Text style={styles.title}>{ground.groundOwnerName}</Text>
        <Text style={styles.subTitle}>Owner: {ground.ownerName}</Text>

        <Text style={styles.label}>Description</Text>
        <Text style={styles.text}>{ground.groundDescription}</Text>

        <Text style={styles.label}>Location</Text>
        <Text style={styles.text}>{ground.primaryLocation}</Text>

        <Text style={styles.label}>Type</Text>
        <Text style={styles.text}>{ground.groundType}</Text>

        <Text style={styles.label}>Facilities</Text>
        <Text style={styles.text}>{ground.facilityAvailable}</Text>

        <Text style={styles.label}>Booking Frequency</Text>
        <Text style={styles.text}>{ground.bookingFrequency}</Text>

        <Text style={styles.label}>Accept Online Bookings</Text>
        <Text style={styles.text}>
          {ground.acceptOnlineBookings ? "Yes" : "No"}
        </Text>

        <Text style={styles.label}>Allow Tournament Bookings</Text>
        <Text style={styles.text}>
          {ground.allowTournamentsBookings ? "Yes" : "No"}
        </Text>

        <Text style={styles.label}>Receive Availability Notifications</Text>
        <Text style={styles.text}>
          {ground.receiveGroundAvailabilityNotifications ? "Yes" : "No"}
        </Text>

        <Text style={styles.label}>Owner Details</Text>
        <Text style={styles.text}>Name: {ground.owner.fullName}</Text>
        <Text style={styles.text}>Email: {ground.owner.email}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  image: { width: "100%", height: 200, borderRadius: 8, marginBottom: 10 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#15803d",
    marginBottom: 5,
  },
  subTitle: { fontSize: 16, color: "#4b5563", marginBottom: 10 },
  label: { fontSize: 16, fontWeight: "bold", color: "#15803d", marginTop: 10 },
  text: { fontSize: 14, color: "#4b5563", marginTop: 5 },
});

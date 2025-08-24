import FormDropdown from "@/components/FormDropdown";
import FormInput from "@/components/FormInput";
import FormSection from "@/components/FormSection";
import Header from "@/components/Header";
import ReusableButton from "@/components/button";
import React, { useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Dropdown options
const categoryOptions = ["Professional", "Amateur", "Youth", "Corporate"];
const formatOptions = ["T20", "ODI", "Test", "T10"];
const regTypeOptions = ["Team", "Individual", "Both"];
const genderOptions = ["Male", "Female", "Other"];

const CreateTournament = () => {
  const [formData, setFormData] = useState({
    tournamentName: "",
    shortDescription: "",
    category: null,
    format: "T20",
    startDate: "",
    endDate: "",
    regStartDate: "",
    regEndDate: "",
    city: "Patna",
    venue: "Patna",
    fullAddress: "",
    minTeams: "16",
    maxTeams: "16",
    regType: null,
    entryFee: "80",
    prizePool: "80",
    minAge: "16",
    maxAge: "30",
    gender: null,
    additionalReq: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
  });

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Validation function
  const validateForm = () => {
    const {
      tournamentName,
      shortDescription,
      category,
      format,
      startDate,
      endDate,
      regStartDate,
      regEndDate,
      city,
      venue,
      fullAddress,
      minTeams,
      maxTeams,
      regType,
      entryFee,
      prizePool,
      minAge,
      maxAge,
      gender,
      contactPerson,
      contactNumber,
      email,
    } = formData;

    if (!tournamentName) return "Tournament Name is required";
    if (!shortDescription) return "Short Description is required";
    if (!category) return "Category is required";
    if (!format) return "Format is required";
    if (!startDate) return "Start Date is required";
    if (!endDate) return "End Date is required";
    if (!regStartDate) return "Registration Start Date is required";
    if (!regEndDate) return "Registration End Date is required";
    if (!city) return "City is required";
    if (!venue) return "Venue is required";
    if (!fullAddress) return "Full Address is required";
    if (!minTeams || isNaN(Number(minTeams)))
      return "Min Teams must be a number";
    if (!maxTeams || isNaN(Number(maxTeams)))
      return "Max Teams must be a number";
    if (!regType) return "Registration Type is required";
    if (!entryFee || isNaN(Number(entryFee)))
      return "Entry Fee must be a number";
    if (!prizePool || isNaN(Number(prizePool)))
      return "Prize Pool must be a number";
    if (!minAge || isNaN(Number(minAge))) return "Min Age must be a number";
    if (!maxAge || isNaN(Number(maxAge))) return "Max Age must be a number";
    if (!gender) return "Gender is required";
    if (!contactPerson) return "Contact Person is required";
    if (!contactNumber || !/^\d{10}$/.test(contactNumber))
      return "Contact Number must be a valid 10-digit number";
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Email must be valid";

    return null; // ✅ Passed all validations
  };

  const handleSubmit = () => {
    const error = validateForm();
    if (error) {
      Alert.alert("Validation Error", error);
    } else {
      console.log("✅ Tournament Data:", formData);
      Alert.alert("Success", "Tournament Created Successfully!");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Header
        title="Create Tournament"
        showBackButton={true}
        onBackPress={() => console.log("Back Pressed")}
        rightComponent={
          <TouchableOpacity>
            <Text className="text-indigo-600 font-bold text-base">Tags</Text>
          </TouchableOpacity>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {/* ---- Basic Information ---- */}
        <FormSection title="Basic Information" />
        <FormInput
          label="Tournament Name*"
          placeholder="Enter tournament name"
          value={formData.tournamentName}
          onChangeText={(val) => handleInputChange("tournamentName", val)}
        />
        <FormInput
          label="Short Description*"
          placeholder="Enter short description"
          multiline
          value={formData.shortDescription}
          onChangeText={(val) => handleInputChange("shortDescription", val)}
        />
        <View className="flex-row justify-between">
          <View className="w-[48%]">
            <FormDropdown
              label="Category"
              placeholder="Select Category"
              options={categoryOptions}
              selectedValue={formData.category}
              onValueChange={(val) => handleInputChange("category", val)}
            />
          </View>
          <View className="w-[48%]">
            <FormDropdown
              label="Format"
              placeholder="Select Format"
              options={formatOptions}
              selectedValue={formData.format}
              onValueChange={(val) => handleInputChange("format", val)}
            />
          </View>
        </View>

        {/* ---- Contact Information ---- */}
        <FormSection title="Contact Information *" />
        <FormInput
          label="Contact Person Name*"
          placeholder="Enter name"
          value={formData.contactPerson}
          onChangeText={(val) => handleInputChange("contactPerson", val)}
        />
        <FormInput
          label="Contact Number*"
          placeholder="Enter contact number"
          value={formData.contactNumber}
          onChangeText={(val) => handleInputChange("contactNumber", val)}
          keyboardType="phone-pad"
        />
        <FormInput
          label="Email Address*"
          placeholder="Enter email address"
          value={formData.email}
          onChangeText={(val) => handleInputChange("email", val)}
          keyboardType="email-address"
        />

        {/* ✅ Button with validation */}
        <ReusableButton
          title="Create Tournament"
          onPress={handleSubmit}
          role="organizer"
          className="my-4"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTournament;

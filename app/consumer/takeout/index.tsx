import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import { MaterialIcons } from "@expo/vector-icons";

// Mock data for address suggestions (replace with real API)
const mockAddresses = [
  "123 Main St, San Francisco, CA",
  "456 Market St, San Francisco, CA",
  "789 Mission St, San Francisco, CA",
  "101 Broadway, New York, NY",
  "202 Central Park West, New York, NY",
];

// Cuisine options
const cuisineOptions = [
  "All Cuisines",
  "American",
  "Chinese",
  "Italian",
  "Mexican",
  "Japanese",
  "Indian",
  "Mediterranean",
  "Thai",
  "Vegetarian",
  "Vegan",
  "Organic",
];

export default function Index() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [radius, setRadius] = useState("");
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [radiusError, setRadiusError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter address suggestions based on input
  useEffect(() => {
    if (location.length > 2) {
      const filteredAddresses = mockAddresses.filter((address) =>
        address.toLowerCase().includes(location.toLowerCase())
      );
      setAddressSuggestions(filteredAddresses as never[]);
      setShowSuggestions(filteredAddresses.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [location]);

  const handleLocationSelect = (address: string) => {
    setLocation(address);
    setShowSuggestions(false);
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        alert("Permission to access location was denied");
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;

      // Reverse geocode to get address (in a real app)
      // For now, just display coordinates
      setLocation(`(${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
    } catch (error) {
      console.error("Error getting location:", error);
      alert(
        "Could not get your location. Please try again or enter it manually."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateForm = () => {
    let isValid = true;

    // Reset error messages
    setLocationError("");
    setRadiusError("");

    // Validate location (required)
    if (!location.trim()) {
      setLocationError("Location is required");
      isValid = false;
    }

    // Validate radius (required and must be integer)
    if (!radius.trim()) {
      setRadiusError("Search radius is required");
      isValid = false;
    } else if (!Number.isInteger(Number(radius)) || Number(radius) <= 0) {
      setRadiusError("Radius must be a positive integer");
      isValid = false;
    }

    return isValid;
  };

  const handleSearchWithValidation = async () => {
    // Run validation
    if (!validateForm()) {
      return;
    }

    // Set loading state while fetching data
    setIsLoading(true);

    try {
      // Create search params
      const searchParams = {
        location,
        maxDistance: parseFloat(radius),
        cuisine,
      };

      // Call your API endpoint with the search parameters
      const response = await fetch("http://127.0.0.1:8000/rest-recs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

    //  const res = await fetch("http://127.0.0.1:8000/rest-recs", {
    //    method: "POST",
    //    headers: { "Content-Type": "application/json" },
    //    body: JSON.stringify(searchParams),
    //  });
      
    //  const payload = await res.json();
    //  if (!res.ok) {
    //    console.error("❌ Validation errors from server:", payload);
    //    alert("Server rejected request: " + JSON.stringify(payload.detail || payload));
    //    return;
    //  }
      

      const data = await response.json();
      console.log(data);

      // Navigate to results page with the fetched data
      router.push({
        pathname: "/consumer/takeout/results",
        params: {
          resultsData: JSON.stringify(data),
        },
      });
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Failed to fetch results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.formTitle}>Find Healthy Takeouts Near You</Text>

          <View style={styles.formContainer}>
            {/* Location Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <View style={styles.locationInputContainer}>
                <TextInput
                  style={[
                    styles.locationInput,
                    locationError ? styles.inputError : null,
                  ]}
                  placeholder="Enter your location"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={(text) => {
                    setLocation(text);
                    setLocationError("");
                  }}
                  onFocus={() =>
                    location.length > 2 && setShowSuggestions(true)
                  }
                />
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={handleGetCurrentLocation}
                  disabled={isLoadingLocation}
                >
                  {isLoadingLocation ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <MaterialIcons name="my-location" size={18} color="#fff" />
                  )}
                </TouchableOpacity>
              </View>
              {locationError ? (
                <Text style={styles.errorText}>{locationError}</Text>
              ) : null}

              {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                  <FlatList
                    data={addressSuggestions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.suggestionItem}
                        onPress={() => handleLocationSelect(item)}
                      >
                        <Text style={styles.suggestionText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    style={styles.suggestionsList}
                  />
                </View>
              )}
            </View>

            {/* Radius Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search Radius (miles)</Text>
              <TextInput
                style={[
                  styles.textInput,
                  radiusError ? styles.inputError : null,
                ]}
                placeholder="5"
                placeholderTextColor="#999"
                value={radius}
                onChangeText={(text) => {
                  if (text === "" || /^\d+$/.test(text)) {
                    setRadius(text);
                    setRadiusError("");
                  }
                }}
                keyboardType="numeric"
              />
              {radiusError ? (
                <Text style={styles.errorText}>{radiusError}</Text>
              ) : null}
            </View>

            {/* Cuisine Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cuisine</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={cuisine}
                  onValueChange={(itemValue) => setCuisine(itemValue)}
                  style={styles.picker}
                  mode="dropdown"
                >
                  {cuisineOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={[styles.searchButton, isLoading && styles.disabledButton]}
              onPress={handleSearchWithValidation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.searchButtonText}>
                  Find Healthy Options
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  locationButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 12,
    marginLeft: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 80,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  suggestionsList: {
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    overflow: "visible",
    alignItems: "center",
    justifyContent: "center",
  },
  picker: {
    height: Platform.select({ ios: 200, android: 50 }),
    width: "100%",
    backgroundColor: "#fff",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
    opacity: 0.7,
  },
});

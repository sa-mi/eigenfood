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
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [caloriesError, setCaloriesError] = useState("");
  const [errors, setErrors] = useState({
    location: "",
    radius: "",
    price: "",
    calories: "",
    cuisine: "",
  });

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
    const newErrors = {
      location: "",
      radius: "",
      price: "",
      calories: "",
      cuisine: "",
    };

    // Location validation
    if (!location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    // Radius validation
    if (!radius) {
      newErrors.radius = "Search radius is required";
      isValid = false;
    } else if (!Number.isInteger(Number(radius)) || Number(radius) <= 0) {
      newErrors.radius = "Radius must be a positive integer";
      isValid = false;
    }

    // Price range validation
    if ((!minPrice && maxPrice) || (minPrice && !maxPrice)) {
      newErrors.price = "Both minimum and maximum prices are required";
      isValid = false;
    } else if (minPrice && maxPrice) {
      if (
        !Number.isInteger(Number(minPrice)) ||
        !Number.isInteger(Number(maxPrice))
      ) {
        newErrors.price = "Prices must be integers";
        isValid = false;
      } else if (Number(minPrice) >= Number(maxPrice)) {
        newErrors.price = "Maximum price must be greater than minimum price";
        isValid = false;
      }
    }

    // Calories range validation
    if ((!minCalories && maxCalories) || (minCalories && !maxCalories)) {
      newErrors.calories = "Both minimum and maximum calories are required";
      isValid = false;
    } else if (minCalories && maxCalories) {
      if (
        !Number.isInteger(Number(minCalories)) ||
        !Number.isInteger(Number(maxCalories))
      ) {
        newErrors.calories = "Calories must be integers";
        isValid = false;
      } else if (Number(minCalories) >= Number(maxCalories)) {
        newErrors.calories =
          "Maximum calories must be greater than minimum calories";
        isValid = false;
      }
    }

    // Cuisine validation
    if (!cuisine || cuisine === "All Cuisines") {
      newErrors.cuisine = "Please select a cuisine";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSearch = () => {
    if (!validateForm()) {
      return;
    }

    // Create search params
    const searchParams = {
      location,
      radius: parseInt(radius),
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      minCalories: minCalories ? parseInt(minCalories) : undefined,
      maxCalories: maxCalories ? parseInt(maxCalories) : undefined,
      cuisine,
    };

    console.log("Searching with params:", searchParams);

    // Navigate to results page with params
    router.push({
      pathname: "/consumer",
      params: searchParams,
    });
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
                  style={styles.locationInput}
                  placeholder="Enter your location"
                  placeholderTextColor="#999"
                  value={location}
                  onChangeText={setLocation}
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

              {errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
            </View>

            {/* Radius Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Search Radius (miles)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="5"
                placeholderTextColor="#999"
                value={radius}
                onChangeText={(text) => {
                  setRadius(text);
                  setErrors({ ...errors, radius: "" });
                }}
                keyboardType="numeric"
              />

              {errors.radius && (
                <Text style={styles.errorText}>{errors.radius}</Text>
              )}
            </View>

            {/* Price Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price Range ($)</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.price ? styles.inputError : null,
                  ]}
                  placeholder="Min"
                  placeholderTextColor="#999"
                  value={minPrice}
                  onChangeText={(text) => {
                    if (text === "" || /^\d+$/.test(text)) {
                      setMinPrice(text);
                      setErrors({ ...errors, price: "" });
                    }
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.price ? styles.inputError : null,
                  ]}
                  placeholder="Max"
                  placeholderTextColor="#999"
                  value={maxPrice}
                  onChangeText={(text) => {
                    if (text === "" || /^\d+$/.test(text)) {
                      setMaxPrice(text);
                      setErrors({ ...errors, price: "" });
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors.price && (
                <Text style={styles.errorText}>{errors.price}</Text>
              )}
            </View>

            {/* Calories Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories Range</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.calories ? styles.inputError : null,
                  ]}
                  placeholder="Min"
                  placeholderTextColor="#999"
                  value={minCalories}
                  onChangeText={(text) => {
                    if (text === "" || /^\d+$/.test(text)) {
                      setMinCalories(text);
                      setErrors({ ...errors, calories: "" });
                    }
                  }}
                  keyboardType="numeric"
                />
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={[
                    styles.priceInput,
                    errors.calories ? styles.inputError : null,
                  ]}
                  placeholder="Max"
                  placeholderTextColor="#999"
                  value={maxCalories}
                  onChangeText={(text) => {
                    if (text === "" || /^\d+$/.test(text)) {
                      setMaxCalories(text);
                      setErrors({ ...errors, calories: "" });
                    }
                  }}
                  keyboardType="numeric"
                />
              </View>
              {errors.calories && (
                <Text style={styles.errorText}>{errors.calories}</Text>
              )}
            </View>

            {/* Cuisine Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Cuisine</Text>
              <View
                style={[
                  styles.pickerContainer,
                  errors.cuisine ? styles.inputError : null,
                ]}
              >
                <Picker
                  selectedValue={cuisine}
                  onValueChange={(itemValue) => {
                    setCuisine(itemValue);
                    setErrors({ ...errors, cuisine: "" });
                  }}
                  style={styles.picker}
                  mode="dropdown"
                >
                  {cuisineOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
              {errors.cuisine && (
                <Text style={styles.errorText}>{errors.cuisine}</Text>
              )}
            </View>

            {/* Search Button */}
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>Find Healthy Options</Text>
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
  },
  priceRangeSeparator: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlignVertical: "center",
    includeFontPadding: false,
    textAlign: "center",
    lineHeight: 24,
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
});

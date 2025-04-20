import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function StoreDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, name } = params;

  // Price range state
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPriceError, setMinPriceError] = useState("");
  const [maxPriceError, setMaxPriceError] = useState("");
  const [priceError, setPriceError] = useState("");

  // Calories range state
  const [minCalories, setMinCalories] = useState("");
  const [maxCalories, setMaxCalories] = useState("");
  const [minCaloriesError, setMinCaloriesError] = useState("");
  const [maxCaloriesError, setMaxCaloriesError] = useState("");
  const [caloriesError, setCaloriesError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    let isValid = true;

    // Reset all error messages
    setMinPriceError("");
    setMaxPriceError("");
    setPriceError("");
    setMinCaloriesError("");
    setMaxCaloriesError("");
    setCaloriesError("");

    // Validate price range (required and must be integers)
    if (!minPrice.trim()) {
      setMinPriceError("Minimum price is required");
      isValid = false;
    } else if (!Number.isInteger(Number(minPrice)) || Number(minPrice) < 0) {
      setMinPriceError("Must be a non-negative integer");
      isValid = false;
    }

    if (!maxPrice.trim()) {
      setMaxPriceError("Maximum price is required");
      isValid = false;
    } else if (!Number.isInteger(Number(maxPrice)) || Number(maxPrice) <= 0) {
      setMaxPriceError("Must be a positive integer");
      isValid = false;
    }

    // Validate min price is less than max price
    if (minPrice && maxPrice && Number(minPrice) >= Number(maxPrice)) {
      setPriceError("Maximum price must be greater than minimum price");
      isValid = false;
    }

    // Validate calories range (required and must be integers)
    if (!minCalories.trim()) {
      setMinCaloriesError("Minimum calories is required");
      isValid = false;
    } else if (
      !Number.isInteger(Number(minCalories)) ||
      Number(minCalories) < 0
    ) {
      setMinCaloriesError("Must be a non-negative integer");
      isValid = false;
    }

    if (!maxCalories.trim()) {
      setMaxCaloriesError("Maximum calories is required");
      isValid = false;
    } else if (
      !Number.isInteger(Number(maxCalories)) ||
      Number(maxCalories) <= 0
    ) {
      setMaxCaloriesError("Must be a positive integer");
      isValid = false;
    }

    // Validate min calories is less than max calories
    if (
      minCalories &&
      maxCalories &&
      Number(minCalories) >= Number(maxCalories)
    ) {
      setCaloriesError(
        "Maximum calories must be greater than minimum calories"
      );
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        "Search Complete",
        `We've found healthy options at ${name} within your criteria!`,
        [
          {
            text: "View Results",
            onPress: () => router.push("/consumer"),
          },
        ]
      );
    }, 1500);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ImageBackground
          source={require("../../../../../assets/images/diet.png")}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <MaterialIcons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.storeName}>{name}</Text>
          </View>
        </ImageBackground>

        <View style={styles.contentContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Find Healthy Options</Text>

            {/* Price Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price Range ($)</Text>
              <View style={styles.rangeContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="attach-money"
                    size={18}
                    color="#2E7D32"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.rangeInput,
                      minPriceError || priceError ? styles.inputError : null,
                    ]}
                    placeholder="Min"
                    placeholderTextColor="#999"
                    value={minPrice}
                    onChangeText={(text) => {
                      // Only allow numbers
                      if (text === "" || /^\d+$/.test(text)) {
                        setMinPrice(text);
                        setMinPriceError("");
                        setPriceError("");
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.rangeSeparator}>to</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="attach-money"
                    size={18}
                    color="#2E7D32"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.rangeInput,
                      maxPriceError || priceError ? styles.inputError : null,
                    ]}
                    placeholder="Max"
                    placeholderTextColor="#999"
                    value={maxPrice}
                    onChangeText={(text) => {
                      // Only allow numbers
                      if (text === "" || /^\d+$/.test(text)) {
                        setMaxPrice(text);
                        setMaxPriceError("");
                        setPriceError("");
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {minPriceError ? (
                <Text style={styles.errorText}>{minPriceError}</Text>
              ) : maxPriceError ? (
                <Text style={styles.errorText}>{maxPriceError}</Text>
              ) : priceError ? (
                <Text style={styles.errorText}>{priceError}</Text>
              ) : null}
            </View>

            {/* Calories Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Calories Range</Text>
              <View style={styles.rangeContainer}>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={18}
                    color="#2E7D32"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.rangeInput,
                      minCaloriesError || caloriesError
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Min"
                    placeholderTextColor="#999"
                    value={minCalories}
                    onChangeText={(text) => {
                      // Only allow numbers
                      if (text === "" || /^\d+$/.test(text)) {
                        setMinCalories(text);
                        setMinCaloriesError("");
                        setCaloriesError("");
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.rangeSeparator}>to</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons
                    name="local-fire-department"
                    size={18}
                    color="#2E7D32"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[
                      styles.rangeInput,
                      maxCaloriesError || caloriesError
                        ? styles.inputError
                        : null,
                    ]}
                    placeholder="Max"
                    placeholderTextColor="#999"
                    value={maxCalories}
                    onChangeText={(text) => {
                      // Only allow numbers
                      if (text === "" || /^\d+$/.test(text)) {
                        setMaxCalories(text);
                        setMaxCaloriesError("");
                        setCaloriesError("");
                      }
                    }}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              {minCaloriesError ? (
                <Text style={styles.errorText}>{minCaloriesError}</Text>
              ) : maxCaloriesError ? (
                <Text style={styles.errorText}>{maxCaloriesError}</Text>
              ) : caloriesError ? (
                <Text style={styles.errorText}>{caloriesError}</Text>
              ) : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                isSubmitting ? styles.disabledButton : null,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons
                    name="search"
                    size={20}
                    color="#FFFFFF"
                    style={styles.buttonIcon}
                  />
                  <Text style={styles.submitButtonText}>
                    Find Healthy Recipes
                  </Text>
                </>
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
    backgroundColor: "#F5F7FA",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerImage: {
    height: 180,
    width: "100%",
  },
  headerOverlay: {
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "space-between",
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  storeName: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
    textTransform: "capitalize",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    marginTop: -30,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 12,
  },
  rangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  rangeInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  rangeSeparator: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonIcon: {
    marginRight: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#A5D6A7",
    opacity: 0.7,
  },
});

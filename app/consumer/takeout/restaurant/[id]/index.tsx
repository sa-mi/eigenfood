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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function RestaurantDetailScreen() {
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
        "Order Placed",
        `Your order at ${name} has been submitted successfully!`,
        [
          {
            text: "OK",
            onPress: () => router.push("/consumer"),
          },
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.formTitle}>Order from {name}</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Price Range */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Price Range ($)</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  style={[
                    styles.priceInput,
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
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={[
                    styles.priceInput,
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
              <View style={styles.priceContainer}>
                <TextInput
                  style={[
                    styles.priceInput,
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
                <Text style={styles.priceRangeSeparator}>-</Text>
                <TextInput
                  style={[
                    styles.priceInput,
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
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Place Order</Text>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
  },
  placeholderView: {
    width: 32,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
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
  submitButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
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

import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  TextInput,
  Platform,
  Modal,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import RestaurantList from "../../components/RestaurantList";
import GroceryList from "../../components/GroceryList";

const { width, height } = Dimensions.get("screen");

// Mock data for address suggestions
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
  const [viewType, setViewType] = useState("restaurants"); // "restaurants" or "groceries"
  const [location, setLocation] = useState("");
  const [maxCalories, setMaxCalories] = useState(1000);
  const [modalVisible, setModalVisible] = useState(false);
  const [cuisine, setCuisine] = useState("All Cuisines");
  const [radius, setRadius] = useState(5); // Miles
  const [priceRange, setPriceRange] = useState([0, 100]); // Min and max price

  const toggleViewType = (type) => {
    setViewType(type);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewType === "restaurants" ? styles.toggleActive : {},
            ]}
            onPress={() => toggleViewType("restaurants")}
          >
            <Text
              style={[
                styles.toggleText,
                viewType === "restaurants" ? styles.toggleTextActive : {},
              ]}
            >
              Restaurants
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewType === "groceries" ? styles.toggleActive : {},
            ]}
            onPress={() => toggleViewType("groceries")}
          >
            <Text
              style={[
                styles.toggleText,
                viewType === "groceries" ? styles.toggleTextActive : {},
              ]}
            >
              Groceries
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialIcons name="tune" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {viewType === "restaurants" ? (
          <RestaurantList
            location={location}
            filters={{
              radius,
              cuisine,
              priceRange,
              calories: { min: 200, max: maxCalories },
            }}
          />
        ) : (
          <GroceryList
            location={location}
            filters={{
              radius,
              cuisine,
              priceRange,
              calories: { min: 200, max: maxCalories },
            }}
          />
        )}
      </View>

      {/* Filters Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Options</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Distance Slider */}
              <Text style={styles.filterLabel}>Distance (miles)</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={20}
                  step={1}
                  value={radius}
                  onValueChange={(value) => setRadius(value)}
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#4CAF50"
                />
                <Text style={styles.sliderValue}>{radius} miles</Text>
              </View>

              {/* Cuisine Picker */}
              <Text style={styles.filterLabel}>Cuisine</Text>
              <View style={[styles.pickerContainer, Platform.OS === 'ios' ? styles.iosPicker : {}]}>
                <Picker
                  selectedValue={cuisine}
                  style={styles.picker}
                  onValueChange={(itemValue) => setCuisine(itemValue)}
                  itemStyle={styles.pickerItem}
                  mode="dropdown"
                >
                  {cuisineOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>

              {/* Price Range Slider */}
              <Text style={styles.filterLabel}>Price Range</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={priceRange[1]}
                  onValueChange={(value) =>
                    setPriceRange([0, value])
                  }
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#4CAF50"
                />
                <Text style={styles.sliderValue}>
                  Up to ${priceRange[1]}
                </Text>
              </View>

              {/* Calories Slider */}
              <Text style={styles.filterLabel}>Max Calories</Text>
              <View style={styles.sliderContainer}>
                <Slider
                  style={styles.slider}
                  minimumValue={500}
                  maximumValue={2000}
                  step={50}
                  value={maxCalories}
                  onValueChange={(value) => setMaxCalories(value)}
                  minimumTrackTintColor="#4CAF50"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#4CAF50"
                />
                <Text style={styles.sliderValue}>{maxCalories} calories</Text>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    zIndex: 1,
  },
  toggleContainer: {
    flexDirection: "row",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4CAF50",
    overflow: "hidden",
  },
  toggleButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  toggleActive: {
    backgroundColor: "#4CAF50",
  },
  toggleText: {
    fontSize: 14,
    color: "#4CAF50",
  },
  toggleTextActive: {
    color: "#fff",
  },
  filterButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: height * 0.8,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  closeButton: {
    padding: 5,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 16,
    marginBottom: 8,
    color: "#333",
  },
  sliderContainer: {
    marginBottom: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderValue: {
    textAlign: "center",
    color: "#4CAF50",
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  iosPicker: {
    height: 150,
  },
  picker: {
    width: "100%",
    ...(Platform.OS === 'android' ? { height: 50 } : {}),
  },
  pickerItem: {
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 16,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

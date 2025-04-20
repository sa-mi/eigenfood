import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface GroceryListProps {
  location: string;
  filters: {
    radius: number;
    cuisine: string;
    priceRange: number[];
    calories: { min: number; max: number };
  };
  onSearch?: () => void;
}

export default function GroceryList({
  location,
  filters,
  onSearch,
}: GroceryListProps) {
  const [groceryItems, setGroceryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialLoadComplete = useRef(false);

  // Load data once on initial component mount
  useEffect(() => {
    if (!initialLoadComplete.current) {
      fetchGroceryItems();
      initialLoadComplete.current = true;
    }
  }, []);

  const fetchGroceryItems = async () => {
    setIsLoading(true);
    try {
      // Implementation for fetching grocery items would go here
      // For now, we'll just simulate loading then use sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data for development
      setGroceryItems([
        {
          id: 'store-1',
          name: 'Whole Foods Market',
          distance: '1.2 mi',
          healthyItems: [
            { name: 'Organic Quinoa', price: 5.99, calories: 120 },
            { name: 'Fresh Avocados', price: 2.49, calories: 240 },
          ]
        },
        {
          id: 'store-2',
          name: 'Trader Joe\'s',
          distance: '2.3 mi',
          healthyItems: [
            { name: 'Greek Yogurt', price: 3.99, calories: 100 },
            { name: 'Mixed Nuts', price: 6.99, calories: 170 },
          ]
        }
      ]);
      
      setError(null);
    } catch (err) {
      console.error("Error fetching grocery data:", err);
      setError("Failed to load grocery data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderGroceryItem = ({ item }) => (
    <View style={styles.groceryItem}>
      <Text style={styles.storeName}>{item.name}</Text>
      <Text style={styles.storeDistance}>{item.distance} away</Text>
      
      {item.healthyItems.map((product, index) => (
        <View key={index} style={styles.productItem}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>
          <Text style={styles.productCalories}>{product.calories} cal</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.listTitle}>
        Healthy Grocery Options {location ? `near ${location}` : ""}
      </Text>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding healthy options...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color="#FF5252" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : groceryItems.length > 0 ? (
        <FlatList
          data={groceryItems}
          keyExtractor={(item) => item.id}
          renderItem={renderGroceryItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="shopping-cart" size={48} color="#CCCCCC" />
          <Text style={styles.emptyText}>No grocery stores found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    margin: 16,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#999",
  },
  groceryItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  storeDistance: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  productItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  productName: {
    flex: 2,
    fontSize: 16,
    color: "#333",
  },
  productPrice: {
    flex: 1,
    fontSize: 16,
    color: "#2E7D32",
    textAlign: "right",
  },
  productCalories: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
}); 
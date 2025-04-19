import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

export default function ConsumerOptions() {
  const router = useRouter();

  const handleOptionSelection = (option: "grocery" | "takeout") => {
    console.log(`Selected option: ${option}`);
    router.push(`/consumer/${option}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.appTitle}>EigenFood</Text>
            <Image
              source={require("../../assets/images/diet1.png")}
              style={styles.headerImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Find your healthy options</Text>

          <View style={styles.selectionContainer}>
            <Text style={styles.promptText}>I want to find...</Text>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionSelection("grocery")}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.optionText}>Grocery</Text>
                <Image
                  source={require("../../assets/images/diet1.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionSelection("takeout")}
            >
              <View style={styles.headerContainer}>
                <Text style={styles.optionText}>Takeout</Text>
                <Image
                  source={require("../../assets/images/diet1.png")}
                  style={styles.headerImage}
                  resizeMode="contain"
                />
              </View>
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
    alignItems: "center",
    padding: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#558B2F",
    marginBottom: 30,
  },
  selectionContainer: {
    width: "100%",
    alignItems: "center",
    marginVertical: 20,
  },
  promptText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 30,
  },
  optionButton: {
    width: "80%",
    backgroundColor: "#4CAF50",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    marginTop: 20,
  },
  headerImage: {
    width: 40,
    height: 40,
    marginLeft: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#2E7D32",
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    overflow: "hidden",
  },
});

import React from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

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
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#43A047", "#2E7D32"]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>Grocery</Text>
                  <Image
                    source={require("../../assets/images/diet.png")}
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => handleOptionSelection("takeout")}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#43A047", "#2E7D32"]}
                start={[0, 0]}
                end={[1, 1]}
                style={styles.optionGradient}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>Takeout</Text>
                  <Image
                    source={require("../../assets/images/diet.png")}
                    style={styles.optionImage}
                    resizeMode="contain"
                  />
                </View>
              </LinearGradient>
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
    padding: 24,
    alignItems: "center",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2E7D32",
    marginRight: 10,
  },
  headerImage: {
    width: 50,
    height: 50,
  },
  subtitle: {
    fontSize: 18,
    color: "#555",
    marginBottom: 40,
    textAlign: "center",
  },
  selectionContainer: {
    width: "100%",
    alignItems: "center",
  },
  promptText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
  },
  optionButton: {
    width: width * 0.85,
    height: 110,
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  optionGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "85%",
  },
  optionText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  optionImage: {
    width: 50,
    height: 50,
    tintColor: "#FFFFFF",
  },
});

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
}

export default function Header({
  showBackButton = false,
  title = "EigenFood",
}: HeaderProps) {
  const router = useRouter();

  const handleLogin = () => {
    // Navigate to login screen (you'll need to create this route)
    console.log("Navigate to login");
    // router.push("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Image
            source={require("../assets/images/diet1.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#E8F5E9",
    borderBottomWidth: 1,
    borderBottomColor: "#C8E6C9",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 10,
  },
  backText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
  },
  logo: {
    width: 30,
    height: 30,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  loginText: {
    color: "white",
    fontWeight: "600",
  },
});

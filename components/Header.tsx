import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-h9et7zOfxk1KyhQo3mcvozVT1pYjXaE",
  authDomain: "food-desert-13dff.firebaseapp.com",
  projectId: "food-desert-13dff",
  storageBucket: "food-desert-13dff.firebasestorage.app", // Fixed storage bucket
  messagingSenderId: "87907718486",
  appId: "1:87907718486:web:82a24f8366ddd55ed672f7",
  measurementId: "G-7KGWSCQ34Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const { width } = Dimensions.get("screen");

interface HeaderProps {
  showBackButton?: boolean;
  title?: string;
  transparent?: boolean;
}

export default function Header({
  showBackButton = false,
  title = "EigenFood",
  transparent = false,
}: HeaderProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Clean up the listener
    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    if (user) {
      // If user is already logged in, show logout option
      try {
        await signOut(auth);
        Alert.alert("Success", "You have been logged out");
      } catch (error) {
        console.error("Logout error:", error);
        Alert.alert("Error", "Failed to log out");
      }
    } else {
      // Show login modal
      setLoginModalVisible(true);
    }
  };

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Clear form and close modal on success
      setEmail("");
      setPassword("");
      setLoginModalVisible(false);
      Alert.alert("Success", "You are now logged in");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Login Failed",
        error.message || "Please check your credentials"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = () => {
    // Close login modal if open
    setLoginModalVisible(false);
    // Show signup modal
    setSignupModalVisible(true);
  };

  const handleSignupSubmit = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill out all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Clear form and close modal on success
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSignupModalVisible(false);
      Alert.alert("Success", "Account created successfully");
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", error.message || "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.container,
          transparent ? styles.containerTransparent : styles.containerSolid,
        ]}
      >
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

        <TouchableOpacity
          style={[styles.loginButton, user ? styles.logoutButton : null]}
          onPress={handleLogin}
        >
          <Text style={styles.loginText}>{user ? "Logout" : "Login"}</Text>
        </TouchableOpacity>

        {/* Login Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={loginModalVisible}
          onRequestClose={() => setLoginModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Login</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setLoginModalVisible(false);
                    setEmail("");
                    setPassword("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleLoginSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={handleSignup}
              >
                <Text style={styles.switchModeText}>
                  Don't have an account? Sign up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Signup Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={signupModalVisible}
          onRequestClose={() => setSignupModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Account</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor="#aaa"
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setSignupModalVisible(false);
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSignupSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Sign Up</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.switchModeButton}
                onPress={() => {
                  setSignupModalVisible(false);
                  setLoginModalVisible(true);
                }}
              >
                <Text style={styles.switchModeText}>
                  Already have an account? Log in
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: Platform.OS === "ios" ? 44 : 20,
    borderBottomWidth: 1,
  },
  containerSolid: {
    backgroundColor: "#E8F5E9",
    borderBottomColor: "#C8E6C9",
  },
  containerTransparent: {
    backgroundColor: "transparent",
    borderBottomColor: "transparent",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: "#F44336",
  },
  loginText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 24,
    width: width * 0.85,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2E7D32",
    backgroundColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    color: "#2E7D32",
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  switchModeButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchModeText: {
    color: "#2E7D32",
    fontSize: 15,
    fontWeight: "500",
  },
});

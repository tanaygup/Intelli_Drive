import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { auth, db } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"driver" | "admin" | null>(null); // 👥 Role state

  const handleSignIn = async () => {
    if (!role)
      return Alert.alert("Select Role", "Please choose Admin or Driver");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.role !== role) {
          return Alert.alert(
            "Role Mismatch",
            `This account is not registered as a ${role}`
          );
        }
      }

      Alert.alert("Login successful!");
      if (role === "admin") {
        router.push("/(tabs)/dashboard");
      } else if (role === "driver") {
        router.push("./driverWelcome");
      }
    } catch (error: any) {
      Alert.alert("Login failed", error.message);
    }
  };

  const handleSignUp = async () => {
    if (!role)
      return Alert.alert("Select Role", "Please choose Admin or Driver");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        email,
        role,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Account created!");
      router.push("/(tabs)/dashboard");
    } catch (error: any) {
      Alert.alert("Signup failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.roleSelector}>
        <TouchableOpacity
          style={[styles.roleButton, role === "admin" && styles.selectedRole]}
          onPress={() => setRole("admin")}
        >
          <Text style={styles.buttonText}>Admin</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === "driver" && styles.selectedRole]}
          onPress={() => setRole("driver")}
        >
          <Text style={styles.buttonText}>Driver</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={handleSignUp}>
        <Text style={styles.linkText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  linkButton: {
    marginTop: 12,
    alignItems: "center",
  },
  linkText: {
    color: "#007AFF",
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 12,
  },
  roleButton: {
    padding: 12,
    backgroundColor: "#ddd",
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  selectedRole: {
    backgroundColor: "#007AFF",
  },
});

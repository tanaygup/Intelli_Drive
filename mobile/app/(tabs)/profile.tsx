import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const userInfo = userSnap.data();
            if (userInfo.role === "admin") {
              // Fetch drivers under this admin
              const q = query(collection(db, "drivers"), where("owner", "==", user.uid));
              const querySnapshot = await getDocs(q);
              const driverList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));
              setDrivers(driverList);
            }
            setUserData({ ...userInfo, id: user.uid });
          } else {
            // Check if user is a driver
            const driverDocRef = doc(db, "drivers", user.uid);
            const driverSnap = await getDoc(driverDocRef);
            if (driverSnap.exists()) {
              const driverInfo = driverSnap.data();
              setUserData({ ...driverInfo, id: user.uid });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.container}>
        <Text style={styles.name}>User not found or not signed in.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={{ uri: userData.photoURL }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{userData.username || "No Name"}</Text>
      <Text style={styles.email}>{userData.email || "No Email"}</Text>

      {userData.role === "admin" ? (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>Admin</Text>

          <Text style={styles.detailLabel}>Number of Drivers:</Text>
          <Text style={styles.detailValue}>{drivers.length}</Text>

          <Text style={styles.detailLabel}>Drivers List:</Text>
          {drivers.map((driver, index) => (
            <View key={index} style={styles.driverCard}>
              <Text style={styles.driverName}>{driver.name || "Driver"}</Text>
              
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailLabel}>Role:</Text>
          <Text style={styles.detailValue}>Driver</Text>

          <Text style={styles.detailLabel}>Rating:</Text>
          <Text style={styles.detailValue}>{userData.rating || "N/A"}</Text>

          <Text style={styles.detailLabel}>Number of Trips:</Text>
          <Text style={styles.detailValue}>{userData.trips || "0"}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f7f7f7",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
  },
  email: {
    fontSize: 16,
    color: "#888",
    marginBottom: 8,
  },
  detailsContainer: {
    width: "100%",
    marginTop: 10,
    paddingHorizontal: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#444",
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
  },
  driverCard: {
    backgroundColor: "#fff",
    padding: 10,
    marginTop: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  driverName: {
    fontWeight: "bold",
    fontSize: 14,
  },
  driverEmail: {
    fontSize: 12,
    color: "#666",
  },
});

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";
import { onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import axios from "axios";

export default function App() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [drowsinessResult, setDrowsinessResult] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDriverName, setNewDriverName] = useState("");
  const [newDriverRating, setNewDriverRating] = useState("");

  const cameraRef = useRef<any>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "drivers", id));
      Alert.alert("Deleted", "Driver deleted successfully.");
      fetchDrivers(); // Refresh the list
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  

  const handleInfo = (driver: any) => {
    router.push({
      pathname: "/driverInfo",
      params: {
        id: driver.id,
        name: driver.name,
        rating: driver.rating,
      },
    });
  };

  const fetchDrivers = async () => {
    const snapshot = await getDocs(collection(db, "drivers"));
    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDrivers(list);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsSignedIn(true);
        const userRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setIsAdmin(data.role === "admin");
        }
      } else {
        setIsSignedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!permission?.granted || isAdmin !== false) return;
  
    const interval = setInterval(() => {
      analyzeImage();
    }, 10000);
  
    return () => clearInterval(interval);
  }, [permission?.granted, isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchDrivers();
    }
  }, [isAdmin]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.text}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  async function analyzeImage() {
    if (!cameraRef.current) {
      console.log("Camera not ready");
      return;
    }
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (!photo.base64) {
        console.log("No image captured");
        return;
      }

      const response = await fetch("http://192.168.29.186:9000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: photo.base64 }),
      });

      const result = await response.json();
      const analysis = result.prediction?.toLowerCase().trim();
      setDrowsinessResult(analysis);
      if (analysis === "sleepy") {
        await axios.post("http://192.168.29.186:3000/trigger", {
          command: "TRIGGER",
        });
        console.log("Sleepy detected → Alarm triggered");
      } else if (analysis === "alert") {
        await axios.post("http://192.168.29.186:3000/trigger", {
          command: "START",
        });
        console.log("Alert detected → Vehicle started");
      } else {
        console.warn("Unexpected response:", analysis);
      }
    } catch (error: any) {
      console.error("analyzeImage error:", error);
      Alert.alert("Error", error.message);
    }
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const handleAddDriver = async () => {
    if (!newDriverName || !newDriverRating) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
  
    const currentUser = auth.currentUser;
    if (!currentUser) {
      Alert.alert("Error", "No user logged in.");
      return;
    }
  
    try {
      await addDoc(collection(db, "drivers"), {
        name: newDriverName,
        rating: newDriverRating,
        img: "",
        owner: currentUser.uid, // 👈 Store the UID of the user adding the driver
      });
      setModalVisible(false);
      setNewDriverName("");
      setNewDriverRating("");
      fetchDrivers(); // Refresh list
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };
  

  const renderDriver = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.driverName}>{item.name}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      <View style={styles.cardBottom}>
       
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deletebutton}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleInfo(item)}>
          <Text style={styles.infobutton}>Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Please sign in to continue</Text>
      </View>
    );
  }

  if (isAdmin === true) {
    return (
      <View style={styles.container}>
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id}
          renderItem={renderDriver}
          contentContainerStyle={{ paddingBottom: 50, margin: 10 }}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+ Add Driver</Text>
        </TouchableOpacity>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.title}>Add New Driver</Text>
              <TextInput
                style={styles.input}
                placeholder="Driver Name"
                value={newDriverName}
                onChangeText={setNewDriverName}
              />
              <TextInput
                style={styles.input}
                placeholder="Rating"
                value={newDriverRating}
                onChangeText={setNewDriverRating}
                keyboardType="numeric"
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddDriver}
              >
                <Text style={styles.addButtonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={{ textAlign: "center", color: "red" }}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>detecting alcohol</Text>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
                <Text style={styles.text}>Flip Camera</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
          {drowsinessResult && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Drowsiness prediction: {drowsinessResult}
              </Text>
            </View>
          )}
    </View>
  );
  
}

const styles = StyleSheet.create({
  admincontainer: {
    padding: 20,
    margin: 10,
    paddingTop: 40,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 20,
    fontFamily: "Cochin",
  },
  card: {
    borderWidth: 2,
    borderRadius: 15,
    borderColor: "#000",
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#f9f9f9",
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  driverName: {
    fontSize: 18,
    fontWeight: "600",
  },
  rating: {
    fontSize: 16,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 20,
  },
  editbutton: {
    backgroundColor: "#FFA500",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  deletebutton: {
    backgroundColor: "#FF0000",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  infobutton: {
    backgroundColor: "#008000",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#00000080",
    padding: 10,
    marginVertical: 5,
    borderRadius: 5,
  },
  text: {
    fontSize: 18,
    color: "white",
  },
  resultContainer: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#00000080",
    alignItems: "center",
  },
  resultText: {
    fontSize: 20,
    color: "white",
  },
  addButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  
});
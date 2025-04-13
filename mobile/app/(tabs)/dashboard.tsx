
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  FlatList,
  View,
  Alert,
} from "react-native";
import {
  CameraView,
  CameraType,
  useCameraPermissions,
} from "expo-camera";

import axios from "axios";

export default function App() {
  const router = useRouter();
  const [facing, setFacing] = useState<CameraType>("back");
  const [isAdmin,setIsAdmin]= useState<boolean>(true);
  const [permission, requestPermission] = useCameraPermissions();
  const [drowsinessResult, setDrowsinessResult] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const driver=[
    {
      id:1,
      img:"",
      name:"chirag singhal",
      rating:"5"
    },
    {
      id:2,
      img:"",
      name:"tanay gupta",
      rating:"3"
    },
    {
      id:3,
      img:"",
      name:"vedant mahajan",
      rating:"4"
    }
  ]
  const handleEdit = (id: number) => {
    console.log(`Edit driver ${id}`);
  };

  const handleDelete = (id: number) => {
    console.log(`Delete driver ${id}`);
  };

  const handleInfo = (driver: any) => {
    router.push({
      pathname: "/driverInfo",
      params: {
        id: driver.id.toString(),
        name: driver.name,
        rating: driver.rating,
      },
    })
  };

  useEffect(() => {
    if (!permission?.granted || isAdmin) return;
    const interval = setInterval(() => {
      analyzeImage();
    }, 10000000);
    return () => clearInterval(interval);
  }, [permission?.granted]);

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
      // Capture a photo with base64 encoding
      const photo = await cameraRef.current.takePictureAsync({ base64: true });
      if (!photo.base64) {
        console.log("No image captured");
        return;
      }

      // Send the image to your hosted model endpoint
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

  const renderDriver = ({ item }: any) => (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.driverName}>{item.name}</Text>
        <Text style={styles.rating}>⭐ {item.rating}</Text>
      </View>
      <View style={styles.cardBottom}>
        <TouchableOpacity onPress={() => handleEdit(item.id)}>
          <Text style={styles.editbutton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDelete(item.id)}>
          <Text style={styles.deletebutton}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleInfo(item.id)}>
          <Text style={styles.infobutton} onPress={()=>handleInfo(item)}>Info</Text>
        </TouchableOpacity>
      </View>
    </View>
  );


  if(isAdmin){
    return(
      <View style={styles.container}>
      <FlatList
        data={driver}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDriver}
        contentContainerStyle={{ paddingBottom: 50,margin:10 }}
      />
    </View>

    );
  }


  return (
    <View style={styles.container}>
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
  admincontainer:{
    padding: 20,
    margin:10,
    paddingTop: 40,
    backgroundColor: "#fff",
    flex: 1,
  },
  title:{
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
});

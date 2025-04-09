import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [drowsinessResult, setDrowsinessResult] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) return;
    const interval = setInterval(() => {
      analyzeImage();
    }, 10000);
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
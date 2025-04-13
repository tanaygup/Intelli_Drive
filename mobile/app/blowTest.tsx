import { View, Text, StyleSheet } from "react-native";

export default function BlowTest() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alcohol Detection Model Running...</Text>
      {/* 🔽 Integrate your camera + Flask model API here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    textAlign: "center",
  },
});

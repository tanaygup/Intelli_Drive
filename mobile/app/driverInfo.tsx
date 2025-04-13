import { useLocalSearchParams } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function DriverInfo() {
  const { id, name, rating } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Driver Info</Text>
      <Text style={styles.text}>ID: {id}</Text>
      <Text style={styles.text}>Name: {name}</Text>
      <Text style={styles.text}>Rating: {rating}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  text: { fontSize: 18, marginBottom: 10 },
});

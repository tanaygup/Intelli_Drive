import { View, Text, Image, StyleSheet } from "react-native";

export default function ProfilePage() {
  return (
    <View style={styles.container}>
      <Image
        source={{ uri: "https://randomuser.me/api/portraits/men/75.jpg" }}
        style={styles.avatar}
      />
      <Text style={styles.name}>Chirag Mehta</Text>
      <Text style={styles.email}>chirag.mehta@example.com</Text>
      <Text style={styles.bio}>
        Full-stack developer | Tech enthusiast | Coffee lover ☕
      </Text>

      <View style={styles.detailsContainer}>
        <Text style={styles.detailLabel}>Location:</Text>
        <Text style={styles.detailValue}>Mumbai, India</Text>

        <Text style={styles.detailLabel}>Joined:</Text>
        <Text style={styles.detailValue}>April 2023</Text>

        <Text style={styles.detailLabel}>Followers:</Text>
        <Text style={styles.detailValue}>1.2k</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  bio: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
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
});

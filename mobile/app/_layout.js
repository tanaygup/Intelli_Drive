import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { Platform } from "react-native";

export default function RootLayout() {



  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
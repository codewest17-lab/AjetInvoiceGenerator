import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import colors from "../constants/colors";

import HomeScreen from "../screens/HomeScreen";
import InvoiceEditorScreen from "../screens/InvoiceEditorScreen";
import TemplateSelectScreen from "../screens/TemplateSelectScreen";
import PreviewScreen from "../screens/PreviewScreen";
import PremiumScreen from "../screens/PremiumScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTitleStyle: { color: colors.text, fontWeight: "700" },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "AjetInvoiceGenerator" }} />
        <Stack.Screen name="InvoiceEditor" component={InvoiceEditorScreen} options={{ title: "Edit Invoice" }} />
        <Stack.Screen name="TemplateSelect" component={TemplateSelectScreen} options={{ title: "Choose Template" }} />
        <Stack.Screen name="Preview" component={PreviewScreen} options={{ title: "Preview & Export" }} />
        <Stack.Screen name="Premium" component={PremiumScreen} options={{ title: "Go Premium" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

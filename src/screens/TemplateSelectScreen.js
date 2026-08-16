import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TEMPLATES } from "../templates/templateRegistry";
import { usePremium } from "../context/PremiumContext";
import AdBanner from "../components/AdBanner";
import colors from "../constants/colors";

export default function TemplateSelectScreen({ route, navigation }) {
  const { currentTemplateId, onSelect } = route.params;
  const { isPremium } = usePremium();

  const handlePick = (tpl) => {
    if (tpl.premium && !isPremium) {
      navigation.navigate("Premium");
      return;
    }
    onSelect(tpl.id);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={TEMPLATES}
        keyExtractor={(t) => t.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 16 }}
        ListHeaderComponent={
          !isPremium ? (
            <TouchableOpacity style={styles.upsell} onPress={() => navigation.navigate("Premium")}>
              <Ionicons name="star" size={16} color="#fff" />
              <Text style={styles.upsellText}>Unlock 3 more premium templates & remove ads</Text>
            </TouchableOpacity>
          ) : null
        }
        renderItem={({ item }) => {
          const locked = item.premium && !isPremium;
          const selected = item.id === currentTemplateId;
          return (
            <TouchableOpacity
              style={[styles.card, selected && { borderColor: colors.primary, borderWidth: 2 }]}
              onPress={() => handlePick(item)}
            >
              <View style={styles.preview}>
                <View style={[styles.previewBlock, { backgroundColor: item.swatch[0] }]} />
                <View style={[styles.previewBlock, { backgroundColor: item.swatch[1], flex: 2 }]} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.premium && <Ionicons name="star" size={13} color={colors.gold} />}
                </View>
                <Text style={styles.cardDesc}>{item.description}</Text>
                {locked && (
                  <View style={styles.lockBadge}>
                    <Ionicons name="lock-closed" size={11} color="#fff" />
                    <Text style={styles.lockBadgeText}>Premium</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <AdBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 16 },
  upsell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  upsellText: { color: "#fff", fontWeight: "700", fontSize: 12, flex: 1 },
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  preview: { height: 70, flexDirection: "row" },
  previewBlock: { flex: 1 },
  cardBody: { padding: 10 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardTitle: { fontWeight: "700", color: colors.text, fontSize: 14 },
  cardDesc: { fontSize: 11, color: colors.subtext, marginTop: 2 },
  lockBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.gold,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
  },
  lockBadgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});

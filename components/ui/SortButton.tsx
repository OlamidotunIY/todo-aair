import React, { useState } from "react";
import { Modal, StyleSheet, View, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { useTasks } from "@/store/useTask";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

const sortOptions: Array<"recent" | "oldest" | "dueDate"> = [
  "recent",
  "oldest",
  "dueDate",
];

export default function SortButton() {
  const { sort, setSort } = useTasks();
  const [visible, setVisible] = useState(false);

  const tint = useThemeColor({}, "tint");

  const handleSelect = (option: (typeof sortOptions)[number]) => {
    setSort(option);
    setVisible(false);
  };

  return (
    <ThemedView>
      {/* Icon Button */}
      <Pressable onPress={() => setVisible(true)} style={styles.iconButton}>
        <Feather name="sliders" size={24} color={tint} />
      </Pressable>

      {/* Sort Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <ThemedView style={styles.modalContent}>
          <ThemedText type="title" style={styles.modalTitle}>
            Sort by
          </ThemedText>
          {sortOptions.map((option) => (
            <ThemedButton
              key={option}
              title={option.charAt(0).toUpperCase() + option.slice(1)}
              variant={sort === option ? "filled" : "ghost"}
              onPress={() => handleSelect(option)}
              style={styles.option}
            />
          ))}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  option: {
    marginVertical: 6,
    width: "100%",
  },
});

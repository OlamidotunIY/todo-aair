import React from "react";
import { FlatList, SafeAreaView, StyleSheet, View, Alert } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedButton } from "@/components/ThemedButton";
import { useTasks } from "@/store/useTask";

export default function Trash() {
  const { trash, restoreFromTrash, emptyTrash } = useTasks();

  const confirmEmpty = () => {
    Alert.alert(
      "Empty Trash",
      "Are you sure you want to permanently delete all tasks in Trash?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Empty", style: "destructive", onPress: emptyTrash },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <ThemedText type="title">Trash</ThemedText>
          {trash.length > 0 && (
            <ThemedButton
              title="Empty Trash"
              variant="outlined"
              onPress={confirmEmpty}
              style={styles.emptyButton}
            />
          )}
        </View>

        {/* Trash List */}
        {trash.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText type="subtitle">Trash is empty 🗑️</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={trash}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ThemedView style={styles.taskRow}>
                <ThemedText
                  style={[
                    styles.taskTitle,
                    item.completed && styles.completedTask,
                  ]}
                >
                  {item.title}
                </ThemedText>
                <ThemedButton
                  title="Restore"
                  variant="ghost"
                  onPress={() => restoreFromTrash(item.id)}
                  style={styles.restoreButton}
                />
              </ThemedView>
            )}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  taskRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  taskTitle: {
    fontSize: 16,
    flex: 1,
  },
  completedTask: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  restoreButton: {
    marginLeft: 10,
  },
});

import { ScrollView, StyleSheet } from "react-native";
import { ThemedButton } from "@/components/ThemedButton";
import { useTasks } from "@/store/useTask";
import { ThemedView } from "@/components/ThemedView";

const filters: Array<"all" | "incomplete" | "completed"> = [
  "all",
  "incomplete",
  "completed",
];

export function FilterButtons() {
  const { filter, setFilter } = useTasks();

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {filters.map((item) => (
          <ThemedButton
            key={item}
            title={item.charAt(0).toUpperCase() + item.slice(1)}
            onPress={() => setFilter(item)}
            variant={filter === item ? "filled" : "ghost"}
          />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scroll: {
    alignItems: "center",
  },
});

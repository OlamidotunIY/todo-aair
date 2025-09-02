import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterButtons } from "@/components/ui/FilterButton";
import SortButton from "@/components/ui/SortButton";
import { TaskRow } from "@/components/ui/TaskRow";
import { Colors } from "@/constants/Colors";
import { useTasks } from "@/store/useTask";
import { useTheme } from "@/store/useTheme";
import { FontAwesome6, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  View,
  Dimensions,
  Pressable,
} from "react-native";

const width = Dimensions.get("screen").width;

export default function TaskListScreen() {
  const { theme } = useTheme();
  const { getVisibleTasks, toggleTask, setSearch, moveToTrash } = useTasks();

  const tasks = getVisibleTasks();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        {/* 🔍 Search Row */}
        <ThemedView style={styles.searchRow}>
          <ThemedTextInput
            placeholder="Search..."
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {/* 🗑️ Trash Button */}
          <Pressable
            style={[
              styles.trashButton,
              {
                backgroundColor:
                  theme === "light"
                    ? Colors.dark.background
                    : Colors.light.background,
              },
            ]}
            onPress={() => router.push("/trash")}
          >
            <FontAwesome6
              name="trash-alt"
              size={16}
              color={theme === "light" ? Colors.dark.icon : Colors.light.icon}
            />
          </Pressable>

          {/* 🌙 Theme Toggle */}
          <ThemeToggle />
        </ThemedView>

        {/* 🔽 Filters & Sort */}
        <ThemedView style={styles.filterSortRow}>
          <FilterButtons />
          <SortButton />
        </ThemedView>

        {/* ➕ Floating Create Button */}
        <ThemedView
          style={[
            styles.floatingBtn,
            {
              backgroundColor:
                theme === "light"
                  ? Colors.light.background
                  : Colors.dark.background,
            },
          ]}
        >
          <ThemedButton
            title="Create Task"
            onPress={() => router.push("/create-task")}
            style={styles.fullWidthBtn}
          />
        </ThemedView>

        {/* 📋 Task List */}
        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather
              name="clipboard"
              size={64}
              color={theme === "light" ? Colors.dark.icon : Colors.light.icon}
            />
            <ThemedText type="subtitle" style={styles.emptyText}>
              No tasks yet
            </ThemedText>
            <ThemedText style={styles.emptySubText}>
              Create your first task to get started 🚀
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={tasks}
            style={styles.taskList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TaskRow
                task={item}
                onToggle={() => toggleTask(item.id)}
                onDelete={() => moveToTrash(item.id)}
              />
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

  // 🔍 Search Row
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    padding: 8,
  },
  trashButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },

  // 🔽 Filters & Sort
  filterSortRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },

  // 📋 Task List
  taskList: {
    marginBottom: 100, // so FAB doesn't overlap tasks
  },

  // ➕ Floating Button
  floatingBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 10,
    width: width,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
  fullWidthBtn: {
    width: "100%",
  },

  // 📝 Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 100, // so it's not hidden under FAB
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptySubText: {
    opacity: 0.7,
    textAlign: "center",
  },
});

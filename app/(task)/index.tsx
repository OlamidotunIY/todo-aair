import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedView } from "@/components/ThemedView";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilterButtons } from "@/components/ui/FilterButton";
import SortButton from "@/components/ui/SortButton";
import { TaskRow } from "@/components/ui/TaskRow";
import { VoiceFAB } from "@/components/VoiceFAB";
import { Colors } from "@/constants/Colors";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useTasks } from "@/store/useTask";
import { useTheme } from "@/store/useTheme";
import { parseVoiceTasks } from "@/utils/parseTasks";
import { Feather, FontAwesome6 } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

const width = Dimensions.get("screen").width;

export default function TaskListScreen() {
  const { theme } = useTheme();
  const { getVisibleTasks, toggleTask, setSearch, moveToTrash, addTask } = useTasks();

  const tasks = getVisibleTasks();

  // Handle voice transcript
  const handleVoiceResult = async (transcript: string) => {
    console.log("🔄 Processing transcript:", transcript);

    // Parse transcript into multiple tasks
    const taskTitles = await parseVoiceTasks(transcript);

    if (taskTitles.length === 0) {
      throw new Error("Could not parse any tasks from speech");
    }

    // Add each task to the store
    taskTitles.forEach((title) => {
      addTask(title);
    });

    // Show confirmation
    const taskList = taskTitles.map((t, i) => `${i + 1}. ${t}`).join("\n");
    Alert.alert(
      "✅ Tasks Added",
      `Successfully added ${taskTitles.length} task(s):\n\n${taskList}`,
      [{ text: "OK" }]
    );

    console.log("✅ Added tasks:", taskTitles);
  };

  // Use speech recognition hook
  const { state: voiceState, toggle: toggleVoiceRecognition } = useSpeechRecognition({
    onResult: handleVoiceResult,
  });

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

        {/* 🎤 Voice Input FAB */}
        <View style={styles.voiceFAB}>
          <VoiceFAB onPress={toggleVoiceRecognition} state={voiceState} />
        </View>

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

  // 🎤 Voice FAB
  voiceFAB: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 20,
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

import React from "react";
import { StyleSheet, Pressable } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Feather } from "@expo/vector-icons";
import { Task } from "@/store/useTask";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const AnimatedThemedView = Animated.createAnimatedComponent(ThemedView);

type TaskRowProps = {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
};

export function TaskRow({ task, onToggle, onDelete }: TaskRowProps) {
  const textColor = useThemeColor({}, "text");
  const backgroundColor = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "icon");

  const translateX = useSharedValue(0);
  const trigger = 80;

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onEnd(() => {
      if (translateX.value >= trigger) {
        runOnJS(onToggle)();
      } else if (translateX.value <= -trigger) {
        runOnJS(onDelete)();
      }

      translateX.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <ThemedView style={styles.wrapper}>
      {/* Background indicators */}
      <ThemedView style={styles.backgroundRow}>
        {/* Left (complete) */}
        <ThemedView style={[styles.action, styles.completeAction]}>
          <Feather name="check-circle" size={20} color="white" />
          <ThemedText style={styles.actionText}>Complete</ThemedText>
        </ThemedView>

        {/* Right (delete) */}
        <ThemedView style={[styles.action, styles.deleteAction]}>
          <ThemedText style={styles.actionText}>Delete</ThemedText>
          <Feather name="trash-2" size={20} color="white" />
        </ThemedView>
      </ThemedView>

      {/* Foreground (task row) */}
      <GestureDetector gesture={pan}>
        <AnimatedThemedView
          style={[
            styles.container,
            animatedStyle,
            { backgroundColor, borderColor },
          ]}
        >
          {/* Toggle complete manually */}
          <Pressable onPress={onToggle} style={styles.checkbox}>
            {task.completed ? (
              <Feather name="check-circle" size={24} color="green" />
            ) : (
              <Feather name="circle" size={24} color={textColor} />
            )}
          </Pressable>

          {/* Task info */}
          <ThemedView style={styles.textContainer}>
            <ThemedText
              style={[
                styles.title,
                task.completed && {
                  textDecorationLine: "line-through",
                  opacity: 0.6,
                },
              ]}
              numberOfLines={1}
            >
              {task.title}
            </ThemedText>

            {task.description ? (
              <ThemedText
                style={[
                  styles.description,
                  task.completed && {
                    textDecorationLine: "line-through",
                    opacity: 0.5,
                  },
                ]}
                numberOfLines={2}
              >
                {task.description}
              </ThemedText>
            ) : null}
          </ThemedView>

          {/* Fallback delete button */}
          <Pressable onPress={onDelete} style={styles.delete}>
            <Feather name="trash-2" size={20} color="red" />
          </Pressable>
        </AnimatedThemedView>
      </GestureDetector>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  backgroundRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeAction: {
    backgroundColor: "green",
  },
  deleteAction: {
    backgroundColor: "red",
  },
  actionText: {
    color: "white",
    fontWeight: "bold",
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  checkbox: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    opacity: 0.8,
  },
  delete: {
    marginLeft: 12,
  },
});

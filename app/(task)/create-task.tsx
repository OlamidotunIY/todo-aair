import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Formik } from "formik";
import * as Yup from "yup";
import { Task, useTasks } from "@/store/useTask";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import { ThemedButton } from "@/components/ThemedButton";

const initialState: {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
} = {
  title: "",
  description: "",
  priority: "medium",
};

const CreateTask = () => {
  const { addTask } = useTasks();
  const priorities: Array<"low" | "medium" | "high"> = [
    "low",
    "medium",
    "high",
  ];

  const taskSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .min(3, "Title must be at least 3 characters"),

    description: Yup.string().default(""),
    priority: Yup.mixed<NonNullable<Task["priority"]>>()
      .oneOf(["low", "medium", "high"], "Invalid priority")
      .required("Priority is required")
      .default("medium"),
  });

  const handleCreateTask = (values: {
    title: string;
    description: string;
    priority: string;
  }) => {
    addTask(values.title, values.description, values.priority);
    router.push("/all-task");
  };

  return (
    <Formik
      initialValues={initialState}
      onSubmit={handleCreateTask}
      validationSchema={taskSchema}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
        isValid,
        dirty,
      }) => (
        <ThemedView style={styles.con}>
          <ThemedText style={styles.title}>Create Task</ThemedText>
          <ThemedView style={styles.inputCon}>
            <ThemedView style={styles.input}>
              <ThemedText
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                Title
              </ThemedText>
              <ThemedTextInput
                placeholder="Task title"
                onChangeText={handleChange("title")}
                onBlur={handleBlur("title")}
                value={values.title}
              />
            </ThemedView>
            {errors.title && touched.title && (
              <ThemedText style={{ color: "red", fontSize: 12 }}>
                {errors.title}
              </ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.inputCon}>
            <ThemedView style={styles.input}>
              <ThemedText
                style={{
                  fontSize: 14,
                  marginBottom: 5,
                }}
              >
                Description
              </ThemedText>
              <ThemedTextInput
                placeholder="Description (optional)"
                onChangeText={handleChange("description")}
                onBlur={handleBlur("description")}
                value={values.description}
              />
            </ThemedView>
            {errors.description && touched.description && (
              <ThemedText style={{ color: "red", fontSize: 12 }}>
                {errors.description}
              </ThemedText>
            )}
          </ThemedView>
          <ThemedView style={styles.inputCon}>
            <ThemedView style={styles.input}>
              <ThemedText>Priorities</ThemedText>
              <ThemedView
                style={{
                  marginTop: 10,
                  paddingHorizontal: 5,
                }}
              >
                {priorities.map((p) => {
                  const selected: boolean = values.priority === p;
                  return (
                    <ThemedView key={p}>
                      <Pressable
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                        onPress={() => setFieldValue("priority", p)}
                      >
                        <Checkbox
                          value={selected}
                          onValueChange={() => {
                            handleChange("priority")(p);
                          }}
                        />
                        <ThemedText>{p}</ThemedText>
                      </Pressable>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </ThemedView>
          </ThemedView>
          <ThemedView
            style={{
              width: "100%",
              marginTop: 20,
            }}
          >
            <ThemedButton
              title="Create Task"
              onPress={handleSubmit as any}
              disabled={!(isValid && dirty)}
            />
          </ThemedView>
        </ThemedView>
      )}
    </Formik>
  );
};

export default CreateTask;

const styles = StyleSheet.create({
  con: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 10,
  },
  inputCon: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
  },
  input: {
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textTransform: "uppercase",
    width: "100%",
    textAlign: "center",
  },
});

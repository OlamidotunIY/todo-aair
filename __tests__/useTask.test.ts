import { useTasks } from "@/store/useTask";
import { act } from "@testing-library/react-native";

describe("useTasks store", () => {
  beforeEach(() => {
    useTasks.getState().reset?.();
  });

  it("creates a new task", () => {
    act(() => {
      useTasks
        .getState()
        .addTask("Test Task", "Task description", undefined, "medium");
    });

    const tasks = useTasks.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].title).toBe("Test Task");
  });

  it("creates a new task with full object (test-only)", () => {
    act(() => {
      useTasks.getState().addTaskObject?.({
        id: "1",
        title: "Test Task",
        description: "Task description",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        priority: "medium",
      });
    });

    const tasks = useTasks.getState().tasks;
    expect(tasks.length).toBe(1);
    expect(tasks[0].priority).toBe("medium");
  });

  it("toggles task completion", () => {
    act(() => {
      useTasks.getState().addTask("Test Task", "", undefined, "medium");
      const id = useTasks.getState().tasks[0].id;
      useTasks.getState().toggleTask(id);
    });

    expect(useTasks.getState().tasks[0].completed).toBe(true);
  });
});

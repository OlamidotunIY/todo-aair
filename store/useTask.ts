// src/state/useTasks.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuid } from "uuid";

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
};

export type Filter = "all" | "completed" | "incomplete";
export type Sort = "recent" | "oldest" | "dueDate";

type TaskState = {
  tasks: Task[];
  trash: Task[];
  filter: Filter;
  sort: Sort;
  search: string;

  // actions
  addTask: (
    title: string,
    description?: string,
    dueDate?: string,
    priority?: Task["priority"]
  ) => void;
  addTaskObject?: (task: Task) => void; // 👈 helper for tests
  toggleTask: (id: string) => void;
  moveToTrash: (id: string) => void;
  restoreFromTrash: (id: string) => void;
  emptyTrash: () => void;
  reset?: () => void; // 👈 helper for tests

  // filters & sorting
  setFilter: (f: Filter) => void;
  setSort: (s: Sort) => void;
  setSearch: (q: string) => void;

  // derived
  getVisibleTasks: () => Task[];
};

export const useTasks = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      trash: [],
      filter: "all",
      sort: "recent",
      search: "",

      addTask: (title, description, dueDate, priority) => {
        if (!title.trim()) return;
        const now = new Date().toISOString();
        const newTask: Task = {
          id: uuid(),
          title: title.trim(),
          description,
          completed: false,
          createdAt: now,
          updatedAt: now,
          priority,
          dueDate,
        };
        set({ tasks: [newTask, ...get().tasks] });
      },

      // ✅ test-only helper
      addTaskObject: (task) => {
        set({ tasks: [task, ...get().tasks] });
      },

      toggleTask: (id) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  completed: !t.completed,
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }),

      moveToTrash: (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) return;
        set({
          tasks: get().tasks.filter((t) => t.id !== id),
          trash: [task, ...get().trash],
        });
      },

      restoreFromTrash: (id) => {
        const task = get().trash.find((t) => t.id === id);
        if (!task) return;
        set({
          tasks: [task, ...get().tasks],
          trash: get().trash.filter((t) => t.id !== id),
        });
      },

      emptyTrash: () => set({ trash: [] }),

      setFilter: (f) => set({ filter: f }),
      setSort: (s) => set({ sort: s }),
      setSearch: (q) => set({ search: q }),

      // ✅ reset everything (for tests)
      reset: () =>
        set({
          tasks: [],
          trash: [],
          filter: "all",
          sort: "recent",
          search: "",
        }),

      getVisibleTasks: () => {
        const { tasks, filter, sort, search } = get();

        let filtered = tasks;

        if (filter === "completed") {
          filtered = filtered.filter((t) => t.completed);
        } else if (filter === "incomplete") {
          filtered = filtered.filter((t) => !t.completed);
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              (t.description && t.description.toLowerCase().includes(q))
          );
        }

        if (sort === "recent") {
          filtered = [...filtered].sort(
            (a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        } else if (sort === "oldest") {
          filtered = [...filtered].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        } else if (sort === "dueDate") {
          filtered = [...filtered].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          });
        }

        return filtered;
      },
    }),
    {
      name: "todo-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

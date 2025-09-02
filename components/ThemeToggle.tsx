import { Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/store/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("light");
  };
  const icon = theme === "dark" ? "sun" : "moon";

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor:
          theme === "light" ? Colors.dark.background : Colors.light.background,
        borderWidth: 1,
        padding: 10,
        paddingHorizontal: 15,
      }}
    >
      <Feather
        name={icon}
        size={16}
        color={theme === "light" ? Colors.dark.icon : Colors.light.icon}
      />
    </Pressable>
  );
}

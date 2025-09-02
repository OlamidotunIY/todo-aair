import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useColorScheme } from "@/hooks/useColorScheme.web";
import { useTheme } from "@/store/useTheme";

type Variant = "filled" | "outlined" | "ghost";

export type ThemedButtonProps = PressableProps & {
  title: string;
  variant?: Variant;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({
  title,
  variant = "filled",
  style,
  lightColor,
  darkColor,
  disabled,
  ...rest
}: ThemedButtonProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "text"
  );
  const { theme } = useTheme();
  const primary = useThemeColor({ light: lightColor, dark: darkColor }, "tint");

  let buttonStyle = {};
  let labelStyle = {};

  if (disabled) {
    // 🔹 Disabled styles
    buttonStyle = {
      backgroundColor: variant === "filled" ? "#ccc" : "transparent",
      borderColor: variant === "outlined" ? "#ccc" : "transparent",
    };
    labelStyle = { color: "#999" };
  } else {
    // 🔹 Active styles
    switch (variant) {
      case "filled":
        buttonStyle = { backgroundColor: primary, borderColor: primary };
        labelStyle = { color: theme === "light" ? "#fff" : "#000" };
        break;
      case "outlined":
        buttonStyle = {
          borderWidth: 1,
          borderColor: primary,
          backgroundColor: "transparent",
        };
        labelStyle = { color: primary };
        break;
      case "ghost":
        buttonStyle = { backgroundColor: "transparent" };
        labelStyle = { color: textColor };
        break;
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        buttonStyle,
        !disabled && pressed && styles.pressed,
        style,
      ]}
      disabled={disabled}
      {...rest}
    >
      <Text style={[styles.label, labelStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10, // consistent vertical size
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center", // important for horizontal FlatList
    minHeight: 40, // ensure minimum height
    flexShrink: 0, // prevent shrinking inside list
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});

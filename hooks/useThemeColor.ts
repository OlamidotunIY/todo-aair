import { Colors } from "@/constants/Colors";
import { useColorScheme as useSystemColorScheme } from "react-native";
import { useTheme } from "@/store/useTheme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const { theme } = useTheme();

  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

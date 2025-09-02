import { useEffect } from "react";
import { Appearance } from "react-native";
import { useTheme } from "@/store/useTheme";

export function useSyncSystemTheme() {
  const setTheme = useTheme((s) => s.setTheme);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme ?? "light");
    });

    return () => subscription.remove();
  }, [setTheme]);
}

import * as Haptics from "expo-haptics";
import {
    ExpoSpeechRecognitionModule,
    useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export type SpeechRecognitionState = "idle" | "listening" | "processing";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void | Promise<void>;
  lang?: string;
}

export function useSpeechRecognition({
  onResult,
  lang = "en-US",
}: UseSpeechRecognitionProps) {
  const [state, setState] = useState<SpeechRecognitionState>("idle");
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if speech recognition is available
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const services =
          await ExpoSpeechRecognitionModule.getSpeechRecognitionServices();
        setIsAvailable(services.length > 0);
        if (services.length === 0) {
          console.warn("⚠️ Speech recognition not available on this device");
        }
      } catch (error) {
        console.error("Error checking speech recognition availability:", error);
        setIsAvailable(false);
      }
    };
    checkAvailability();
  }, []);

  // Listen for speech recognition events
  useSpeechRecognitionEvent("start", () => {
    console.log("🎤 Speech recognition started");
    setState("listening");
    setIsRecognizing(true);
  });

  useSpeechRecognitionEvent("end", () => {
    console.log("🎤 Speech recognition ended");
    setState("idle");
    setIsRecognizing(false);
  });

  useSpeechRecognitionEvent("result", async (event) => {
    console.log("📝 Transcription result:", event.results);
    const transcript = event.results[0]?.transcript || "";

    if (transcript.trim().length === 0) {
      Alert.alert("No Speech Detected", "Please try speaking again.");
      setState("idle");
      return;
    }

    setState("processing");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await onResult(transcript);
    } catch (error) {
      console.error("❌ Error processing transcript:", error);
      Alert.alert(
        "Processing Error",
        "Could not process your voice input. Please try again."
      );
    } finally {
      setState("idle");
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    console.error("❌ Speech recognition error:", event.error);
    setState("idle");
    setIsRecognizing(false);

    let errorMessage = "Could not recognize speech. Please try again.";

    const errorStr = String(event.error);
    if (errorStr.includes("authorized") || errorStr.includes("permission")) {
      errorMessage =
        "Microphone permission denied. Please enable it in Settings.";
    } else if (errorStr.includes("network")) {
      errorMessage = "Network error. Using offline mode.";
    }

    Alert.alert("Voice Input Error", errorMessage);
  });

  const start = async () => {
    if (!isAvailable) {
      Alert.alert(
        "Not Available",
        "Speech recognition is not available on this device."
      );
      return false;
    }

    if (isRecognizing) {
      return false;
    }

    try {
      const { granted } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Microphone permission is required for voice input. Please enable it in Settings.",
          [{ text: "OK" }]
        );
        return false;
      }

      await ExpoSpeechRecognitionModule.start({
        lang,
        interimResults: false,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: ["task", "todo", "reminder"],
      });

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      return true;
    } catch (error) {
      console.error("❌ Error starting speech recognition:", error);
      Alert.alert(
        "Voice Input Error",
        "Could not start voice input. Please check your microphone permissions."
      );
      setState("idle");
      return false;
    }
  };

  const stop = async () => {
    if (!isRecognizing) {
      return false;
    }

    try {
      await ExpoSpeechRecognitionModule.stop();
      return true;
    } catch (error) {
      console.error("Error stopping recognition:", error);
      return false;
    }
  };

  const toggle = async () => {
    if (isRecognizing) {
      return await stop();
    } else {
      return await start();
    }
  };

  return {
    state,
    isRecognizing,
    isAvailable,
    start,
    stop,
    toggle,
  };
}

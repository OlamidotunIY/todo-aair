/**
 * VoiceFAB.tsx
 *
 * Floating Action Button for Voice Input
 * Features:
 * - Pulsing animation while recording
 * - Color changes based on state (idle, listening, processing)
 * - Haptic feedback on press
 */

import { FontAwesome6 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    StyleSheet,
    ViewStyle,
} from 'react-native';

export type VoiceFABState = 'idle' | 'listening' | 'processing';

interface VoiceFABProps {
  onPress: () => void;
  state: VoiceFABState;
  style?: ViewStyle;
}

export function VoiceFAB({ onPress, state, style }: VoiceFABProps) {
  // Animation value for pulsing effect
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const opacityAnim = React.useRef(new Animated.Value(0.3)).current;

  // Start pulsing animation when listening
  useEffect(() => {
    if (state === 'listening') {
      // Scale animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Opacity animation for outer ring
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.8,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations
      pulseAnim.setValue(1);
      opacityAnim.setValue(0.3);
    }
  }, [state, pulseAnim, opacityAnim]);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  // Determine colors based on state
  const getColors = () => {
    switch (state) {
      case 'listening':
        return {
          background: '#FF3B30', // Red when listening
          icon: '#FFFFFF',
          ring: '#FF3B30',
        };
      case 'processing':
        return {
          background: '#FF9500', // Orange when processing
          icon: '#FFFFFF',
          ring: '#FF9500',
        };
      default: // idle
        return {
          background: '#007AFF', // Blue when idle
          icon: '#FFFFFF',
          ring: '#007AFF',
        };
    }
  };

  const colors = getColors();

  // Icon based on state
  const getIcon = () => {
    switch (state) {
      case 'listening':
        return 'microphone';
      case 'processing':
        return 'waveform-lines';
      default:
        return 'microphone';
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.container, style]}
      disabled={state === 'processing'}
    >
      {/* Outer pulsing ring (visible when listening) */}
      {state === 'listening' && (
        <Animated.View
          style={[
            styles.outerRing,
            {
              backgroundColor: colors.ring,
              opacity: opacityAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
      )}

      {/* Main button */}
      <Animated.View
        style={[
          styles.button,
          {
            backgroundColor: colors.background,
            transform: [
              {
                scale: state === 'listening' ? pulseAnim : 1,
              },
            ],
          },
        ]}
      >
        <FontAwesome6
          name={getIcon()}
          size={24}
          color={colors.icon}
          solid={state === 'listening'}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  outerRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});

import { useRef } from "react";
import { StyleSheet, View, Pressable, Text } from "react-native";

interface ArrowKeyboardProps {
  onArrowPress?: (direction: "up" | "down" | "left" | "right") => void;
}

export function ArrowKeyboard({ onArrowPress }: ArrowKeyboardProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = (direction: "up" | "down" | "left" | "right") => {
    // Immediate first trigger
    onArrowPress?.(direction);
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Start continuous firing
    intervalRef.current = setInterval(() => {
      onArrowPress?.(direction);
    }, 50); // Fire every 50ms while held
  };

  const handlePressOut = () => {
    // Stop continuous firing
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <View style={styles.keyboardContainer}>
      <View style={styles.keyboardRow}>
        <View style={styles.emptySpace} />
        <Pressable
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowButtonPressed,
          ]}
          onPressIn={() => handlePressIn("up")}
          onPressOut={handlePressOut}
        >
          <Text style={styles.arrowText}>▲</Text>
        </Pressable>
        <View style={styles.emptySpace} />
      </View>

      <View style={styles.keyboardRow}>
        <Pressable
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowButtonPressed,
          ]}
          onPressIn={() => handlePressIn("left")}
          onPressOut={handlePressOut}
        >
          <Text style={styles.arrowText}>◀</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowButtonPressed,
          ]}
          onPressIn={() => handlePressIn("down")}
          onPressOut={handlePressOut}
        >
          <Text style={styles.arrowText}>▼</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.arrowButton,
            pressed && styles.arrowButtonPressed,
          ]}
          onPressIn={() => handlePressIn("right")}
          onPressOut={handlePressOut}
        >
          <Text style={styles.arrowText}>▶</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    gap: 10,
  },
  keyboardRow: {
    flexDirection: "row",
    gap: 10,
  },
  emptySpace: {
    width: 70,
  },
  arrowButton: {
    width: 70,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  arrowButtonPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  arrowText: {
    fontSize: 30,
    color: "#fff",
  },
});

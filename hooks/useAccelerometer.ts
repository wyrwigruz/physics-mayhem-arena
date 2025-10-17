import { useState, useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
}

export interface UseAccelerometerReturn {
  data: AccelerometerData;
  magnitude: number;
  isActive: boolean;
  isAvailable: boolean;
  isSimulator: boolean;
  toggleSensor: () => void;
}

export function useAccelerometer(): UseAccelerometerReturn {
  const [data, setData] = useState<AccelerometerData>({ x: 0, y: 0, z: 0 });
  const [magnitude, setMagnitude] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isSimulator, setIsSimulator] = useState<boolean>(false);

  // Mock data animation for simulator
  const mockAnimationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Check if running in simulator
    const checkSimulator = async () => {
      const available = await Accelerometer.isAvailableAsync();

      if (!available) {
        setIsSimulator(true);
        setIsAvailable(false);

        // Start mock animation for simulator
        Animated.loop(
          Animated.sequence([
            Animated.timing(mockAnimationValue, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(mockAnimationValue, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        setIsAvailable(true);
      }
    };

    checkSimulator();

    // Set update interval (100ms = 10Hz)
    Accelerometer.setUpdateInterval(100);

    let subscription: any;

    if (isActive && isAvailable) {
      subscription = Accelerometer.addListener((accelerometerData: AccelerometerData) => {
        setData(accelerometerData);

        // Calculate magnitude
        const mag = Math.sqrt(
          Math.pow(accelerometerData.x, 2) +
          Math.pow(accelerometerData.y, 2) +
          Math.pow(accelerometerData.z, 2)
        );
        setMagnitude(mag);
      });
    }

    return () => {
      subscription && subscription.remove();
    };
  }, [isActive, isAvailable]);

  // Generate mock data for simulator
  useEffect(() => {
    if (isSimulator && isActive) {
      const interval = setInterval(() => {
        const time = Date.now() / 1000;
        const mockData = {
          x: Math.sin(time) * 0.5,
          y: Math.cos(time) * 0.5,
          z: Math.sin(time * 0.5) * 0.3,
        };

        setData(mockData);

        const mag = Math.sqrt(
          Math.pow(mockData.x, 2) +
          Math.pow(mockData.y, 2) +
          Math.pow(mockData.z, 2)
        );
        setMagnitude(mag);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isSimulator, isActive]);

  const toggleSensor = () => {
    setIsActive(!isActive);
  };

  return {
    data,
    magnitude,
    isActive,
    isAvailable,
    isSimulator,
    toggleSensor,
  };
}

import { useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  const progress = water / goal;

  const level = useSharedValue(0);

  const waterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withTiming(height * (1 - level.value), { duration: 700, easing: Easing.out(Easing.cubic) }) }],
  }));

  const addWater = () => {
    const newWater = Math.min(water + 250, goal);
    setWater(newWater);
    level.value = newWater / goal;
  };

  const reset = () => {
    setWater(0);
    level.value = 0;
  };

  return (
    <View style={styles.container}>

      {/* Animated Water */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#7dd3fc" />
              <Stop offset="100%" stopColor="#0284c7" />
            </LinearGradient>
          </Defs>

          {/* Wave shape */}
          <Path
            d={`
              M0 80
              Q ${width * 0.25} 40, ${width * 0.5} 80
              T ${width} 80
              L ${width} ${height}
              L 0 ${height}
              Z
            `}
            fill="url(#grad)"
          />
        </Svg>
      </Animated.View>

      {/* Content */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Water Tracker</Text>
        <Text style={styles.amount}>{water} ml</Text>

        <TouchableOpacity style={styles.button} onPress={addWater}>
          <Text style={styles.buttonText}>+ Add Water</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={reset}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  waterContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
  },

  amount: {
    fontSize: 42,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#111',
  },

  button: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  reset: {
    marginTop: 15,
    color: '#888',
  },
});
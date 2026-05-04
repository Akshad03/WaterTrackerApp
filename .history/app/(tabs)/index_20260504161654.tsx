import { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function HomeScreen() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  const level = useSharedValue(0);
  const waveX = useSharedValue(0);

  const waterStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(height * (1 - level.value), {
          duration: 700,
          easing: Easing.out(Easing.cubic),
        }),
      },
    ],
  }));

  useEffect(() => {
    waveX.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedWave = useAnimatedProps(() => {
    const offset = waveX.value * 120;

    return {
      d: `
        M0 120
        Q ${width * 0.25 + offset} 80, ${width * 0.5 + offset} 120
        T ${width + offset} 120
        L ${width} ${height}
        L 0 ${height}
        Z
      `,
    };
  });

  const addWater = () => {
    const newWater = Math.min(water + 250, goal);
    setWater(newWater);
    level.value = newWater / goal;
  };

  return (
    <View style={styles.container}>
      {/* 🌊 WATER */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3b82f6" />
              <Stop offset="100%" stopColor="#60a5fa" />
            </LinearGradient>
          </Defs>

          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      {/* 🧾 TOP TEXT */}
      <View style={styles.topContent}>
        <Text style={styles.amount}>
          {(water / 1000).toFixed(3)}ml
        </Text>
        <Text style={styles.sub}>
          Remaining {goal - water} ml
        </Text>
      </View>

      {/* 💧 CENTER BUTTON */}
      <View style={styles.center}>
        <TouchableOpacity style={styles.circle} onPress={addWater}>
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>

        <Text style={styles.addText}>+250 ml</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },

  waterContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },

  topContent: {
    marginTop: 80,
    alignItems: 'center',
  },

  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#2563eb',
  },

  sub: {
    marginTop: 6,
    color: '#64748b',
  },

  center: {
    position: 'absolute',
    bottom: 180,
    width: '100%',
    alignItems: 'center',
  },

  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  plus: {
    fontSize: 36,
    color: '#2563eb',
  },

  addText: {
    marginTop: 10,
    color: '#2563eb',
  },
});
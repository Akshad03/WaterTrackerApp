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

  // 🌊 vertical water level animation
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

  // 🌊 horizontal wave animation
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
        M0 80
        Q ${width * 0.25 + offset} 40, ${width * 0.5 + offset} 80
        T ${width + offset} 80
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

  const reset = () => {
    setWater(0);
    level.value = 0;
  };

  return (
    <View style={styles.container}>
      {/* 🌊 Water Background */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#7dd3fc" />
              <Stop offset="100%" stopColor="#0284c7" />
            </LinearGradient>
          </Defs>

          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      {/* 🧾 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>WATER</Text>
        <Text style={styles.headerSub}>TRACKER</Text>
      </View>

      {/* 🧩 Card */}
      <View style={styles.card}>
        <Text style={styles.amount}>{water} ml</Text>
        <Text style={styles.goal}>Goal: {goal} ml</Text>

        <TouchableOpacity style={styles.button} onPress={addWater}>
          <Text style={styles.buttonText}>+ ADD</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={reset}>
          <Text style={styles.reset}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* 🔘 Footer */}
      <View style={styles.footer}>
        <View style={styles.dotActive} />
        <View style={styles.dot} />
        <View style={styles.dot} />
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

  header: {
  paddingTop: 70,
  paddingHorizontal: 20,
},

  headerTitle: {
    fontSize: 16,
    letterSpacing: 3,
    color: '#111',
  },

  headerSub: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111',
  },

  card: {
  position: 'absolute',
  top: '32%',
  alignSelf: 'center',
  width: '88%',
  paddingVertical: 28,
  borderRadius: 20,
  alignItems: 'center',

  backgroundColor: 'rgba(255,255,255,0.75)', // 👈 lighter

  shadowColor: '#000',
  shadowOpacity: 0.04, // 👈 softer
  shadowRadius: 20,
  elevation: 3,
},
amount: {
  fontSize: 42,
  fontWeight: '700',
  letterSpacing: 1,
  color: '#111',
},
 goal: {
  fontSize: 14,
  color: '#777',
  marginBottom: 18,
},

  button: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },

  buttonText: {
    color: '#fff',
    letterSpacing: 1,
  },

  reset: {
    marginTop: 10,
    color: '#888',
  },

  footer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ccc',
  },

  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
  },
});
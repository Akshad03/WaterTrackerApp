import { BlurView } from 'expo-blur';
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

  // 🌊 Water level animation
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

  // 🌊 Wave animation
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
              <Stop offset="0%" stopColor="#a5f3fc" />
              <Stop offset="100%" stopColor="#38bdf8" />
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

      {/* 💎 Glass Card */}
      <BlurView intensity={60} tint="light" style={styles.card}>
        <View style={styles.cardInner}>
          <Text style={styles.amount}>{water} ml</Text>
          <Text style={styles.goal}>Goal: {goal} ml</Text>

          <TouchableOpacity style={styles.button} onPress={addWater}>
            <Text style={styles.buttonText}>+ ADD</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={reset}>
            <Text style={styles.reset}>Reset</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    fontSize: 14,
    letterSpacing: 3,
    color: '#94a3b8',
  },

  headerSub: {
    fontSize: 34,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },

  card: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: '90%',
    padding: 15,

    borderRadius: 28,
    overflow: 'hidden',

    // 💎 floating shadow
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  cardInner: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 20,
    paddingVertical: 25,
    alignItems: 'center',
  },

  amount: {
    fontSize: 42,
    fontWeight: '700',
    color: '#0f172a',
  },

  goal: {
    fontSize: 15,
    color: '#64748b',
    marginBottom: 20,
  },

  button: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 18,
  },

  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  reset: {
    marginTop: 12,
    color: '#94a3b8',
  },
});
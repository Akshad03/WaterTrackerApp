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

  // 🌊 vertical water level
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

  // 🌊 wave motion
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
      {/* 🔲 Dot Grid Background */}
      <View style={styles.grid} />

      {/* 🌊 Water */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#bae6fd" />
              <Stop offset="100%" stopColor="#38bdf8" />
            </LinearGradient>
          </Defs>

          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      {/* 🧾 Header */}
      <View style={styles.header}>
        <Text style={styles.headerTop}>WATER</Text>
        <Text style={styles.headerMain}>TRACKER</Text>
      </View>

      {/* 🧱 Card */}
      <View style={styles.card}>
        {/* Pixel Bar */}
        <View style={styles.pixelBar} />

        <Text style={styles.amount}>{water} ml</Text>
        <Text style={styles.goal}>GOAL {goal} ML</Text>

        <View style={styles.divider} />

        <TouchableOpacity style={styles.button} onPress={addWater}>
          <Text style={styles.buttonText}>+ ADD WATER</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={reset}>
          <Text style={styles.reset}>RESET</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  /* 🔲 fake pixel grid */
  grid: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
    backgroundColor: '#fafafa',
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

  headerTop: {
    fontSize: 12,
    letterSpacing: 5,
    color: '#888',
  },

  headerMain: {
    fontSize: 34,
    fontWeight: '900',
    marginTop: 4,
    color: '#111',
  },

  card: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 32,
    paddingHorizontal: 20,

    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',

    alignItems: 'center',
  },

  pixelBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 3,
    width: '100%',
    backgroundColor: '#000',
  },

  amount: {
    fontSize: 46,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#111',
  },

  goal: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#777',
    marginTop: 6,
  },

  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 20,
  },

  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 2,
  },

  buttonText: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 2,
  },

  reset: {
    marginTop: 14,
    fontSize: 11,
    letterSpacing: 2,
    color: '#999',
  },
});
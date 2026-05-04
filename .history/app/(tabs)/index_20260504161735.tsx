import { useEffect, useState } from 'react';
import {
  Dimensions,
  StatusBar,
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
  withSpring,
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
  const buttonScale = useSharedValue(1);

  // 🌊 Water level animation
  const waterStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(height * (1 - level.value), {
          damping: 15,
          stiffness: 90,
        }),
      },
    ],
  }));

  // 🌊 Continuous wave animation
  useEffect(() => {
    waveX.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedWave = useAnimatedProps(() => {
    const offset = waveX.value * width;
    return {
      d: `M-100 60 Q ${width * 0.25} 30, ${width * 0.5} 60 T ${width + 100} 60 L ${width + 100} ${height} L -100 ${height} Z`,
    };
  });

  const addWater = () => {
    buttonScale.value = withSpring(0.9, {}, () => {
      buttonScale.value = withSpring(1);
    });
    const newWater = Math.min(water + 250, goal);
    setWater(newWater);
    level.value = newWater / goal;
  };

  const reset = () => {
    setWater(0);
    level.value = 0;
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* 🌊 Minimalist Water Background */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width + 200} height={height} style={{ marginLeft: -100 }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#C1E8FF" />
              <Stop offset="100%" stopColor="#7EBCF2" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      {/* 🧾 Header Area */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hydration</Text>
        <Text style={styles.headerSub}>Stay refreshed</Text>
      </View>

      {/* 💎 Pixel-style Main Card */}
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.statsRow}>
             <View>
                <Text style={styles.label}>Daily Progress</Text>
                <Text style={styles.amount}>{water} <Text style={styles.unit}>ml</Text></Text>
             </View>
             <View style={styles.badge}>
                <Text style={styles.badgeText}>{Math.round((water/goal)*100)}%</Text>
             </View>
          </View>

          <View style={styles.progressBarBg}>
            <Animated.View 
                style={[
                    styles.progressBarFill, 
                    { width: `${(water / goal) * 100}%` }
                ]} 
            />
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={reset} activeOpacity={0.7}>
                <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
            
            <Animated.View style={animatedButtonStyle}>
                <TouchableOpacity 
                    style={styles.fab} 
                    onPress={addWater}
                    activeOpacity={0.9}
                >
                    <Text style={styles.fabText}>+ 250ml</Text>
                </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FB', // Soft Pixel grey-blue
  },
  waterContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    paddingTop: 80,
    paddingHorizontal: 28,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1C1E',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 16,
    color: '#42474E',
    marginTop: 4,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32, // Large rounded corners for modern look
    padding: 24,
    // Subtle shadow for "Pixel" depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F3F8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#74777F',
    fontWeight: '500',
    marginBottom: 4,
  },
  amount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  unit: {
    fontSize: 20,
    color: '#74777F',
    fontWeight: '400',
  },
  badge: {
    backgroundColor: '#D1E4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    color: '#001D36',
    fontWeight: '700',
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    width: '100%',
    backgroundColor: '#EFF1F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 30,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0061A4',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resetText: {
    color: '#74777F',
    fontWeight: '600',
    fontSize: 15,
  },
  fab: {
    backgroundColor: '#0061A4', // Primary Material Blue
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 20,
  },
  fabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
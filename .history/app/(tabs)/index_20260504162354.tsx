import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function HomeScreen() {
  const [water, setWater] = useState(0);
  const [history, setHistory] = useState<{id: number, time: string, amount: number}[]>([]);
  const goal = 2000;

  const level = useSharedValue(0); // 0 to 1
  const waveHorizontal = useSharedValue(0);

  // 1. Precise Horizontal Movement
  useEffect(() => {
    waveHorizontal.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // 2. The Fix: Absolute Level Tracking
  // We calculate the Y position inside the path to ensure the wave 
  // is perfectly attached to the top of the fill area.
  const animatedWaveProps = useAnimatedProps(() => {
    const waveLength = width;
    const move = waveHorizontal.value * waveLength;
    
    // Calculate current vertical position based on level
    // We subtract a small amount to ensure the wave 'crest' doesn't clip
    const currentY = height * (1 - level.value);
    const amplitude = level.value > 0 ? 15 : 0; // No wave if empty

    return {
      d: `
        M ${-move} ${currentY}
        Q ${-move + waveLength * 0.25} ${currentY - amplitude}, ${-move + waveLength * 0.5} ${currentY}
        T ${-move + waveLength} ${currentY}
        Q ${-move + waveLength * 1.25} ${currentY - amplitude}, ${-move + waveLength * 1.5} ${currentY}
        T ${-move + waveLength * 2} ${currentY}
        V ${height}
        H ${-move}
        Z
      `,
    };
  });

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, goal);
    setWater(newWater);

    // Using a 'Tighter' spring for a more responsive Pixel feel
    level.value = withSpring(newWater / goal, {
      damping: 15,
      stiffness: 60,
      mass: 0.8,
    });

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), time: timeString, amount }, ...history]);
  };

  const reset = () => {
    setWater(0);
    level.value = withTiming(0, { duration: 800 });
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Water - Now using shared level logic inside the SVG */}
      <View style={styles.waterContainer}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#C1E8FF" />
              <Stop offset="100%" stopColor="#7EBCF2" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWaveProps} fill="url(#grad)" />
        </Svg>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>Pixel Health</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.amountText}>{water}<Text style={styles.unitText}>ml</Text></Text>
              <Text style={styles.goalText}>Target: {goal}ml</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.round((water / goal) * 100)}%</Text>
            </View>
          </View>
          
          <View style={styles.buttonGrid}>
             {[150, 250, 500].map((amt) => (
               <TouchableOpacity key={amt} style={styles.pixelButton} onPress={() => addWater(amt)}>
                 <Text style={styles.buttonText}>+{amt}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>History</Text>
          {history.length === 0 && <Text style={styles.emptyText}>No logs yet</Text>}
          {history.map((item) => (
            <View key={item.id} style={styles.logItem}>
              <Text style={styles.logTime}>{item.time}</Text>
              <Text style={styles.logAmount}>+{item.amount} ml</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer Nav */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.tabActive}>
          <Feather name="home" size={22} color="#001D36" />
          <Text style={styles.tabTextActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={reset}>
          <Feather name="refresh-cw" size={20} color="#44474E" />
          <Text style={styles.tabText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  waterContainer: { position: 'absolute', width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 140 },
  header: { paddingTop: 60, paddingHorizontal: 28, marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#1A1C1E', letterSpacing: -1 },
  headerSub: { fontSize: 16, color: '#74777F', fontWeight: '500' },
  
  mainCard: { 
    marginHorizontal: 20, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 32, 
    padding: 24, 
    borderWidth: 1, 
    borderColor: '#E0E2EC',
    elevation: 2 
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 52, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 20, fontWeight: '400', color: '#74777F' },
  goalText: { fontSize: 14, color: '#74777F', marginTop: -4 },
  badge: { backgroundColor: '#D1E4FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#001D36', fontWeight: '800', fontSize: 14 },
  
  buttonGrid: { flexDirection: 'row', marginTop: 28, gap: 12 },
  pixelButton: { 
    flex: 1, 
    backgroundColor: '#F1F4F9', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D7E3F7'
  },
  buttonText: { color: '#001D36', fontWeight: '700', fontSize: 15 },

  historyBox: { marginTop: 32, paddingHorizontal: 28 },
  historyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 16 },
  logItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 18, 
    backgroundColor: '#FFF', 
    borderRadius: 24, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F3F8'
  },
  logTime: { color: '#44474E', fontWeight: '600' },
  logAmount: { color: '#0061A4', fontWeight: '800' },
  emptyText: { color: '#74777F', textAlign: 'center', marginTop: 20 },

  footer: { 
    position: 'absolute', 
    bottom: 0, 
    width: '100%', 
    height: 90, 
    backgroundColor: '#FFFFFF', 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F8'
  },
  tab: { alignItems: 'center', opacity: 0.6 },
  tabActive: { alignItems: 'center' },
  tabTextActive: { fontSize: 11, fontWeight: '800', color: '#001D36', marginTop: 4 },
  tabText: { fontSize: 11, fontWeight: '500', color: '#44474E', marginTop: 4 }
});
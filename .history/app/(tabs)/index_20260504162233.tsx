import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
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

  const level = useSharedValue(0);
  const waveHorizontal = useSharedValue(0);
  const surge = useSharedValue(1); // Controls wave "intensity" when adding water

  // 1. Constant Smooth Horizontal Movement
  useEffect(() => {
    waveHorizontal.value = withRepeat(
      withTiming(1, { duration: 8000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // 2. Synchronized Wave Path
  const animatedWaveProps = useAnimatedProps(() => {
    const waveLength = width;
    const move = waveHorizontal.value * waveLength;
    
    // The wave height (amplitude) grows slightly when water is added (surge)
    const amplitude = interpolate(surge.value, [1, 1.5], [12, 25]);

    return {
      d: `
        M ${-move} ${amplitude}
        Q ${-move + waveLength * 0.25} ${-amplitude} ${-move + waveLength * 0.5} ${amplitude}
        T ${-move + waveLength} ${amplitude}
        Q ${-move + waveLength * 1.25} ${-amplitude} ${-move + waveLength * 1.5} ${amplitude}
        T ${-move + waveLength * 2} ${amplitude}
        V ${height}
        H ${-move}
        Z
      `,
    };
  });

  // 3. Matched Vertical Spring
  const waterStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: withSpring(height * (1 - level.value), { 
        damping: 18, // Matches the "weight" of the water
        stiffness: 45,
        mass: 1
      }) 
    }],
  }));

  const addWater = (amount: number) => {
    // Trigger "Surge" animation (the splash effect)
    surge.value = withSpring(1.5, { damping: 2 }, () => {
      surge.value = withSpring(1);
    });

    const newWater = Math.min(water + amount, goal);
    setWater(newWater);
    level.value = newWater / goal;

    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), time: timeString, amount }, ...history]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Water Layer */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#BAE6FF" />
              <Stop offset="100%" stopColor="#60A5FA" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWaveProps} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>Pixel Health</Text>
        </View>

        {/* Pixel UI Bento Card */}
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
                 <Feather name="plus" size={14} color="#001D36" />
                 <Text style={styles.buttonText}>{amt}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.historyBox}>
          <Text style={styles.historyTitle}>Log</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.logItem}>
              <Text style={styles.logTime}>{item.time}</Text>
              <Text style={styles.logAmount}>+{item.amount} ml</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Smooth Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.tabActive}>
          <Feather name="droplet" size={20} color="#001D36" />
          <Text style={styles.tabTextActive}>Tracker</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={() => { setWater(0); level.value = 0; setHistory([]); }}>
          <Feather name="refresh-cc" size={20} color="#44474E" />
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
    shadowColor: '#000', 
    shadowOpacity: 0.02, 
    shadowRadius: 15,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D7E3F7'
  },
  buttonText: { color: '#001D36', fontWeight: '700', fontSize: 15, marginLeft: 4 },

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
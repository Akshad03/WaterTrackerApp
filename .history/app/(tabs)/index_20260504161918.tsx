import { Feather } from '@expo/vector-icons'; // Ensure expo/vector-icons is installed
import { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
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
  const [history, setHistory] = useState<{id: number, time: string, amount: number}[]>([]);
  const goal = 2000;

  const level = useSharedValue(0);
  const waveX = useSharedValue(0);

  // 🌊 Water animation
  useEffect(() => {
    waveX.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const waterStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(height * (1 - level.value), { damping: 15 }) }],
  }));

  const animatedWave = useAnimatedProps(() => {
    const offset = waveX.value * width;
    return {
      d: `M-100 60 Q ${width * 0.25} 30, ${width * 0.5} 60 T ${width + 100} 60 L ${width + 100} ${height} L -100 ${height} Z`,
    };
  });

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, goal);
    setWater(newWater);
    level.value = newWater / goal;
    
    // Add to history
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), time: timeString, amount }, ...history]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🌊 Dynamic Background */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width + 200} height={height} style={{ marginLeft: -100 }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#D1E4FF" />
              <Stop offset="100%" stopColor="#A8C7F0" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* 🧾 Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</Text>
        </View>

        {/* 💎 Main Stats Card */}
        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.cardLabel}>Current Intake</Text>
              <Text style={styles.amountText}>{water}<Text style={styles.unitText}>ml</Text></Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{Math.round((water / goal) * 100)}%</Text>
            </View>
          </View>
          
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(water / goal) * 100}%` }]} />
          </View>

          <View style={styles.quickAddRow}>
             {[150, 250, 500].map((amt) => (
               <TouchableOpacity key={amt} style={styles.chip} onPress={() => addWater(amt)}>
                 <Text style={styles.chipText}>+{amt}ml</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        {/* 🕒 History Section */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="droplet" size={24} color="#C4C7C5" />
              <Text style={styles.emptyText}>No logs yet today</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                   <Feather name="check" size={14} color="#0061A4" />
                </View>
                <Text style={styles.historyTime}>{item.time}</Text>
                <Text style={styles.historyAmount}>+{item.amount} ml</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 底部 Footer / Navigation */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <Feather name="home" size={22} color="#0061A4" />
          <Text style={[styles.footerText, { color: '#0061A4' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => setWater(0) || setHistory([])}>
          <Feather name="refresh-cw" size={22} color="#44474E" />
          <Text style={styles.footerText}>Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab}>
          <Feather name="settings" size={22} color="#44474E" />
          <Text style={styles.footerText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBFF' },
  waterContainer: { position: 'absolute', width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 120 },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1A1C1E' },
  headerSub: { fontSize: 14, color: '#44474E', fontWeight: '500' },
  
  // Card Styles
  mainCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E2EC',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabel: { fontSize: 13, color: '#44474E', fontWeight: '600', marginBottom: 4 },
  amountText: { fontSize: 44, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 18, fontWeight: '400', color: '#74777F' },
  percentageBadge: { backgroundColor: '#D1E4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  percentageText: { color: '#001D36', fontWeight: '700', fontSize: 13 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  progressTrack: { height: 12, backgroundColor: '#EFF1F9', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0061A4', borderRadius: 6 },
  
  quickAddRow: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
  chip: { backgroundColor: '#F0F4FA', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#D7E3F7' },
  chipText: { color: '#001D36', fontWeight: '600', fontSize: 13 },

  // History Styles
  historySection: { marginTop: 32, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1C1E', marginBottom: 16 },
  historyItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 20, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F3F8'
  },
  historyIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#D1E4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyTime: { flex: 1, fontSize: 15, color: '#1A1C1E', fontWeight: '500' },
  historyAmount: { fontSize: 15, fontWeight: '700', color: '#0061A4' },
  emptyState: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#94a3b8', marginTop: 8, fontSize: 14 },

  // Footer Styles
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 85,
    backgroundColor: '#F3F4F9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E2EC',
  },
  footerTab: { alignItems: 'center' },
  footerText: { fontSize: 11, marginTop: 4, fontWeight: '600', color: '#44474E' }
});
import { Feather } from '@expo/vector-icons';
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

  // 🌊 Horizontal Wave: Slowed down to 8 seconds for a calm effect
  useEffect(() => {
    waveX.value = withRepeat(
      withTiming(1, { 
        duration: 8000, 
        easing: Easing.bezier(0.42, 0, 0.58, 1) // Smooth ease-in-out
      }),
      -1,
      false
    );
  }, []);

  // 💧 Vertical Rise: High damping, low stiffness for a "heavy" liquid feel
  const waterStyle = useAnimatedStyle(() => ({
    transform: [
      { 
        translateY: withSpring(height * (1 - level.value), { 
          damping: 20, 
          stiffness: 40,
          mass: 1 
        }) 
      }
    ],
  }));

  const animatedWave = useAnimatedProps(() => {
    // We oscillate the wave slightly to the left and right
    const move = waveX.value * (width * 0.5);
    return {
      d: `
        M ${-width + move} 40
        C ${-width/2 + move} 10, ${-width/2 + move} 70, ${0 + move} 40
        C ${width/2 + move} 10, ${width/2 + move} 70, ${width + move} 40
        C ${width*1.5 + move} 10, ${width*1.5 + move} 70, ${width*2 + move} 40
        V ${height}
        H ${-width}
        Z
      `,
    };
  });

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, goal);
    setWater(newWater);
    level.value = newWater / goal;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), time: timeString, amount }, ...history]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* 🌊 Improved Smooth Water Background */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width * 3} height={height} style={{ marginLeft: -width }}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#D1E4FF" stopOpacity={0.8} />
              <Stop offset="100%" stopColor="#A8C7F0" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWave} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>

        {/* 💎 Pixel-UI Bento Card */}
        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.cardLabel}>Daily Progress</Text>
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
               <TouchableOpacity 
                 key={amt} 
                 style={styles.chip} 
                 onPress={() => addWater(amt)}
                 activeOpacity={0.6}
               >
                 <Text style={styles.chipText}>+{amt}ml</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        {/* 🕒 History List */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="droplet" size={24} color="#C4C7C5" />
              <Text style={styles.emptyText}>No water logged yet</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.historyIcon}>
                   <Feather name="clock" size={12} color="#0061A4" />
                </View>
                <Text style={styles.historyTime}>{item.time}</Text>
                <Text style={styles.historyAmount}>+{item.amount} ml</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* 📱 Pixel-style Bottom Nav */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <View style={styles.activeIndicator}>
            <Feather name="home" size={22} color="#001D36" />
          </View>
          <Text style={styles.activeFooterText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={styles.footerTab} 
            onPress={() => { setWater(0); level.value = 0; setHistory([]); }}
        >
          <Feather name="rotate-ccw" size={22} color="#44474E" />
          <Text style={styles.footerText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBFF' },
  waterContainer: { position: 'absolute', width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 140 },
  header: { paddingTop: 60, paddingHorizontal: 24, marginBottom: 20 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1A1C1E', letterSpacing: -1 },
  headerSub: { fontSize: 14, color: '#44474E', fontWeight: '500' },
  
  mainCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E0E2EC',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 20,
  },
  cardLabel: { fontSize: 13, color: '#44474E', fontWeight: '600', marginBottom: 4 },
  amountText: { fontSize: 48, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 18, fontWeight: '400', color: '#74777F' },
  percentageBadge: { backgroundColor: '#D1E4FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100 },
  percentageText: { color: '#001D36', fontWeight: '800', fontSize: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  progressTrack: { height: 12, backgroundColor: '#EFF1F9', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#0061A4', borderRadius: 10 },
  
  quickAddRow: { flexDirection: 'row', marginTop: 24, justifyContent: 'space-between' },
  chip: { backgroundColor: '#F0F4FA', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#D7E3F7' },
  chipText: { color: '#001D36', fontWeight: '700', fontSize: 13 },

  historySection: { marginTop: 32, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1A1C1E', marginBottom: 16 },
  historyItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    padding: 16, 
    borderRadius: 24, 
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F3F8'
  },
  historyIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#D1E4FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyTime: { flex: 1, fontSize: 15, color: '#44474E', fontWeight: '500' },
  historyAmount: { fontSize: 16, fontWeight: '800', color: '#0061A4' },
  emptyState: { alignItems: 'center', marginTop: 30, opacity: 0.5 },
  emptyText: { color: '#44474E', marginTop: 8, fontSize: 14, fontWeight: '500' },

  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 90,
    backgroundColor: '#F3F4F9',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E2EC',
  },
  footerTab: { alignItems: 'center' },
  activeIndicator: { backgroundColor: '#D1E4FF', paddingHorizontal: 20, paddingVertical: 4, borderRadius: 16, marginBottom: 4 },
  activeFooterText: { fontSize: 12, fontWeight: '800', color: '#001D36' },
  footerText: { fontSize: 12, marginTop: 4, fontWeight: '500', color: '#44474E' }
});
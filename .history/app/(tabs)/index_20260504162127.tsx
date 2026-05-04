import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

export default function HomeScreen() {
  const [water, setWater] = useState(0);
  const [history, setHistory] = useState<{id: number, time: string, amount: number}[]>([]);
  const goal = 2000;

  const level = useSharedValue(0);
  const waveOffset = useSharedValue(0);

  // 1. Smooth Horizontal Loop (Fixes the "Glitchy" jump)
  useEffect(() => {
    waveOffset.value = withRepeat(
      withTiming(1, { 
        duration: 10000, 
        easing: Easing.linear 
      }),
      -1,
      false
    );
  }, []);

  // 2. Optimized Path Calculation
  const animatedWaveProps = useAnimatedProps(() => {
    const waveHeight = 15; // Subtle waves
    const waveLength = width;
    const move = waveOffset.value * waveLength;

    // We draw two identical waves back-to-back so the loop is invisible
    return {
      d: `
        M ${-move} ${waveHeight}
        Q ${-move + waveLength * 0.25} 0, ${-move + waveLength * 0.5} ${waveHeight}
        T ${-move + waveLength} ${waveHeight}
        Q ${-move + waveLength * 1.25} 0, ${-move + waveLength * 1.5} ${waveHeight}
        T ${-move + waveLength * 2} ${waveHeight}
        V ${height}
        H ${-move}
        Z
      `,
    };
  });

  // 3. Heavy Liquid Rise
  const waterStyle = useAnimatedStyle(() => ({
    transform: [{ 
      translateY: withSpring(height * (1 - level.value), { 
        damping: 25, 
        stiffness: 35 
      }) 
    }],
  }));

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, goal);
    setWater(newWater);
    level.value = newWater / goal;
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), time: timeString, amount }, ...history]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Background Water */}
      <Animated.View style={[styles.waterContainer, waterStyle]}>
        <Svg width={width} height={height}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#C1E8FF" />
              <Stop offset="100%" stopColor="#7EBCF2" />
            </LinearGradient>
          </Defs>
          <AnimatedPath animatedProps={animatedWaveProps} fill="url(#grad)" />
        </Svg>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>Daily Intake</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.amountText}>{water}<Text style={styles.unitText}>ml</Text></Text>
              <Text style={styles.cardLabel}>Goal: {goal}ml</Text>
            </View>
            <View style={styles.percentageBadge}>
              <Text style={styles.percentageText}>{Math.round((water / goal) * 100)}%</Text>
            </View>
          </View>
          
          <View style={styles.quickAddRow}>
             {[150, 250, 500].map((amt) => (
               <TouchableOpacity key={amt} style={styles.chip} onPress={() => addWater(amt)}>
                 <Text style={styles.chipText}>+{amt}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>History</Text>
          {history.map((item) => (
            <View key={item.id} style={styles.historyItem}>
              <Text style={styles.historyTime}>{item.time}</Text>
              <Text style={styles.historyAmount}>{item.amount} ml</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.footerTab}>
          <View style={styles.activeIndicator}><Feather name="home" size={20} color="#001D36" /></View>
          <Text style={styles.activeFooterText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerTab} onPress={() => { setWater(0); level.value = 0; setHistory([]); }}>
          <Feather name="refresh-cw" size={20} color="#44474E" />
          <Text style={styles.footerText}>Reset</Text>
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
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1A1C1E' },
  headerSub: { fontSize: 16, color: '#74777F' },
  mainCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 28, padding: 24, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, borderWidth: 1, borderColor: '#E0E2EC' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  amountText: { fontSize: 44, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 18, fontWeight: '400', color: '#74777F' },
  cardLabel: { fontSize: 14, color: '#74777F', marginTop: -4 },
  percentageBadge: { backgroundColor: '#D1E4FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  percentageText: { color: '#001D36', fontWeight: '800' },
  quickAddRow: { flexDirection: 'row', marginTop: 20, gap: 10 },
  chip: { flex: 1, backgroundColor: '#F0F4FA', paddingVertical: 12, alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#D7E3F7' },
  chipText: { color: '#001D36', fontWeight: '700' },
  historySection: { marginTop: 30, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 15 },
  historyItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderRadius: 20, marginBottom: 8, borderWidth: 1, borderColor: '#F0F3F8' },
  historyTime: { color: '#44474E', fontWeight: '500' },
  historyAmount: { color: '#0061A4', fontWeight: '700' },
  footer: { position: 'absolute', bottom: 0, width: '100%', height: 85, backgroundColor: '#F3F4F9', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E0E2EC' },
  footerTab: { alignItems: 'center' },
  activeIndicator: { backgroundColor: '#D1E4FF', paddingHorizontal: 18, paddingVertical: 4, borderRadius: 14, marginBottom: 2 },
  activeFooterText: { fontSize: 11, fontWeight: '800', color: '#001D36' },
  footerText: { fontSize: 11, color: '#44474E', marginTop: 4 }
});
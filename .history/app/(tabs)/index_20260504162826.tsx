import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

const STORAGE_KEY = '@water_tracker_data';
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;

export default function HomeScreen() {
  const [water, setWater] = useState(0);
  const [history, setHistory] = useState<{id: number, date: number, time: string, amount: number}[]>([]);
  const [isReady, setIsReady] = useState(false);
  
  const goal = 4000; 
  const level = useSharedValue(0);
  const waveHorizontal = useSharedValue(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const { savedWater, savedHistory } = JSON.parse(savedData);
          const now = Date.now();
          const filteredHistory = savedHistory.filter((item: any) => (now - item.date) < TWO_DAYS_MS);
          setWater(savedWater);
          setHistory(filteredHistory);
          level.value = savedWater / goal;
        }
      } catch (e) { console.error(e); } 
      finally { setIsReady(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isReady) return;
    const saveData = async () => {
      try {
        const data = JSON.stringify({ savedWater: water, savedHistory: history });
        await AsyncStorage.setItem(STORAGE_KEY, data);
      } catch (e) { console.error(e); }
    };
    saveData();
  }, [water, history, isReady]);

  useEffect(() => {
    waveHorizontal.value = withRepeat(withTiming(1, { duration: 6000, easing: Easing.linear }), -1, false);
  }, []);

  const animatedWaveProps = useAnimatedProps(() => {
    const waveLength = width;
    const move = waveHorizontal.value * waveLength;
    const currentY = height * (1 - level.value);
    const amplitude = level.value > 0 ? 15 : 0;
    return {
      d: `M ${-move} ${currentY} Q ${-move + waveLength * 0.25} ${currentY - amplitude}, ${-move + waveLength * 0.5} ${currentY} T ${-move + waveLength} ${currentY} Q ${-move + waveLength * 1.25} ${currentY - amplitude}, ${-move + waveLength * 1.5} ${currentY} T ${-move + waveLength * 2} ${currentY} V ${height} H ${-move} Z`,
    };
  });

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, goal);
    setWater(newWater);
    level.value = withSpring(newWater / goal, { damping: 15, stiffness: 60 });
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory([{ id: Date.now(), date: Date.now(), time: timeString, amount }, ...history]);
  };

  const reset = async () => {
    setWater(0);
    level.value = withTiming(0);
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const getDayLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.getDate() === today.getDate()) return 'Today';
    return 'Yesterday';
  };

  if (!isReady) return null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

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
          <Text style={styles.headerTitle}>Hydration</Text>
          <Text style={styles.headerSub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short' })}</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.amountText}>{water}<Text style={styles.unitText}>ml</Text></Text>
              <Text style={styles.goalText}>Goal: {goal}ml</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{Math.round((water / goal) * 100)}%</Text>
            </View>
          </View>
          <View style={styles.buttonGrid}>
             {[150, 250, 500].map((amt) => (
               <TouchableOpacity key={amt} style={styles.pixelButton} onPress={() => addWater(amt)} activeOpacity={0.7}>
                 <Text style={styles.buttonText}>+{amt}</Text>
               </TouchableOpacity>
             ))}
          </View>
        </View>

        <View style={styles.historyBox}>
          <View style={styles.sectionHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <Text style={styles.remainingText}>{goal - water > 0 ? `${goal - water}ml remaining` : 'Goal Reached! 🎉'}</Text>
          </View>
          
          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
               <Feather name="droplet" size={16} color="#74777F" />
               <Text style={styles.emptyText}>No logs for the past 48 hours</Text>
            </View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.logItem}>
                <View>
                  <Text style={styles.logTime}>{item.time}</Text>
                  <Text style={styles.logDay}>{getDayLabel(item.date)}</Text>
                </View>
                <Text style={styles.logAmount}>+{item.amount} ml</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.tabActive}>
          <View style={styles.indicatorActive}>
            <Feather name="home" size={20} color="#001D36" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.tab} onPress={reset}>
          <Feather name="refresh-cw" size={20} color="#44474E" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  waterContainer: { position: 'absolute', width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 28, marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1C1E', letterSpacing: -0.5 },
  headerSub: { fontSize: 16, color: '#74777F', fontWeight: '500' },
  mainCard: { marginHorizontal: 20, backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#E0E2EC', elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 52, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 20, fontWeight: '400', color: '#74777F' },
  goalText: { fontSize: 14, color: '#74777F', marginTop: -4 },
  badge: { backgroundColor: '#D1E4FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#001D36', fontWeight: '800', fontSize: 14 },
  buttonGrid: { flexDirection: 'row', marginTop: 28, gap: 12 },
  pixelButton: { flex: 1, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', paddingVertical: 14, borderRadius: 20, borderWidth: 1, borderColor: '#D7E3F7' },
  buttonText: { color: '#001D36', fontWeight: '700', fontSize: 15 },
  historyBox: { marginTop: 32, paddingHorizontal: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 },
  historyTitle: { fontSize: 20, fontWeight: '700', color: '#1A1C1E' },
  remainingText: { fontSize: 13, color: '#0061A4', fontWeight: '600' },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#FFF', borderRadius: 24, marginBottom: 10, borderWidth: 1, borderColor: '#F0F3F8' },
  logTime: { color: '#1A1C1E', fontWeight: '700', fontSize: 15 },
  logDay: { color: '#74777F', fontSize: 12, fontWeight: '500' },
  logAmount: { color: '#0061A4', fontWeight: '800', fontSize: 16 },
  emptyContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9', padding: 16, borderRadius: 20, gap: 8 },
  emptyText: { color: '#74777F', fontSize: 13, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F3F8', paddingBottom: 10 },
  tab: { width: 60, height: 40, justifyContent: 'center', alignItems: 'center' },
  tabActive: { width: 60, height: 40, justifyContent: 'center', alignItems: 'center' },
  indicatorActive: { backgroundColor: '#D1E4FF', paddingHorizontal: 20, paddingVertical: 4, borderRadius: 20 }
});
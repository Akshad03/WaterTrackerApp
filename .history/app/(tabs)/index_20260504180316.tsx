import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
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

const STORAGE_KEY = '@water_tracker_data';
const TWO_DAYS_MS = 2 * 24 * 60 * 60 * 1000;
const GOAL = 4000;

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// --- WATER DROP LOADER COMPONENT ---
function WaterLoader() {
  const fillProgress = useSharedValue(0);

  useEffect(() => {
    fillProgress.value = withTiming(1, { duration: 2500, easing: Easing.out(Easing.quad) });
  }, []);

  const fillStyle = useAnimatedStyle(() => ({
    // Moves the water from bottom (80px) to top (0px)
    transform: [{ translateY: 80 - (fillProgress.value * 80) }],
  }));

  return (
    <View style={styles.loaderWrapper}>
      <View style={styles.dropContainer}>
        <View style={styles.dropShape}>
          {/* Counter-rotate the inner view to keep water vertical */}
          <View style={styles.verticalWaterWrapper}>
            <Animated.View style={[styles.actualWater, fillStyle]} />
          </View>
        </View>
      </View>
      <Text style={styles.loaderText}>Filling your bottle...</Text>
    </View>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [water, setWater] = useState(0);
  const [history, setHistory] = useState<{ id: number, date: number, time: string, amount: number }[]>([]);
  
  const level = useSharedValue(0);
  const waveHorizontal = useSharedValue(0);

  useEffect(() => {
    async function initialize() {
      try {
        await Promise.all([
          registerForPushNotificationsAsync(),
          loadData(),
          new Promise(resolve => setTimeout(resolve, 2600)) // Let animation finish
        ]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, []);

  const loadData = async () => {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY);
    if (savedData) {
      const { savedWater, savedHistory } = JSON.parse(savedData);
      const now = Date.now();
      const filteredHistory = savedHistory.filter((item: any) => (now - item.date) < TWO_DAYS_MS);
      setWater(savedWater);
      setHistory(filteredHistory);
      level.value = savedWater / GOAL;
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ savedWater: water, savedHistory: history }));
    }
  }, [water, history]);

  useEffect(() => {
    waveHorizontal.value = withRepeat(
      withTiming(1, { duration: 7000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedWaveProps = useAnimatedProps(() => {
    const move = waveHorizontal.value * width;
    const currentY = height * (1 - level.value);
    const amplitude = level.value > 0 ? 15 : 0;
    return {
      d: `M ${-move} ${currentY} 
          Q ${-move + width * 0.25} ${currentY - amplitude}, ${-move + width * 0.5} ${currentY} 
          T ${-move + width} ${currentY} 
          Q ${-move + width * 1.25} ${currentY - amplitude}, ${-move + width * 1.5} ${currentY} 
          T ${-move + width * 2} ${currentY} 
          V ${height} H ${-move} Z`,
    };
  });

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) return;
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return;
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  }

  const addWater = (amount: number) => {
    const newWater = Math.min(water + amount, GOAL);
    setWater(newWater);
    level.value = withSpring(newWater / GOAL, { damping: 15, stiffness: 60 });
    const now = new Date();
    setHistory([{ id: Date.now(), date: Date.now(), time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), amount }, ...history]);
  };

  const reset = async () => {
    setWater(0);
    level.value = withTiming(0);
    setHistory([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  if (!isReady) return <WaterLoader />;

  return (
    <Animated.View onLayout={onLayoutRootView} entering={FadeIn} style={styles.container}>
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
          <Text style={styles.headerTitle}>Hydration Tracker</Text>
          <Text style={styles.headerSub}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short' })}</Text>
        </View>
        <View style={styles.mainCard}>
          <View style={styles.statsRow}>
            <View>
              <Text style={styles.amountText}>{water}<Text style={styles.unitText}>ml</Text></Text>
              <Text style={styles.goalText}>Target: {GOAL}ml</Text>
            </View>
            <View style={styles.badge}><Text style={styles.badgeText}>{Math.round((water / GOAL) * 100)}%</Text></View>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.historyTitle}>History</Text>
            <Text style={styles.remainingText}>{GOAL - water > 0 ? `${GOAL - water}ml left` : 'Goal Met! 🎉'}</Text>
          </View>
          {history.length === 0 ? (
            <View style={styles.emptyContainer}><Text style={styles.emptyText}>No recent logs</Text></View>
          ) : (
            history.map((item) => (
              <View key={item.id} style={styles.logItem}>
                <View><Text style={styles.logTime}>{item.time}</Text><Text style={styles.logDay}>Today</Text></View>
                <Text style={styles.logAmount}>+{item.amount} ml</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.tabActive}><View style={styles.indicatorActive}><Feather name="home" size={20} color="#001D36" /></View></TouchableOpacity>
        <TouchableOpacity style={styles.tab} onPress={reset}><Feather name="refresh-cw" size={20} color="#44474E" /></TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFF' },
  // --- LOADER STYLES ---
  loaderWrapper: { flex: 1, backgroundColor: '#F8FAFF', justifyContent: 'center', alignItems: 'center' },
  dropContainer: { width: 80, height: 80, justifyContent: 'center', alignItems: 'center' },
  dropShape: {
    width: 60, height: 60, backgroundColor: '#E1E9F4', 
    borderTopLeftRadius: 0, borderTopRightRadius: 60, borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    transform: [{ rotate: '-45deg' }], overflow: 'hidden', borderWidth: 3, borderColor: '#0061A4',
  },
  verticalWaterWrapper: { 
    width: 100, height: 100, transform: [{ rotate: '45deg' }], 
    position: 'absolute', top: -20, left: -20 
  },
  actualWater: { width: '100%', height: '100%', backgroundColor: '#0061A4', position: 'absolute', bottom: -100 },
  loaderText: { marginTop: 40, fontSize: 18, fontWeight: '700', color: '#0061A4' },
  // --- MAIN APP STYLES ---
  waterContainer: { position: 'absolute', width: '100%', height: '100%' },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 28, marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#1A1C1E' },
  headerSub: { fontSize: 16, color: '#74777F' },
  mainCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 32, padding: 24, borderWidth: 1, borderColor: '#E0E2EC' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amountText: { fontSize: 52, fontWeight: '800', color: '#1A1C1E' },
  unitText: { fontSize: 20, fontWeight: '400', color: '#74777F' },
  goalText: { fontSize: 14, color: '#74777F' },
  badge: { backgroundColor: '#D1E4FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#001D36', fontWeight: '800' },
  buttonGrid: { flexDirection: 'row', marginTop: 28, gap: 12 },
  pixelButton: { flex: 1, backgroundColor: '#F1F4F9', paddingVertical: 14, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: '#D7E3F7' },
  buttonText: { color: '#001D36', fontWeight: '700' },
  historyBox: { marginTop: 32, paddingHorizontal: 28 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  historyTitle: { fontSize: 20, fontWeight: '700' },
  remainingText: { fontSize: 13, color: '#0061A4' },
  logItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderRadius: 24, marginBottom: 10, borderWidth: 1, borderColor: '#F0F3F8' },
  logTime: { fontWeight: '700' },
  logDay: { color: '#74777F', fontSize: 12 },
  logAmount: { color: '#0061A4', fontWeight: '800' },
  emptyContainer: { backgroundColor: '#F1F4F9', padding: 16, borderRadius: 20 },
  emptyText: { color: '#74777F', textAlign: 'center' },
  footer: { position: 'absolute', bottom: 0, width: '100%', height: 70, backgroundColor: '#FFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F3F8' },
  tabActive: { width: 60, height: 40, justifyContent: 'center', alignItems: 'center' },
  tab: { width: 60, height: 40, justifyContent: 'center', alignItems: 'center' },
  indicatorActive: { backgroundColor: '#D1E4FF', paddingHorizontal: 20, paddingVertical: 4, borderRadius: 20 }
});
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
  }, [water]);

  const loadData = async () => {
    const saved = await AsyncStorage.getItem('water');
    if (saved) setWater(parseInt(saved));
  };

  const saveData = async () => {
    await AsyncStorage.setItem('water', water.toString());
  };

  const addWater = () => {
    setWater(prev => Math.min(prev + 250, goal));
  };

  const reset = () => setWater(0);

  const progress = water / goal;

  return (
    <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.container}>
      
      {/* Title */}
      <Text style={styles.title}>Water Tracker</Text>

      {/* Circle */}
      <View style={styles.circleContainer}>
        <Progress.Circle
          size={220}
          progress={progress}
          thickness={12}
          color="#ffffff"
          unfilledColor="rgba(255,255,255,0.2)"
          showsText={true}
          formatText={() => `${water} ml`}
          textStyle={styles.circleText}
        />
        <Text style={styles.goalText}>Goal: {goal} ml</Text>
      </View>

      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={addWater}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Reset */}
      <TouchableOpacity onPress={reset}>
        <Text style={styles.reset}>Reset</Text>
      </TouchableOpacity>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },

  title: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
  },

  circleContainer: {
    alignItems: 'center',
  },

  circleText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  goalText: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  fab: {
    backgroundColor: '#fff',
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  fabText: {
    fontSize: 32,
    color: '#0284c7',
    fontWeight: 'bold',
  },

  reset: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
});
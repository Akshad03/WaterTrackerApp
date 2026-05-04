import WaterDrop from '@/components/WaterDrop';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';


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
    <View style={styles.container}>
      
      {/* Header */}
      <Text style={styles.title}>💧 Water Tracker</Text>

      {/* Card */}
      <View style={styles.card}>
        <WaterDrop water={water} goal={goal} />

        <Text style={styles.goal}>Goal: {goal} ml</Text>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.button} onPress={addWater}>
        <Text style={styles.buttonText}>+ Add Water</Text>
      </TouchableOpacity>

      {/* Reset */}
      <TouchableOpacity onPress={reset}>
        <Text style={styles.reset}>Reset</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 20,
  },

  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 30,
  },

  circleText: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: 'bold',
  },

  goal: {
    marginTop: 10,
    color: '#64748b',
  },

  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  reset: {
    marginTop: 15,
    color: '#94a3b8',
  },
});
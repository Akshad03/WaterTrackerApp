import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000; // ml

  const addWater = () => {
    setWater(prev => Math.min(prev + 250, goal));
  };

  const percentage = Math.round((water / goal) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💧 Water Tracker</Text>

      <Text style={styles.progress}>{water} ml / {goal} ml</Text>
      <Text style={styles.percent}>{percentage}%</Text>

      <TouchableOpacity style={styles.button} onPress={addWater}>
        <Text style={styles.buttonText}>+ Add 250ml</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#38bdf8',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  progress: {
    fontSize: 18,
    color: '#e2e8f0',
  },
  percent: {
    fontSize: 40,
    color: '#22c55e',
    fontWeight: 'bold',
    marginVertical: 20,
  },
  button: {
    backgroundColor: '#38bdf8',
    padding: 15,
    borderRadius: 12,
  },
  buttonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
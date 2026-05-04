import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  const addWater = () => {
    setWater(prev => Math.min(prev + 250, goal));
  };

  const reset = () => setWater(0);

  const progress = water / goal;

  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <Text style={styles.title}>💧 Water Tracker</Text>

      <View style={styles.card}>
        <Progress.Circle
          size={180}
          progress={progress}
          showsText={true}
          formatText={() => `${water} ml`}
          color="#38bdf8"
          thickness={10}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={addWater}>
        <Text style={styles.buttonText}>+ Add 250ml</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resetButton} onPress={reset}>
        <Text style={styles.resetText}>Reset</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#38bdf8',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#38bdf8',
    padding: 15,
    borderRadius: 12,
    width: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f172a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButton: {
    marginTop: 15,
  },
  resetText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
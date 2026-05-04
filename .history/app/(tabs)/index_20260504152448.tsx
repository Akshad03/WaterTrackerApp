import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  const addWater = () => {
    setWater(prev => Math.min(prev + 250, goal));
  };

  const progress = water / goal;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💧 Water Tracker</Text>

      <Progress.Circle
        size={180}
        progress={progress}
        showsText={true}
        formatText={() => `${water} ml`}
        color="#38bdf8"
        thickness={10}
      />

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
    marginBottom: 30,
  },
  button: {
    marginTop: 30,
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
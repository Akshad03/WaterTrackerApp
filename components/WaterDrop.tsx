import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

export default function App() {
  const [water, setWater] = useState(0);
  const goal = 2000;

  const progress = water / goal;

  const height = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${height.value}%`,
    };
  });

  const addWater = () => {
    const newWater = Math.min(water + 250, goal);
    setWater(newWater);

    height.value = withTiming((newWater / goal) * 100, {
      duration: 600,
    });
  };

  return (
    <View style={styles.container}>

      {/* Water Fill */}
      <Animated.View style={[styles.water, animatedStyle]} />

      {/* Content */}
      <View style={styles.overlay}>
        <Text style={styles.title}>Water Tracker</Text>
        <Text style={styles.amount}>{water} ml</Text>

        <TouchableOpacity style={styles.button} onPress={addWater}>
          <Text style={styles.buttonText}>+ Add Water</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'flex-end',
  },

  water: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#38bdf8',
  },

  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111',
  },

  amount: {
    fontSize: 40,
    fontWeight: 'bold',
    marginVertical: 20,
  },

  button: {
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 12,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
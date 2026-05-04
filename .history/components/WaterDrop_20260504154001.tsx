import { StyleSheet, Text, View } from 'react-native';

export default function WaterDrop({ water, goal }: any) {
  const percentage = water / goal;

  return (
    <View style={styles.container}>
      <View style={styles.drop}>
        <View style={[styles.fill, { height: `${percentage * 100}%` }]} />
        <Text style={styles.text}>{water}</Text>
        <Text style={styles.sub}>ML</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  drop: {
    width: 200,
    height: 260,
    backgroundColor: '#e5e7eb',
    borderRadius: 120,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fill: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#0ea5e9',
  },

  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#000',
  },

  sub: {
    fontSize: 14,
    color: '#555',
  },
});
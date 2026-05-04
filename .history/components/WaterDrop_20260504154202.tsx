import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

export default function WaterDrop({ water, goal }: any) {
  const percentage = water / goal;
  const fillHeight = 300 * percentage; // adjust height

  return (
    <View style={styles.container}>
      <Svg width={200} height={260} viewBox="0 0 200 260">
        
        <Defs>
          <ClipPath id="clip">
            <Path d="M100 0 C140 60 190 120 100 260 C10 120 60 60 100 0 Z" />
          </ClipPath>
        </Defs>

        {/* Background (empty drop) */}
        <Path
          d="M100 0 C140 60 190 120 100 260 C10 120 60 60 100 0 Z"
          fill="#e5e7eb"
        />

        {/* Water fill */}
        <Rect
          x="0"
          y={260 - fillHeight}
          width="200"
          height={fillHeight}
          fill="#0ea5e9"
          clipPath="url(#clip)"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
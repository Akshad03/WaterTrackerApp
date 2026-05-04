import { StyleSheet, View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

export default function WaterDrop({ water, goal }: any) {
  const pct = Math.max(0, Math.min(1, water / goal));
  const H = 300; // internal height for math
  const W = 200;

  const fillHeight = H * pct;

  // 🔷 Clean, symmetric drop path (teardrop)
  const d = `
    M100 10
    C100 10, 170 95, 170 155
    C170 225, 125 290, 100 290
    C75 290, 30 225, 30 155
    C30 95, 100 10, 100 10
    Z
  `;

  return (
    <View style={styles.container}>
      <Svg width={W} height={H} viewBox="0 0 200 300">
        <Defs>
          <ClipPath id="clip">
            <Path d={d} />
          </ClipPath>
        </Defs>

        {/* Outline (gives real shape clarity) */}
        <Path
          d={d}
          fill="#ffffff"
          stroke="#d1d5db"
          strokeWidth={2}
        />

        {/* Water fill */}
        <Rect
          x="0"
          y={H - fillHeight}
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
import { View } from 'react-native';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';

export default function WaterDrop({ water, goal }: any) {
  const pct = water / goal;
  const height = 300;
  const fillHeight = height * pct;

  // 🔥 PASTE YOUR EXACT PATH HERE
  const d = "PASTE_YOUR_SVG_PATH_HERE";

  return (
    <View>
      <Svg width={200} height={300} viewBox="0 0 200 300">
        <Defs>
          <ClipPath id="clip">
            <Path d={d} />
          </ClipPath>
        </Defs>

        {/* Outline */}
        <Path d={d} fill="#fff" stroke="#ddd" strokeWidth={2} />

        {/* Fill */}
        <Rect
          x="0"
          y={300 - fillHeight}
          width="200"
          height={fillHeight}
          fill="#0ea5e9"
          clipPath="url(#clip)"
        />
      </Svg>
    </View>
  );
}
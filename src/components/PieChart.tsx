import React from 'react';
import {View, ViewStyle} from 'react-native';
import Svg, {Path, Text as SvgText, Circle} from 'react-native-svg';

export type PieData = {
  value: number;
  color: string;
  label?: string;
};

export type PieChartProps = {
  data: PieData[];
  size?: number;
  fontSize?: number; // ukuran angka di dalam slice
  fontColor?: string; // warna angka
  strokeColor?: string; // warna RING LUAR (bukan garis antar-slice)
  strokeWidth?: number; // tebal RING LUAR
  style?: ViewStyle;
};

/** Buat path sector pie (dari pusat). */
function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = {
    x: cx + r * Math.cos((Math.PI * startAngle) / 180),
    y: cy + r * Math.sin((Math.PI * startAngle) / 180),
  };
  const end = {
    x: cx + r * Math.cos((Math.PI * endAngle) / 180),
    y: cy + r * Math.sin((Math.PI * endAngle) / 180),
  };
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
  // sweep-flag = 1 agar mengikuti arah jarum jam
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 160,
  fontSize = 16,
  fontColor = '#fff',
  strokeColor = '#E6E6E6', // ring luar tipis
  strokeWidth = 3,
  style,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  // beri padding kecil agar ring tidak “ketok” tepi SVG
  const r = size / 2 - 4;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -90;

  const getTextPos = (
    start: number,
    end: number,
    radius: number,
  ): {x: number; y: number} => {
    const angle = ((start + end) / 2) * (Math.PI / 180);
    const x = cx + radius * 0.62 * Math.cos(angle);
    const y = cy + radius * 0.62 * Math.sin(angle);
    return {x, y};
  };

  return (
    <View style={style}>
      <Svg width={size} height={size}>
        {/* slice tanpa stroke supaya tidak muncul “tanda +” di tengah */}
        {data.map((slice, idx) => {
          const angle = (slice.value / total) * 360;
          const endAngle = startAngle + angle;
          const path = describeArc(cx, cy, r, startAngle, endAngle);
          const {x, y} = getTextPos(startAngle, endAngle, r);
          startAngle += angle;
          return (
            <React.Fragment key={idx}>
              <Path d={path} fill={slice.color} />
              <SvgText
                x={x}
                y={y + fontSize / 3}
                fontSize={fontSize}
                fontWeight="700"
                fill={fontColor}
                textAnchor="middle">
                {slice.value}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* ring luar tipis (outline abu-abu) */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </Svg>
    </View>
  );
};

export default PieChart;

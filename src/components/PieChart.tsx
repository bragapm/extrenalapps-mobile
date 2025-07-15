import React from 'react';
import {View, ViewStyle} from 'react-native';
import Svg, {Path, Text as SvgText} from 'react-native-svg';

export type PieData = {
  value: number;
  color: string;
  label?: string;
};

export type PieChartProps = {
  data: PieData[];
  size?: number;
  fontSize?: number;
  fontColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  style?: ViewStyle;
};

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
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ');
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 140,
  fontSize = 18,
  fontColor = '#fff',
  strokeColor = '#fff',
  strokeWidth = 3,
  style,
}) => {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - strokeWidth / 2;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = -90;

  // posisi value di tengah slice
  const getTextPosition = (
    start: number,
    end: number,
    radius: number,
  ): {x: number; y: number} => {
    const angle = ((start + end) / 2) * (Math.PI / 180);
    const x = cx + radius * 0.65 * Math.cos(angle);
    const y = cy + radius * 0.65 * Math.sin(angle);
    return {x, y};
  };

  return (
    <View style={style}>
      <Svg width={size} height={size}>
        {data.map((slice, idx) => {
          const angle = (slice.value / total) * 360;
          const endAngle = startAngle + angle;
          const path = describeArc(cx, cy, r, startAngle, endAngle);
          const {x, y} = getTextPosition(startAngle, endAngle, r);
          const value = slice.value;
          startAngle += angle;
          return (
            <React.Fragment key={idx}>
              <Path
                d={path}
                fill={slice.color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
              <SvgText
                x={x}
                y={y + fontSize / 3}
                fontSize={fontSize}
                fontWeight="bold"
                fill={fontColor}
                textAnchor="middle"
                alignmentBaseline="middle">
                {value}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

export default PieChart;

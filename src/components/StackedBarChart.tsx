import React from 'react';
import {ScrollView, Dimensions, View} from 'react-native';
import Svg, {Rect, G, Text as SvgText} from 'react-native-svg';

type BarData = {
  label: string; // Label bawah bar (ex: month, name)
  values: number[]; // Boleh 1 atau 2 item, misal [10] atau [7, 3]
  colors: string[]; // Harus sama jumlahnya dengan values, misal ['#2996F5'] atau ['#2996F5', '#E24B3B']
};

type StackedBarChartProps = {
  data: BarData[];
  height?: number;
  maxY?: number;
  labelColor?: string;
  barWidth?: number;
  barRadius?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  chartWidthPerBar?: number; // optional, for gap control
};

const StackedBarChart: React.FC<StackedBarChartProps> = ({
  data,
  height = 300,
  maxY = 30,
  labelColor = '#888',
  barWidth = 30,
  barRadius = 4,
  paddingLeft = 16,
  paddingRight = 16,
  paddingTop = 40,
  paddingBottom = 30,
  chartWidthPerBar = 40,
}) => {
  // width = (chartWidthPerBar * data.length) + paddingLeft + paddingRight
  const chartWidth = chartWidthPerBar * data.length;
  const svgWidth = chartWidth + paddingLeft + paddingRight;
  const CHART_HEIGHT = height - paddingTop - paddingBottom;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={svgWidth} height={height}>
        {/* Y Grid */}
        {[...Array(7)].map((_, i) => {
          const y = paddingTop + (CHART_HEIGHT * i) / 6;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth}
                height={1}
                fill="#eee"
              />
              {/* Y axis number (optional) */}
              {/* <SvgText
                x={paddingLeft - 8}
                y={y + 6}
                fontSize={12}
                fill={labelColor}
                textAnchor="end"
                fontWeight="400">
                {Math.round(maxY - (i * maxY) / 6)}
              </SvgText> */}
            </G>
          );
        })}

        {/* Bars */}
        {data.map((bar, i) => {
          const barBottomMargin = 16;
          const x =
            paddingLeft +
            i * chartWidthPerBar +
            (chartWidthPerBar - barWidth) / 2;
          let y = paddingTop + CHART_HEIGHT; // Start dari bawah
          return (
            <G key={i}>
              {/* Draw each part of the stack (bottom to top) */}
              {bar.values.map((value, idx) => {
                const h = (value / maxY) * CHART_HEIGHT;
                y -= h;
                return (
                  <Rect
                    key={idx}
                    x={x}
                    y={y}
                    width={barWidth}
                    height={h}
                    fill={bar.colors[idx]}
                    rx={barRadius}
                  />
                );
              })}

              {/* Value label di atas bar (hanya tampil kalau cukup tinggi) */}
              {bar.values.map((value, idx) => {
                const totalPrev = bar.values
                  .slice(0, idx)
                  .reduce((a, b) => a + b, 0);
                const h = (value / maxY) * CHART_HEIGHT;
                const yLabel =
                  paddingTop +
                  CHART_HEIGHT -
                  ((totalPrev + value / 2) / maxY) * CHART_HEIGHT;
                return value > 0 ? (
                  <SvgText
                    key={idx}
                    x={x + barWidth / 2}
                    y={yLabel}
                    fontSize={14}
                    fontWeight="bold"
                    fill={h > 20 ? '#fff' : bar.colors[idx]}
                    textAnchor="middle"
                    alignmentBaseline="middle">
                    {value}
                  </SvgText>
                ) : null;
              })}

              {/* Label bawah */}
              <SvgText
                x={x + barWidth / 2}
                y={paddingTop + CHART_HEIGHT + 22}
                fontSize={12}
                fill={labelColor}
                textAnchor="middle">
                {bar.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </ScrollView>
  );
};

export default StackedBarChart;

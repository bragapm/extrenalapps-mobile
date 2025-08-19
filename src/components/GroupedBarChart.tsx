import React from 'react';
import {ScrollView} from 'react-native';
import Svg, {Rect, G, Text as SvgText} from 'react-native-svg';

const COLOR_OPEN = '#2996F5'; // biru
const COLOR_CLOSE = '#20D372'; // hijau

const GroupedBarChart = ({
  data = [],
  height = 350,
  maxY = 30,
  labelColor = '#888',
  barWidth = 32,
  barRadius = 2,
  paddingLeft = 16,
  paddingRight = 16,
  paddingTop = 22,
  paddingBottom = 30,
  groupGap = 12, // JARAK antar group, KECIL BANGET
  barGap = 0, // SUPAYA DEMPET TOTAL!
  // ⬇️ Tambahan: minimal tinggi bar saat value > 0
  minBarHeight = 25,
}) => {
  // Width satu group = 2 bar (tanpa barGap)
  const groupWidth = 2 * barWidth + barGap;
  const chartWidth = data.length * groupWidth + (data.length - 1) * groupGap;
  const svgWidth = chartWidth + paddingLeft + paddingRight;
  const CHART_HEIGHT = height - paddingTop - paddingBottom;

  // Helper: hitung tinggi & y dengan minimal height bila value > 0
  const getBarDims = (value: number) => {
    const scaled = (value / maxY) * CHART_HEIGHT;
    const useHeight = value > 0 ? Math.max(scaled, minBarHeight) : 0;
    const y = paddingTop + CHART_HEIGHT - useHeight;
    return {height: useHeight, y};
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <Svg width={svgWidth} height={height}>
        {/* Y GRID */}
        {[...Array(5)].map((_, i) => {
          const y = paddingTop + (CHART_HEIGHT * i) / 4;
          return (
            <G key={i}>
              <Rect
                x={paddingLeft}
                y={y}
                width={chartWidth}
                height={1}
                fill="#eee"
              />
            </G>
          );
        })}

        {/* BARS */}
        {data.map((bar, i) => {
          // Mulai group
          const x0 = paddingLeft + i * (groupWidth + groupGap);

          // BAR OPEN (KIRI)
          const {height: openHeight, y: yOpen} = getBarDims(bar.open);
          const xOpen = x0;

          // BAR CLOSE (KANAN)
          const {height: closeHeight, y: yClose} = getBarDims(bar.close);
          const xClose = x0 + barWidth + barGap; // barGap = 0 (megang bar kanan)

          return (
            <G key={bar.label}>
              {/* OPEN */}
              <Rect
                x={xOpen}
                y={yOpen}
                width={barWidth}
                height={openHeight}
                fill={COLOR_OPEN}
                rx={barRadius}
              />
              {/* CLOSE */}
              <Rect
                x={xClose}
                y={yClose}
                width={barWidth}
                height={closeHeight}
                fill={COLOR_CLOSE}
                rx={barRadius}
              />

              {/* LABEL ATAS */}
              {bar.open > 0 && (
                <SvgText
                  x={xOpen + barWidth / 2}
                  y={yOpen + 16}
                  fontSize={14}
                  fontWeight="bold"
                  fill="#fff"
                  textAnchor="middle"
                  alignmentBaseline="middle">
                  {bar.open}
                </SvgText>
              )}
              {bar.close > 0 && (
                <SvgText
                  x={xClose + barWidth / 2}
                  y={yClose + 16}
                  fontSize={14}
                  fontWeight="bold"
                  fill="#fff"
                  textAnchor="middle"
                  alignmentBaseline="middle">
                  {bar.close}
                </SvgText>
              )}

              {/* LABEL BAWAH */}
              <SvgText
                x={x0 + groupWidth / 2}
                y={paddingTop + CHART_HEIGHT + 22}
                fontSize={13}
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

export default GroupedBarChart;

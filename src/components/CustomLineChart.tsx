import React from 'react';
import {View, Dimensions, Text} from 'react-native';
import {LineChart} from 'react-native-chart-kit';

// Flexible, bisa 1 garis atau lebih!

export interface Dataset {
  data: number[];
  strokeWidth?: number;
  withDots?: boolean;
  color?: (opacity: number) => string; // HAPUS ini! (tidak dipakai react-native-chart-kit dataset)
}

export interface CustomLineChartProps {
  labels: string[];
  datasets: Dataset[];
  height?: number;
  dotSize?: number;
  chartConfigOverride?: object;
}

const CustomLineChart: React.FC<CustomLineChartProps> = ({
  labels = [],
  datasets = [],
  height = 180,
  dotSize = 6,
  chartConfigOverride = {},
}) => {
  const chartWidth = Math.min(Dimensions.get('window').width - 30, 365);
  return (
    <View style={{
        marginLeft:-12
    }}>
      <LineChart
        data={{
          labels,
          datasets: datasets.map(ds => ({
            data: ds.data,
            color: ds.color,
            strokeWidth: ds.strokeWidth || 3,
            withDots: ds.withDots !== false,
          })),
        }}
        width={chartWidth}
        height={height}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#F7F7F7',
          backgroundGradientTo: '#F7F7F7',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(34, 34, 34, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(136, 136, 136, ${opacity})`,
          style: {borderRadius: 12},
          propsForDots: {
            r: String(dotSize),
            strokeWidth: '2',
            stroke: '#fff',
          },
          ...chartConfigOverride,
        }}
        style={{
          marginVertical: 8,
          borderRadius: 12,
        }}
        withShadow={false}
        withInnerLines={true}
        withOuterLines={true}
        withDots={true}
        fromZero={true}
      />
    </View>
  );
};

export default CustomLineChart;

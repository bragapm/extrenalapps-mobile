import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  StatusBar,
  Image,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  FlatList,
  ScrollView,
} from 'react-native';
import {useThemeStore} from '../../theme/useThemeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppHeader from '../../components/AppHeader';
import {BarChart} from 'react-native-chart-kit';
import Svg, {Rect, G, Text as SvgText} from 'react-native-svg';
import {useUserStore} from '../../store/userStore';
import HistoryAttendance from '../../components/HistoryAttendance';
import TodayStatistics from '../../components/TodayStatistics';
import OragnizationalStructure from '../../components/OragnizationalStructure';
import CustomLineChart from '../../components/CustomLineChart';
import {
  dummyStats,
  dummyHistory,
  dummySummary,
  dummyCutiChart,
  rekapCuti,
  dummyCutiRekap,
  dummyPerjadinChart,
  rekapPerjadin,
  dummyAdminAbsensiTrend,
  dummyAdminMonitoringAbsensi,
  dummyAdminCutiMonitoring,
  dummyAdminCutiTrend,
  dummyAdminPerjadinMonitoring,
  dummyAdminPerjadinTrend,
  dummyLiveAbsensi,
  dummyTotalEmployee,
} from '../../data/dummy.ts';
import TotalEmployee from '../../components/TotalEmployee.tsx';
import {useFeatureStore} from '../../store/featureStore.ts';
import DashboardAbsensi from '../DashboardAbsensi/index.tsx';
import DashboardReport from '../DashboardReport/index.tsx';
import {Calendar, LocaleConfig} from 'react-native-calendars';import PlanCalendar from '../DashboardPlanWorker/index.tsx';
;

type StackedBarChartData = {
  month: string;
  hadir?: number;
  tidak_hadir?: number;
};

type CustomStackedBarChartProps = {
  data: StackedBarChartData[];
  height?: number;
  maxY?: number;
  barColor1?: string;
  barColor2?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

type StackedBarCutiChartData = {
  month: string;
  cuti?: number;
  tidak_hadir?: number;
};

type CustomStackedBarCutiChartProps = {
  data: StackedBarCutiChartData[];
  height?: number;
  maxY?: number;
  barColor?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

type StackedBarPerdinChartData = {
  month: string;
  cuti?: number;
  tidak_hadir?: number;
};

type CustomStackedBarPerdinChartProps = {
  data: StackedBarPerdinChartData[];
  height?: number;
  maxY?: number;
  barColor?: string;
  labelColor?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
};

const HomeScreen: React.FC = () => {
  const activeMenu = useFeatureStore(state => state.activeMenu);
  const {colors} = useThemeStore();
  const colorScheme = useColorScheme();
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = screenWidth * 0.85;
  const imageHeight = imageWidth * (115 / screenWidth);

  const [role, setRole] = useState('');
  const [summary, setSummary] = useState(dummySummary);
  const userLocation = useUserStore(state => state.location);
  console.log('userLocation', userLocation);

  const sections = React.useMemo(() => {
    if (role === 'admin' || role === 'BOD') {
      return [
        {type: 'stat', title: 'Statistik - Hari Ini', data: dummyStats},
        {
          type: 'total-employee',
          title: 'Total Employee',
          data: dummyTotalEmployee,
        },
        {type: 'live-absensi-admin'},
        {type: 'org', title: 'Struktur Organisasi'},
        {
          type: 'summary-admin',
          title: 'Summary Absensi',
          trendData: dummyAdminAbsensiTrend,
          monitoringData: dummyAdminMonitoringAbsensi,
        },
        {
          type: 'cuti-admin',
        },
        {
          type: 'perjadin-admin',
        },
      ];
    } else {
      return [
        {type: 'stat', title: 'Statistik - Hari Ini', data: dummyStats},
        {type: 'history', title: 'History Absensi', data: dummyHistory},
        {type: 'org', title: 'Struktur Organisasi'},
        {type: 'summary', title: 'Summary Absensi', data: dummySummary},
        {type: 'cuti', title: 'Cuti'},
        {type: 'perjadin', title: 'Perjalanan Dinas'},
      ];
    }
  }, [role]);

  const sectionsDashboardReport = React.useMemo(() => {
    if (role === 'admin' || role === 'BOD') {
      return [
        {type: 'report-admin', title: 'Laporan', data: dummyStats},
        {
          type: 'work-planner-admin',
          title: 'Rencana Kerja - Hari Ini',
          data: dummyTotalEmployee,
        },
      ];
    } else {
      return [
        {type: 'report', title: 'Laporan', data: dummyStats},
        {
          type: 'work-planner',
          title: 'Rencana Kerja - Hari Ini',
          data: dummyTotalEmployee,
        },
      ];
    }
  }, [role]);
  useEffect(() => {
    const getRole = async () => {
      const r = await AsyncStorage.getItem('userRole');
      setRole(r || '');
    };
    getRole();
  }, []);

  return (
    <>
      {activeMenu === 'absensi' && (
        <DashboardAbsensi
          sections={sections}
          role={role}
          dummyAdminAbsensiTrend={dummyAdminAbsensiTrend}
          dummyAdminMonitoringAbsensi={dummyAdminMonitoringAbsensi}
          dummyAdminCutiTrend={dummyAdminCutiTrend}
          dummyAdminCutiMonitoring={dummyAdminCutiMonitoring}
          dummyAdminPerjadinTrend={dummyAdminPerjadinTrend}
          dummyAdminPerjadinMonitoring={dummyAdminPerjadinMonitoring}
          dummyLiveAbsensi={dummyLiveAbsensi}
          dummyTotalEmployee={dummyTotalEmployee}
          dummyStats={dummyStats}
          dummyHistory={dummyHistory}
          dummySummary={dummySummary}
          dummyCutiChart={dummyCutiChart}
          rekapCuti={rekapCuti}
          dummyPerjadinChart={dummyPerjadinChart}
          rekapPerjadin={rekapPerjadin}
          // tambahkan jika ada data lain
          // ListHeaderComponent={ListHeaderComponent}
        />
      )}

      {activeMenu === 'laporan' && (
        <DashboardReport role={role} sections={sectionsDashboardReport} />
      )}
      {activeMenu === 'plan' && (
        <>
          <StatusBar
            translucent
            backgroundColor="transparent"
            barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          <View style={[styles.container, {backgroundColor: colors.bgHome}]}>
            <AppHeader />
            <PlanCalendar />
          </View>
        </>
      )}
    </>
  );
};

export default HomeScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: 'center',
  },
});

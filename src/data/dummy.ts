// src/data/dummyJson.ts
export const dummyStats = [
  {
    title: 'Jumlah Absen',
    value: '17/31',
    icon: require('../assets/images/ic-user.png'),
  },
  {
    title: 'Jumlah Cuti',
    value: '0/31',
    icon: require('../assets/images/ic-envelope.png'),
  },
  {
    title: 'Total Sakit',
    value: '0/31',
    icon: require('../assets/images/hospital-JP.png'),
  },
  {
    title: 'Alpha',
    value: '0/31',
    icon: require('../assets/images/ic-pause.png'),
  },
  {
    title: 'Total Perjadin',
    value: '0/31',
    icon: require('../assets/images/user-helmet-safety.png'),
  },
];

export const dummyTotalEmployee = [
  {
    title: 'Total Employee',
    value: '8',
    icon: require('../assets/images/ic-user.png'),
  },
  {
    title: 'Non Organic',
    value: '4',
    icon: require('../assets/icons/ic-stackeHolder-disable.png'),
  },
  {
    title: 'Total Employee',
    value: '8',
    icon: require('../assets/images/ic-user.png'),
  },
  {
    title: 'Non Organic',
    value: '4',
    icon: require('../assets/images/ic-user.png'),
  },
  {
    title: 'Organic',
    value: '4',
    icon: require('../assets/images/ic-user.png'),
  },
];

export const dummyHistory = [
  {type: 'Hadir', date: '23 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {type: 'Sakit', date: '24 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {type: 'Cuti', date: '24 Feb 2025', time: '09:00 WITA', status: 'On time'},
  {
    type: 'Perjalanan Dinas',
    date: '24 Feb 2025',
    time: '09:00 WITA',
    status: 'On time',
  },
];

export const dummySummary = {
  chart: [
    {month: 'Jan', hadir: 6, tidak_hadir: 3},
    {month: 'Feb', hadir: 8, tidak_hadir: 4},
    {month: 'Mar', hadir: 7, tidak_hadir: 3},
    {month: 'Apr', hadir: 8, tidak_hadir: 3},
    {month: 'Mei', hadir: 5, tidak_hadir: 2},
    {month: 'Jun', hadir: 8, tidak_hadir: 4},
    {month: 'Jul', hadir: 8, tidak_hadir: 4},
    {month: 'Agu', hadir: 8, tidak_hadir: 5},
    {month: 'Sep', hadir: 8, tidak_hadir: 5},
    {month: 'Okt', hadir: 8, tidak_hadir: 7},
    {month: 'Nov', hadir: 0, tidak_hadir: 14},
    {month: 'Des', hadir: 0, tidak_hadir: 14},
  ],
  rekap: [
    {minggu: 'Minggu ke-1', hadir: 5, tidak_hadir: 2},
    {minggu: 'Minggu ke-2', hadir: 3, tidak_hadir: 4},
    {minggu: 'Minggu ke-3', hadir: 1, tidak_hadir: 5},
    {minggu: 'Minggu ke-4', hadir: 3, tidak_hadir: 3},
  ],
};

export const dummyCutiChart = [
  {month: 'Jan', total_cuti: 6},
  {month: 'Feb', total_cuti: 8},
  {month: 'Mar', total_cuti: 8},
  {month: 'Apr', total_cuti: 9},
  {month: 'Mei', total_cuti: 5},
  {month: 'Jun', total_cuti: 8},
  {month: 'Jul', total_cuti: 8},
  {month: 'Agu', total_cuti: 8},
  {month: 'Sept', total_cuti: 8},
  {month: 'Okt', total_cuti: 8},
  {month: 'Nov', total_cuti: 8},
  {month: 'Des', total_cuti: 8},
];

export const rekapCuti = [
  {minggu: 'Minggu ke-1', total_cuti: 2},
  {minggu: 'Minggu ke-2', total_cuti: 2},
  {minggu: 'Minggu ke-3', total_cuti: 5},
  {minggu: 'Minggu ke-4', total_cuti: 3},
];

export const dummyCutiRekap = [18, 20, 24];

export const dummyPerjadinChart = [
  {month: 'Jan', total_perjadin: 6},
  {month: 'Feb', total_perjadin: 8},
  {month: 'Mar', total_perjadin: 8},
  {month: 'Apr', total_perjadin: 9},
  {month: 'Mei', total_perjadin: 5},
  {month: 'Jun', total_perjadin: 8},
  {month: 'Jul', total_perjadin: 8},
  {month: 'Agu', total_perjadin: 8},
  {month: 'Sept', total_perjadin: 8},
  {month: 'Okt', total_perjadin: 8},
  {month: 'Nov', total_perjadin: 8},
  {month: 'Des', total_perjadin: 8},
];

export const rekapPerjadin = [
  {minggu: 'Minggu ke-1', total_perjadin: 2},
  {minggu: 'Minggu ke-2', total_perjadin: 2},
  {minggu: 'Minggu ke-3', total_perjadin: 5},
  {minggu: 'Minggu ke-4', total_perjadin: 3},
];

export const dummyAdminAbsensiTrend = [
  // satu array per user (Priya, Ilam, dst)
  {
    name: 'Priya',
    color: '#2996F5', // Biru
    data: [8, 15, 11, 9, 12, 14, 13, 10, 11, 7, 10, 8],
  },
  {
    name: 'Ilam',
    color: '#14A44D', // Hijau
    data: [5, 12, 7, 8, 10, 11, 12, 14, 13, 9, 7, 6],
  },
  {
    name: 'Angel',
    color: '#E95B2A', // Orange
    data: [13, 17, 12, 14, 15, 13, 12, 11, 10, 11, 12, 14],
  },
  {
    name: 'David',
    color: '#E24B3B', // Merah
    data: [9, 10, 12, 11, 14, 12, 13, 10, 9, 10, 13, 12],
  },
  {
    name: 'Rina',
    color: '#A259D9', // Ungu
    data: [7, 8, 6, 9, 10, 8, 10, 12, 9, 11, 10, 8],
  },
  {
    name: 'Fahmi',
    color: '#F7C325', // Kuning
    data: [11, 13, 15, 13, 12, 10, 8, 9, 11, 12, 13, 14],
  },
  {
    name: 'Lina',
    color: '#3EC6E0', // Toska
    data: [10, 11, 10, 11, 12, 10, 11, 13, 10, 11, 13, 11],
  },
  {
    name: 'Budi',
    color: '#EEB82E', // Gold
    data: [6, 7, 5, 9, 8, 10, 9, 7, 8, 10, 9, 8],
  },
];

// Monitoring absensi (bisa sama dengan dummySummary.chart)
export const dummyAdminMonitoringAbsensi = [
  {month: 'Jan', hadir: 6, tidak_hadir: 3},
  {month: 'Feb', hadir: 8, tidak_hadir: 4},
  {month: 'Mar', hadir: 7, tidak_hadir: 3},
  {month: 'Apr', hadir: 8, tidak_hadir: 3},
  {month: 'Mei', hadir: 5, tidak_hadir: 2},
  {month: 'Jun', hadir: 8, tidak_hadir: 4},
  {month: 'Jul', hadir: 8, tidak_hadir: 4},
  {month: 'Agu', hadir: 8, tidak_hadir: 5},
  {month: 'Sep', hadir: 8, tidak_hadir: 5},
  {month: 'Okt', hadir: 8, tidak_hadir: 7},
  {month: 'Nov', hadir: 0, tidak_hadir: 14},
  {month: 'Des', hadir: 0, tidak_hadir: 14},
];

export const dummyAdminCutiTrend = [
  {
    name: 'Priya',
    color: '#2996F5',
    data: [10, 15, 13, 11, 9, 8, 12, 10, 11, 7, 8, 12],
  },
  {
    name: 'Angel',
    color: '#E24B3B',
    data: [13, 17, 11, 14, 13, 14, 13, 11, 12, 13, 12, 13],
  },
  {
    name: 'Ilam',
    color: '#14A44D',
    data: [8, 9, 7, 8, 9, 8, 13, 13, 10, 10, 9, 5],
  },
  {
    name: 'David',
    color: '#FA7373',
    data: [19, 14, 0, 0, 0, 6, 5, 5, 8, 8, 11, 13],
  },
  {
    name: 'Nirina',
    color: '#FDB813',
    data: [5, 7, 5, 8, 9, 7, 8, 9, 8, 12, 11, 8],
  },
  {
    name: 'Alma',
    color: '#009688',
    data: [9, 12, 10, 9, 9, 10, 9, 10, 9, 8, 7, 10],
  },
  {
    name: 'Noah',
    color: '#9B59B6',
    data: [7, 9, 7, 6, 8, 9, 7, 10, 12, 13, 11, 13],
  },
  {
    name: 'Olivia',
    color: '#3B5998',
    data: [11, 12, 11, 12, 9, 10, 12, 9, 10, 13, 12, 11],
  },
];

// Untuk Monitoring Cuti (Bar Chart)
export const dummyAdminCutiMonitoring = [
  {name: 'Priya', total_cuti: 6},
  {name: 'Angel', total_cuti: 8},
  {name: 'Ilam', total_cuti: 8},
  {name: 'David', total_cuti: 9},
  {name: 'Nirina', total_cuti: 5},
  {name: 'Alma', total_cuti: 9},
  {name: 'Noah', total_cuti: 9},
  {name: 'Olivia', total_cuti: 9},
];

export const dummyAdminPerjadinTrend = [
  {
    name: 'Priya',
    color: '#2996F5',
    data: [7, 13, 11, 10, 10, 8, 15, 13, 9, 3, 1, 9],
  },
  {
    name: 'Angel',
    color: '#E24B3B',
    data: [13, 17, 11, 14, 13, 14, 13, 11, 12, 13, 12, 13],
  },
  {
    name: 'Ilam',
    color: '#14A44D',
    data: [8, 9, 7, 8, 9, 8, 13, 13, 10, 10, 9, 5],
  },
  {
    name: 'David',
    color: '#FA7373',
    data: [19, 14, 0, 0, 0, 6, 5, 5, 8, 8, 11, 13],
  },
  {
    name: 'Nirina',
    color: '#FDB813',
    data: [5, 7, 5, 8, 9, 7, 8, 9, 8, 12, 11, 8],
  },
  {
    name: 'Alma',
    color: '#009688',
    data: [9, 12, 10, 9, 9, 10, 9, 10, 9, 8, 7, 10],
  },
  {
    name: 'Noah',
    color: '#9B59B6',
    data: [7, 9, 7, 6, 8, 9, 7, 10, 12, 13, 11, 13],
  },
  {
    name: 'Olivia',
    color: '#3B5998',
    data: [11, 12, 11, 12, 9, 10, 12, 9, 10, 13, 12, 11],
  },
];

// Monitoring Perjalanan Dinas (Bar Chart)
export const dummyAdminPerjadinMonitoring = [
  {name: 'Priya', total_perjadin: 6},
  {name: 'Angel', total_perjadin: 8},
  {name: 'Ilam', total_perjadin: 8},
  {name: 'David', total_perjadin: 9},
  {name: 'Nirina', total_perjadin: 5},
  {name: 'Alma', total_perjadin: 9},
  {name: 'Noah', total_perjadin: 9},
  {name: 'Olivia', total_perjadin: 9},
];

export const dummyLiveAbsensi = [
  {
    name: 'Priya Nair',
    jabatan: 'Dept.Head',
    status: 'Perjalanan Dinas',
    statusType: 'perjadin', // custom buat mapping badge
  },
  {
    name: 'Puteri aprilia',
    jabatan: 'Admin',
    status: 'sakit',
    statusType: 'sakit',
  },
  {
    name: 'Angelica',
    jabatan: 'Organic',
    status: 'Cuti',
    statusType: 'cuti',
  },
  {
    name: 'Maria',
    jabatan: 'Non-Organic',
    status: 'Cuti',
    statusType: 'cuti',
  },
  {
    name: 'Santa',
    jabatan: 'Non-Organic',
    status: 'Hadir',
    statusType: 'hadir',
  },
];

export const dummyReportAdmin = {
  performance: {
    labels: [
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
    ],
    close: [5, 8, 8, 9, 6, 9],
    open: [3, 5, 5, 4, 2, 4],
  },
  summary: {
    total: 48,
    items: [
      {label: 'Land Dispute', value: 20, color: '#C9DB2D'},
      {label: 'Land Compensation', value: 40, color: '#B5C76B'},
      {label: 'Land Use', value: 40, color: '#DF3B31'},
      {label: 'Land Tenure', value: 20, color: '#E8682B'},
    ],
  },
  issue: {
    labels: [
      'Land Dispute',
      'Land Compensation',
      'Land Compensation',
      'Land Compensation',
    ],
    selesai: [30, 20, 28, 29],
    ongoing: [15, 12, 18, 19],
  },
};

// Data untuk Employee
export const dummyReportEmployee = {
  performance: {
    labels: [
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
      'Land Dispute',
    ],
    close: [5, 8, 8, 9, 6, 9],
    open: [3, 5, 5, 4, 2, 4],
  },
  summary: {
    total: 48,
    items: [
      {label: 'Land Dispute', value: 20, color: '#C9DB2D'},
      {label: 'Land Compensation', value: 40, color: '#B5C76B'},
      {label: 'Land Use', value: 40, color: '#DF3B31'},
      {label: 'Land Tenure', value: 20, color: '#E8682B'},
    ],
  },
};

// src/data/dummyJson.ts

export const dummyActivityReports = [
  {
    id: 1,
    status: 'Waiting',
    date: '12/02/2025',
    title: 'Validasi Data Laporan Lapangan Taman Nasional',
    type: 'Jenis Report',
  },
  {
    id: 2,
    status: 'Waiting',
    date: '12/02/2025',
    title: 'Validasi Data Laporan Lapangan Taman Nasional',
    type: 'Jenis Report',
  },
  {
    id: 3,
    status: 'Approved',
    date: '12/02/2025',
    title: 'Validasi Data Laporan Lapangan Taman Nasional',
    type: 'Jenis Report',
  },
  {
    id: 4,
    status: 'Open',
    date: '12/02/2025',
    title: 'Validasi Data Laporan Lapangan Taman Nasional',
    type: 'Jenis Report',
  },
  {
    id: 5,
    status: 'Close',
    date: '12/02/2025',
    title: 'Validasi Data Laporan Lapangan Taman Nasional',
    type: 'Jenis Report',
  },
];

export const dummyWeeklyActivityData = [
  {label: 'Laporan', open: 28, close: 14},
  {label: 'Laporan', open: 19, close: 7},
  {label: 'Laporan', open: 10, close: 6},
  {label: 'Laporan', open: 24, close: 5},
  {label: 'Laporan', open: 22, close: 8},
];

export const dummyWeeklyReports = [
  {
    id: 1,
    status: 'Waiting',
    date: '15/02/2025 - 10/07/2025',
    title: 'Laporan Weekly',
    type: 'Nama PIC - iSafe Number',
  },
  {
    id: 2,
    status: 'Waiting',
    date: '15/02/2025 - 10/07/2025',
    title: 'Laporan Weekly',
    type: 'Nama PIC - iSafe Number',
  },
  {
    id: 3,
    status: 'Approved',
    date: '15/02/2025 - 10/07/2025',
    title: 'Laporan Weekly',
    type: 'Nama PIC - iSafe Number',
  },
  {
    id: 4,
    status: 'Waiting',
    date: '15/02/2025 - 10/07/2025',
    title: 'Laporan Weekly',
    type: 'Nama PIC - iSafe Number',
  },
  {
    id: 5,
    status: 'Waiting',
    date: '15/02/2025 - 10/07/2025',
    title: 'Laporan Weekly',
    type: 'Nama PIC - iSafe Number',
  },
];

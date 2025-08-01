import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const BASE_URL = 'https://externalapps.braga.co.id/panel';
export const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY21jOHFleHdjMDVkdTJqcGNicTRlZGJkbSJ9.TI5FkPGsFiIumVvzAPYpOQ';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// api.interceptors.request.use(
//   async config => {
//     try {
//       const token = await AsyncStorage.getItem('token');
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//     } catch (error) {
//       console.error('Error getting token:', error);
//     }
//     return config;
//   },
//   error => {
//     return Promise.reject(error);
//   },
// );

api.interceptors.request.use(
  async config => {
    const skipAuth =
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/refresh') ||
      config.url?.includes('/auth/register');

    if (!skipAuth) {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting token:', error);
      }
    } else {
      // Pastikan Authorization header tidak ada
      if (config.headers && config.headers.Authorization) {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  error => Promise.reject(error),
);

export const getData = async (endpoint: string, params = {}) => {
  try {
    const response = await api.get(endpoint, {params});
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const postData = async (
  endpoint: string,
  data = {},
  options: {returnStatus?: boolean} = {},
) => {
  try {
    const response = await api.post(endpoint, data);
    return options.returnStatus ? response : response.data;
  } catch (error) {
    throw error;
  }
};

export const putData = async (endpoint: string, data = {}) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const patchData = async (
  endpoint: string,
  data = {},
  options: {returnStatus?: boolean} = {},
) => {
  try {
    const response = await api.patch(endpoint, data);
    return options.returnStatus ? response : response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteData = async (endpoint: string) => {
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export interface LoginResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires: number; // ms
    [key: string]: any;
  };
}

export const loginAPI = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const payload = {email, password, mode: 'json', otp: 'string'};
  const res = await api.post<LoginResponse>('/auth/login', payload);
  return res.data;
};

// --- Refresh Token
export interface RefreshTokenResponse {
  data: {
    access_token: string;
    refresh_token: string;
    expires: number;
    [key: string]: any;
  };
}

export const refreshTokenAPI = async (
  refresh_token: string,
): Promise<RefreshTokenResponse> => {
  const payload = {refresh_token, mode: 'json'};
  const res = await api.post<RefreshTokenResponse>('/auth/refresh', payload);
  return res.data;
};

// --- Logout
export const logoutAPI = async (refresh_token: string): Promise<any> => {
  const payload = {refresh_token, mode: 'json'};
  const res = await api.post('/auth/logout', payload);
  return res.data;
};

export const updateFileMetaDirectus = async (fileIds, data) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const payload = {
    keys: fileIds,
    data: data,
  };

  // Print cURL for debugging
  const curlCommand = `
curl -X PATCH "https://externalapps.braga.co.id/panel/files" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(payload, null, 2)}'
  `.trim();

  // console.log(
  //   '===== C U R L  S I M U L A T I O N =====\n',
  //   curlCommand,
  //   '\n=========================================',
  // );

  const res = await axios.patch(
    'https://externalapps.braga.co.id/panel/files',
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const uploadFileDirectus = async ({uri, name, type}) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const formData = new FormData();
  formData.append('file', {
    uri: uri,
    type: type || 'image/jpeg',
    name: name || 'photo.jpg',
  });

  // Debug FormData log
  // console.log('UPLOAD FORM:', { uri, type, name });

  const res = await axios.post(
    'https://externalapps.braga.co.id/panel/files',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  // Hasil response Directus (lihat format)
  // return res.data.data.id; // kalau mau langsung ID saja
  return res.data.data.id || res.data.data; // biar aman
};

export const createDailyActivity = async body => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  // Print cURL for debugging
  const curlCommand = `
curl -X POST "https://externalapps.braga.co.id/panel/items/daily_activities" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(body, null, 2)}'
`.trim();

  console.log(
    '===== C U R L  S I M U L A T I O N =====\n',
    curlCommand,
    '\n=========================================',
  );

  const res = await axios.post(
    'https://externalapps.braga.co.id/panel/items/daily_activities',
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getUsers = async () => {
  const res = await getData('/users');
  return res.data; // array of users
};
export const getUserById = async id => {
  const res = await getData(`/users/${id}`);
  return res.data;
};

export const getDailyActivities = async (params = {}) => {
  const res = await getData('/items/daily_activities', params);
  return res?.data || [];
};
// Fungsi ambil gambar asset pakai Authorization header, return dataURL base64
export const getImageWithAuth = async uuid => {
  const token = await AsyncStorage.getItem('token');
  try {
    const url = `https://externalapps.braga.co.id/panel/assets/${uuid}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: '*/*', // ganti sesuai tipe file kalau png, dsb
      },
    });

    const blob = await response.blob();

    // Konversi blob ke base64 dataURL
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // dataURL
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    // Kalau gagal (misal unauthorized, atau file gaada), return null/false/empty biar ga ngecrash
    console.log('Error getImageWithAuth:', e);
    return null;
  }
};

export const updateDailyActivity = async (id, body) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const res = await axios.patch(
    `https://externalapps.braga.co.id/panel/items/daily_activities/${id}`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getDailyActivityDetail = async id => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const params = {
    fields:
      '*,' +
      'documents.directus_files_id,' +
      'pics.directus_users_id.first_name,pics.directus_users_id.last_name',
  };

  // Langsung pakai axios, jangan getData()!
  const res = await axios.get(`${BASE_URL}/items/daily_activities/${id}`, {
    params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res?.data?.data;
};

export const getLeavesRequest = async (params = {}) => {
  const res = await getData('/items/leave_requests', params);
  return res?.data || [];
};

export const updateLeaveRequest = async (id, body) => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const res = await axios.patch(
    `https://externalapps.braga.co.id/panel/items/leave_requests/${id}`,
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};
export const getWeeklyReports = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const params = {
    fields: [
      'title',
      'pics.directus_users_id.first_name',
      'pics.directus_users_id.last_name',
      'date_updated',
      'id',
    ].join(','),
  };
  // Nggak usah tulis headers manual, sudah auto diintercept
  const res = await getData('/items/weekly_activities', params);
  return res?.data || [];
};

export const getWeeklyActivityDetail = async id => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const params = {
    fields:
      '*,' +
      'documents.directus_files_id,' +
      'pics.directus_users_id.first_name,pics.directus_users_id.last_name',
  };

  // Langsung pakai axios, jangan getData()!
  const res = await axios.get(`${BASE_URL}/items/weekly_activities/${id}`, {
    params,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res?.data?.data;
};

export const createWeeklyActivity = async body => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  // Optional: log cURL buat debugging
  const curlCommand = `
curl -X POST "https://externalapps.braga.co.id/panel/items/weekly_activities" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '${JSON.stringify(body, null, 2)}'
  `.trim();

  console.log(
    '===== C U R L  S I M U L A T I O N =====\n',
    curlCommand,
    '\n=========================================',
  );

  const res = await axios.post(
    'https://externalapps.braga.co.id/panel/items/weekly_activities',
    body,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
};

export const getBusinessTrips = async (params = {}) => {
  // optional: bisa pakai params kalau mau filter/pagination
  const res = await getData('/items/business_trips', params);
  return res?.data || [];
};
export const getBusinessTripDetail = async id => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const res = await axios.get(`${BASE_URL}/items/business_trips/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res?.data?.data;
};

export const getStakeholders = async (params = {}) => {
  const res = await getData('/items/stakeholders?fields=', params);
  return res?.data || [];
};
export const getStakeholdersDetail = async id => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token tidak ditemukan. Harus login dulu.');

  const res = await axios.get(`${BASE_URL}/items/stakeholders/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return res?.data?.data;
};

export default api;

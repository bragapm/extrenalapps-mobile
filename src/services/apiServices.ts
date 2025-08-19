// services/apiServices.ts
import axios, {AxiosError, AxiosRequestConfig} from 'axios';
import {useAuthStore} from '../store/authStore'; // <-- sesuaikan path jika berbeda

export const BASE_URL = 'https://externalapps.braga.co.id/panel';
export const MAPBOX_ACCESS_TOKEN =
  'sk.eyJ1Ijoid2hvaXNhcnZpYW4iLCJhIjoiY21jOHFleHdjMDVkdTJqcGNicTRlZGJkbSJ9.TI5FkPGsFiIumVvzAPYpOQ';

type RetryableConfig = AxiosRequestConfig & {_retry?: boolean};

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 50_000_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ---------- Utils ----------
const isAuthPath = (url?: string) =>
  !!url &&
  (url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/register'));

// ---------- REQUEST INTERCEPTOR ----------
api.interceptors.request.use(
  async config => {
    // Endpoint non-auth → pastikan token segar (auto refresh jika perlu)
    if (!isAuthPath(config.url)) {
      await useAuthStore.getState().refreshNow(); // no-op kalau belum waktunya
      const token = useAuthStore.getState().accessToken;
      if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
      }
    } else {
      // Pastikan Authorization tidak ikut ke endpoint auth
      if (config.headers && (config.headers as any).Authorization) {
        delete (config.headers as any).Authorization;
      }
    }

    // ---- Tambahan console.log curl ----
    try {
      const method = (config.method || 'get').toUpperCase();
      const url = `${config.baseURL || ''}${config.url || ''}`;
      const headers = config.headers || {};
      let curl = [`curl -X ${method}`];

      Object.entries(headers).forEach(([key, value]) => {
        if (value !== undefined) {
          curl.push(`-H "${key}: ${value}"`);
        }
      });

      if (config.data) {
        const dataString =
          typeof config.data === 'string'
            ? config.data
            : JSON.stringify(config.data);
        curl.push(`-d '${dataString}'`);
      }

      curl.push(`"${url}"`);

      console.log('CURL:', curl.join(' '));
    } catch (e) {
      console.log('Error generate curl log:', e);
    }

    return config;
  },
  error => Promise.reject(error),
);

// ---------- RESPONSE INTERCEPTOR (401 → refresh sekali → retry) ----------
api.interceptors.response.use(
  res => res,
  async error => {
    const err = error as AxiosError;
    const status = err?.response?.status;
    const original = (err.config || {}) as RetryableConfig;

    if (status === 401 && !original._retry && !isAuthPath(original.url)) {
      original._retry = true;
      try {
        await useAuthStore.getState().refreshNow(true); // paksa refresh
        const token = useAuthStore.getState().accessToken;
        if (token) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${token}`;
        }
        return api(original);
      } catch {
        // Optional: paksa logout
        // await useAuthStore.getState().clearAuth();
      }
    }

    return Promise.reject(error);
  },
);

// ---------- Generic helpers ----------
export const getData = async (endpoint: string, params: any = {}) => {
  const response = await api.get(endpoint, {params});
  return response.data;
};

export const postData = async (
  endpoint: string,
  data: any = {},
  options: {returnStatus?: boolean} = {},
) => {
  const response = await api.post(endpoint, data);
  return options.returnStatus ? response : response.data;
};

export const putData = async (endpoint: string, data: any = {}) => {
  const response = await api.put(endpoint, data);
  return response.data;
};

export const patchData = async (
  endpoint: string,
  data: any = {},
  options: {returnStatus?: boolean} = {},
) => {
  const response = await api.patch(endpoint, data);
  return options.returnStatus ? response : response.data;
};

export const deleteData = async (endpoint: string) => {
  const response = await api.delete(endpoint);
  return response.data;
};

// ---------- Auth endpoints ----------
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

export const logoutAPI = async (refresh_token: string): Promise<any> => {
  const payload = {refresh_token, mode: 'json'};
  const res = await api.post('/auth/logout', payload);
  return res.data;
};

// ---------- Files / Directus ----------
export const updateFileMetaDirectus = async (fileIds: any, data: any) => {
  const payload = {keys: fileIds, data};
  const res = await api.patch('/files', payload);
  return res.data;
};

export const uploadFileDirectus = async ({
  uri,
  name,
  type,
}: {
  uri: string;
  name?: string;
  type?: string;
}) => {
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: type || 'image/jpeg',
    name: name || 'photo.jpg',
  } as any);

  const res = await api.post('/files', formData, {
    headers: {'Content-Type': 'multipart/form-data'},
  });
  return res.data?.data?.id ?? res.data?.data;
};

// ---------- Daily Activities ----------
export const createDailyActivity = async (body: any) => {
  const res = await api.post('/items/daily_activities', body);
  return res.data;
};

export const getDailyActivities = async (params: any = {}) => {
  // minta semua field yang kamu butuhkan di UI
  const fields = [
    'id',
    'title',
    'status',
    'date',
    'report_type.name',
    'pics.directus_users_id.id',
    'pics.directus_users_id.first_name',
    'pics.directus_users_id.last_name',
  ].join(',');

  // kirim semua filter/sort via axios "params"
  const res = await getData('/items/daily_activities', {
    fields,
    // default sort kalau belum diset dari buildParams()
    sort: params.sort ?? '-date',
    ...params, // <- penting: sekarang filter dari buildParams() benar2 kepakai
  });

  // Normalisasi bentuk data ke yang dipakai komponen (pic singular, type, dll)
  const rows = Array.isArray(res?.data) ? res.data : [];
  return rows.map((it: any) => {
    const firstPic = it?.pics?.[0]?.directus_users_id || null;
    const picId = firstPic?.id ?? null;
    const picName = [firstPic?.first_name, firstPic?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return {
      id: it.id,
      title: it.title,
      status: String(it.status || '').toLowerCase(), // biar konsisten ke StatusBadge
      date: it.date,
      type: it?.report_type?.name ?? '', // kamu pakai "type" di kartu lama
      pic: picId, // dipakai buat mapping ke usersMap
      pic_name: picName, // kalau mau langsung tampilkan nama juga ada
      // simpan “raw” kalau perlu
      _raw: it,
    };
  });
};

export const getDailyActivitiesSummary = async (params: any = {}) => {
  const {sort, ...rest} = params || {};
  const res = await getData('/items/daily_activities', {
    groupBy: 'report_type,status',
    'aggregate[count]': 'id',
    // kalau Directus bisa hydrate relasi, ini akan ikut:
    fields: 'report_type,report_type.name,status',
    ...rest,
  });

  const rows = Array.isArray(res?.data) ? res.data : [];
  return rows.map((r: any) => {
    const status = String(r?.status || '').toLowerCase();
    // count bisa datang sebagai number atau { id: "9" }
    const cnt =
      typeof r?.count === 'number'
        ? r.count
        : r?.count?.id
        ? Number(r.count.id)
        : 0;

    // label tipe: pakai nama kalau ada; fallback ke id
    const reportTypeId =
      typeof r?.report_type === 'object' ? r?.report_type?.id : r?.report_type;
    const reportTypeName =
      r?.report_type?.name || r?.report_type_name || `Type ${reportTypeId}`;

    return {
      report_type_id: reportTypeId ?? null,
      report_type_name: reportTypeName,
      status,
      count: Number.isFinite(cnt) ? cnt : 0,
      _raw: r,
    };
  });
};

export const updateDailyActivity = async (id: any, body: any) => {
  const res = await api.patch(`/items/daily_activities/${id}`, body);
  return res.data;
};

export const getDailyActivityDetail = async (id: any) => {
  const params = {
    fields:
      '*,' +
      'documents.directus_files_id,' +
      'pics.directus_users_id.first_name,pics.directus_users_id.last_name',
  };
  const res = await api.get(`/items/daily_activities/${id}`, {params});
  return res?.data?.data;
};

// ---------- Users ----------
export const getUsers = async () => {
  const res = await getData('/users');
  return res.data; // array of users
};

export const getUserById = async (id: any) => {
  const res = await getData(`/users/${id}`);
  return res.data;
};

// ---------- Leaves ----------
export const getLeavesRequest = async (params: any = {}) => {
  const res = await getData('/items/leave_requests', params);
  return res?.data || [];
};

export const updateLeaveRequest = async (id: any, body: any) => {
  const res = await api.patch(`/items/leave_requests/${id}`, body);
  return res.data;
};

// ---------- Weekly Activities ----------
export const getWeeklyReports = async () => {
  const params = {
    fields: [
      'title',
      'pics.directus_users_id.first_name',
      'pics.directus_users_id.last_name',
      'date_updated',
      'id',
    ].join(','),
  };
  const res = await getData('/items/weekly_activities', params);
  return res?.data || [];
};

export const getWeeklyActivityDetail = async (id: any) => {
  const params = {
    fields:
      '*,' +
      'documents.directus_files_id,' +
      'pics.directus_users_id.first_name,pics.directus_users_id.last_name',
  };
  const res = await api.get(`/items/weekly_activities/${id}`, {params});
  return res?.data?.data;
};

export const createWeeklyActivity = async (body: any) => {
  const res = await api.post('/items/weekly_activities', body);
  return res.data;
};

// ---------- Business Trips ----------
export const getBusinessTrips = async (params: any = {}) => {
  const res = await getData('/items/business_trips', params);
  return res?.data || [];
};

export const getBusinessTripDetail = async (id: any) => {
  const res = await api.get(`/items/business_trips/${id}`);
  return res?.data?.data;
};

// ---------- Stakeholders ----------
export const getStakeholders = async (params: any = {}) => {
  // path asli kamu: '/items/stakeholders?fields=' → dipertahankan
  const res = await getData('/items/stakeholders?fields=', params);
  return res?.data || [];
};

export const getStakeholdersDetail = async (id: any) => {
  const res = await api.get(`/items/stakeholders/${id}`);
  return res?.data?.data;
};

// ---------- Asset via fetch (manual header, tetap auto-refresh dulu) ----------
export const getImageWithAuth = async (uuid: string) => {
  try {
    // pastikan token segar
    await useAuthStore.getState().refreshNow();
    const token = useAuthStore.getState().accessToken;

    const url = `${BASE_URL}/assets/${uuid}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: '*/*',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.log('Error getImageWithAuth:', e);
    return null;
  }
};

export default api;

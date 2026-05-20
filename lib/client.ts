import axios, { type AxiosInstance } from 'axios';

function resolveBaseURL(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL;
  if (explicit) {
    return explicit.startsWith('http') ? explicit : `https://${explicit}`;
  }
  const port = process.env.PORT || '3000';
  return `http://localhost:${port}`;
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (process.env.NODE_ENV !== 'production') {
      const url = error?.config?.url;
      const status = error?.response?.status;
      console.error(`[axiosClient] ${status ?? 'ERR'} ${url ?? '<unknown>'}`);
    }
    return Promise.reject(error);
  },
);

export default axiosClient;

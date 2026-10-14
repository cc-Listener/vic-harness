import type { AxiosInstance } from 'axios';
// 主应用请求统一鉴权；这里只保存 web 的事实，不复制到根合同。
export function installInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
}

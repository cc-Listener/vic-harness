import type { AxiosInstance } from 'axios';
// 所有请求统一经过鉴权与错误处理，修改前检查调用入口。
export function installInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  client.interceptors.response.use((response) => response, (error: unknown) => Promise.reject(error));
}

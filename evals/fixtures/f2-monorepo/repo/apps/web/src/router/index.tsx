import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AcmeButton } from '@acme/ui';
import { client } from '../request';
function Home() { return <AcmeButton onClick={() => void client.get('/profile')}>刷新资料</AcmeButton>; }
function RequireAuth() { return sessionStorage.getItem('token') ? <Home /> : <Navigate to="/login" />; }
export const router = createBrowserRouter([{ path: '/', element: <RequireAuth /> }, { path: '/login', element: <p>请登录</p> }]);

import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
export function bootstrap(element: HTMLElement) { createRoot(element).render(<RouterProvider router={router} />); }

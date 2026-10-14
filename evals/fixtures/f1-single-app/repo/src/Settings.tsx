import { AppButton, AppModal } from '@/ui';
import { client } from './request';
export function Settings() {
  return <AppModal open title="设置" onCancel={() => undefined}><AppButton onClick={() => void client.get('/settings')}>刷新设置</AppButton></AppModal>;
}

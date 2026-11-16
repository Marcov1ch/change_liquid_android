import { Car, ChartBar, User } from '@phosphor-icons/react';
import type { IconComponent } from './icon';

export interface NavItem {
  to: string;
  label: string;
  icon: IconComponent;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Гараж', icon: Car },
  { to: '/stats', label: 'Статистика', icon: ChartBar },
  { to: '/profile', label: 'Профиль', icon: User },
];

export function isNavActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/' || pathname.startsWith('/vehicle');
  return pathname === to || pathname.startsWith(`${to}/`);
}

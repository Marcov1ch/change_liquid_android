import { Check, CheckCircle, Clock, MinusCircle, Warning, XCircle } from '@phosphor-icons/react';
import type { IconComponent } from './icon';

export type StatusKey = 'good' | 'warning' | 'critical' | 'overdue' | 'unknown' | 'replaced';

export interface StatusMeta {
  key: StatusKey;
  label: string;
  icon: IconComponent;
  chipClass: string;
  railClass: string;
}

const STATUS_META: Record<StatusKey, StatusMeta> = {
  good: {
    key: 'good',
    label: 'В порядке',
    icon: CheckCircle,
    chipClass: 'bg-good-container text-good',
    railClass: 'bg-good',
  },
  warning: {
    key: 'warning',
    label: 'Скоро замена',
    icon: Clock,
    chipClass: 'bg-warning-container text-warning',
    railClass: 'bg-warning',
  },
  critical: {
    key: 'critical',
    label: 'Требует внимания',
    icon: Warning,
    chipClass: 'bg-critical-container text-critical',
    railClass: 'bg-critical',
  },
  overdue: {
    key: 'overdue',
    label: 'Просрочено',
    icon: XCircle,
    chipClass: 'bg-error-container text-error',
    railClass: 'bg-error',
  },
  unknown: {
    key: 'unknown',
    label: 'Нет данных',
    icon: MinusCircle,
    chipClass: 'bg-unknown-container text-unknown',
    railClass: 'bg-outline',
  },
  replaced: {
    key: 'replaced',
    label: 'Заменено',
    icon: Check,
    chipClass: 'bg-surface-2 text-surface-on-variant',
    railClass: 'bg-outline-variant',
  },
};

export function getStatusMeta(status: string | null | undefined): StatusMeta {
  if (status === 'good' || status === 'warning' || status === 'critical' || status === 'overdue' || status === 'replaced') {
    return STATUS_META[status];
  }
  return STATUS_META.unknown;
}

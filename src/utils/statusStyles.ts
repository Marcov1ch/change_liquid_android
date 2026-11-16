import { Check, CheckCircle, Clock, MinusCircle, Warning, XCircle } from '@phosphor-icons/react';
import type { IconComponent } from '../theme/icon';

export interface ReplacementStatusStyle {
    bg: string;
    text: string;
    border: string;
    icon: IconComponent;
    label: string;
}

export const REPLACEMENT_STATUS_STYLES: Record<string, ReplacementStatusStyle> = {
    good: {
        bg: 'bg-good-container',
        text: 'text-good',
        border: 'border-l-good',
        icon: CheckCircle,
        label: 'В порядке',
    },
    warning: {
        bg: 'bg-warning-container',
        text: 'text-warning',
        border: 'border-l-warning',
        icon: Clock,
        label: 'Скоро замена',
    },
    critical: {
        bg: 'bg-critical-container',
        text: 'text-critical',
        border: 'border-l-critical',
        icon: Warning,
        label: 'Требует внимания',
    },
    overdue: {
        bg: 'bg-error-container',
        text: 'text-error-on-container',
        border: 'border-l-error',
        icon: XCircle,
        label: 'Просрочено',
    },
    replaced: {
        bg: 'bg-surface-2',
        text: 'text-outline',
        border: 'border-l-outline-variant',
        icon: Check,
        label: 'Заменено',
    },
    unknown: {
        bg: 'bg-surface-variant/50',
        text: 'text-surface-on-variant',
        border: 'border-l-outline',
        icon: MinusCircle,
        label: 'Нет данных',
    },
};

export function getReplacementStatusStyle(status: string | null | undefined): ReplacementStatusStyle {
    return REPLACEMENT_STATUS_STYLES[status ?? 'unknown'] ?? REPLACEMENT_STATUS_STYLES.unknown;
}

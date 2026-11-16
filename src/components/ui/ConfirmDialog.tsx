interface Props {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ isOpen, title, message, confirmLabel, danger = false, onConfirm, onCancel }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 animate-fade-in p-4" onClick={onCancel} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm bg-surface rounded-md3-lg shadow-md3-4 p-5 animate-scale-in"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-title-md text-surface-on m-0">{title}</h2>
        <p className="text-body-md text-surface-on-variant mt-2 mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} className="md3-btn-text">Отмена</button>
          <button
            type="button"
            onClick={onConfirm}
            className={danger ? 'md3-btn-danger' : 'md3-btn-primary'}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

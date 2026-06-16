import Modal from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'warning',
  isLoading = false,
}: ConfirmDialogProps) {
  const iconColor = {
    danger: 'text-danger-500 bg-danger-50',
    warning: 'text-warning-500 bg-warning-50',
    info: 'text-primary-500 bg-primary-50',
  };

  const btnColor = {
    danger: 'btn-danger',
    warning: 'btn-accent',
    info: 'btn-primary',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${iconColor[type]}`}
        >
          <AlertTriangle className="w-8 h-8" />
        </div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 w-full">
          <button className="btn-secondary flex-1" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`${btnColor[type]} flex-1`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? '处理中...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

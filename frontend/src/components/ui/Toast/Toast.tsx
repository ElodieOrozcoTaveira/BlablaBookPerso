import React from 'react';
import type { Toast as ToastType } from '../../../store/toastStore';
import './Toast.scss';

interface ToastProps {
  toast: ToastType;
  // eslint-disable-next-line no-unused-vars
  onRemove: (toastId: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  return (
    <div
      className={`toast toast--${toast.type}`}
      onClick={() => onRemove(toast.id)}
    >
      <div className="toast__content">
        <span className="toast__icon">{getIcon()}</span>
        <span className="toast__message">{toast.message}</span>
      </div>
      <button
        className="toast__close"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(toast.id);
        }}
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;

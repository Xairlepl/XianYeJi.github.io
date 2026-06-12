import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import './Toast.css';

const Toast = () => {
  const { toasts, remove } = useToastStore();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => remove(toast.id)}
        >
          <span className="toast-icon">
            {toast.type === 'success' && <CheckCircle2 size={20} />}
            {toast.type === 'error' && <XCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </span>
          <span className="toast-message">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};

export default Toast;

// Alert component
import { XCircle, CheckCircle, Info } from 'lucide-react';

type AlertProps = {
  type?: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
};

export function Alert({ type = 'error', title, message, onClose }: AlertProps) {
  const base = 'rounded-lg p-4 flex items-start gap-3 shadow';
  const body =
    type === 'error'
      ? 'bg-red-50 text-red-800 border border-red-200'
      : type === 'success'
      ? 'bg-green-50 text-green-800 border border-green-200'
      : 'bg-blue-50 text-blue-800 border border-blue-200';

  const Icon = type === 'error' ? XCircle : type === 'success' ? CheckCircle : Info;

  return (
    <div className={`${base} ${body}`} role="alert">
      <div className="mt-0.5">
        <Icon className="w-6 h-6" />
      </div>

      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        <div className="text-sm">{message}</div>
      </div>

      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="ml-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default Alert;

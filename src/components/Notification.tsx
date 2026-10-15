import { useStore } from '../store';

export function Notification() {
  const { state } = useStore();
  if (!state.notification) return null;

  const colors = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div className={`fixed top-4 right-4 z-[9999] px-6 py-3 rounded-lg shadow-lg animate-slide-in ${colors[state.notification.type]}`}>
      <p className="font-medium">{state.notification.message}</p>
    </div>
  );
}

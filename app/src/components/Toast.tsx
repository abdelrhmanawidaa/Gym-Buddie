import { useEffect, useState } from 'react';

export interface ToastHandle {
  show: (message: string) => void;
}

export default function Toast({ onRegister }: { onRegister: (handle: ToastHandle) => void }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    onRegister({
      show: (msg) => setMessage(msg),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2800);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto rounded-full border border-amber-400/40 bg-[#1a1408] px-4 py-2 text-sm font-semibold text-amber-300 shadow-lg">
        {message}
      </div>
    </div>
  );
}

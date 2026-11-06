import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC<{ lang?: 'ar' | 'en' }> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  const currentLang = lang || (typeof localStorage !== 'undefined' && localStorage.getItem('app_lang') === 'en' ? 'en' : 'ar');

  if (isOnline) return null;

  return (
    <div 
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-600 border border-amber-500 text-white px-4 py-2.5 text-sm font-semibold shadow-2xl shadow-amber-950/40 animate-bounce" 
      dir={currentLang === 'ar' ? 'rtl' : 'ltr'}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
      <WifiOff className="w-4 h-4 text-amber-100" />
      <span>
        {currentLang === 'ar' 
          ? 'تحقق من الاتصال بالخادم. لا يُعتمد الصرف أو الحفظ قبل تأكيد الخادم.'
          : 'Check the server connection. Saving and dispensing require server confirmation.'}
      </span>
    </div>
  );
};

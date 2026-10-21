import { useState, useEffect, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;
  syncTriggerCount: number;
  triggerManualSync: () => void;
}

export function useNetworkStatus(onReconnect?: () => void): NetworkStatus {
  const [realOnline, setRealOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [syncTriggerCount, setSyncTriggerCount] = useState<number>(0);

  const effectiveOnline = realOnline && !isSimulatedOffline;

  useEffect(() => {
    const handleOnline = () => {
      setRealOnline(true);
      if (!isSimulatedOffline && onReconnect) {
        onReconnect();
      }
    };

    const handleOffline = () => {
      setRealOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, onReconnect]);

  const toggleSimulatedOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      // If toggling back to online, trigger reconnect
      if (!next && realOnline && onReconnect) {
        setTimeout(onReconnect, 300);
      }
      return next;
    });
  }, [realOnline, onReconnect]);

  const triggerManualSync = useCallback(() => {
    setSyncTriggerCount((c) => c + 1);
    if (onReconnect) {
      onReconnect();
    }
  }, [onReconnect]);

  return {
    isOnline: effectiveOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    syncTriggerCount,
    triggerManualSync,
  };
}

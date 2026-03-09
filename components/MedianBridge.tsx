import React, { useEffect } from 'react';
import median from 'median-js-bridge';

interface MedianBridgeProps {
  children: React.ReactNode;
}

const MedianBridge: React.FC<MedianBridgeProps> = ({ children }) => {
  useEffect(() => {
    const initializeMedian = () => {
      try {
        if (typeof median !== 'undefined' && median.isNativeApp()) {
          median.appResumed.addListener(() => undefined);
        }
      } catch {
        // Median support is optional. Fail closed without noisy logs.
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeMedian);
    } else {
      initializeMedian();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', initializeMedian);
    };
  }, []);

  return <>{children}</>;
};

export default MedianBridge;

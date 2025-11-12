import { useState, useEffect } from 'react';

/**
 * Hook: useDeviceType
 *
 * Detects and returns information about the current device type and screen size.
 * Works safely with Next.js (SSR compatible).
 *
 * @returns {Device} Object containing screen width, height, and device-type booleans.
 */
type Device = {
  /** The current viewport width in pixels (window.innerWidth). */
  width: number;

  /** The current viewport height in pixels (window.innerHeight). */
  height: number;

  /** True if the viewport width is less than 768px (mobile devices). */
  isMobile: boolean;

  /** True if the viewport width is between 768px and 1199px (tablet devices). */
  isTablet: boolean;

  /** True if the viewport width is 1200px or greater (desktop devices). */
  isDesktop: boolean;
};

export const useDevice = (): Device => {
  const [device, setDevice] = useState<Device>({
    width: 0,
    height: 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setDevice({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1200,
        isDesktop: width >= 1200,
      });
    };

    // Initial load
    updateDevice();

    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, []);

  return device;
};

import { useDevice } from '@/hooks/device';
import React, { ReactNode } from 'react';
interface SensitiveDataProps {
  children: ReactNode;
}

export const SensitiveData: React.FC<SensitiveDataProps> = ({ children }) => {
  const { isMobile } = useDevice();

  return (
    <div data-hj-suppress style={{ width: !isMobile ? 'auto' : '100%', height: '100%' }}>
      {children}
    </div>
  );
};

import React from 'react';
import * as RadixToast from '@radix-ui/react-toast';
import styles from './Toast.module.css';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info';
}

export const Toast: React.FC<ToastProps> = ({
  open,
  onOpenChange,
  title,
  description,
  type = 'info',
}) => {
  return (
    <RadixToast.Root
      className={`${styles.root} ${styles[type]}`}
      open={open}
      onOpenChange={onOpenChange}
    >
      <RadixToast.Title className={styles.title}>{title}</RadixToast.Title>
      {description && (
        <RadixToast.Description className={styles.description}>
          {description}
        </RadixToast.Description>
      )}
    </RadixToast.Root>
  );
};

export const ToastProvider = RadixToast.Provider;
export const ToastViewport = RadixToast.Viewport;

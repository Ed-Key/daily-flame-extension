import React, { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show toast with animation
    setTimeout(() => setIsVisible(true), 100);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'fixed',
      top: '16px',
      right: '16px',
      zIndex: 2000000,
      padding: '12px 16px',
      borderRadius: '8px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      border: '1px solid',
      backdropFilter: 'blur(4px)',
      transition: 'all 300ms ease-in-out',
      maxWidth: '384px',
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      opacity: isVisible ? 1 : 0,
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(34, 197, 94, 0.9)',
          borderColor: 'rgba(74, 222, 128, 1)',
          color: 'white',
        };
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          borderColor: 'rgba(248, 113, 113, 1)',
          color: 'white',
        };
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(59, 130, 246, 0.9)',
          borderColor: 'rgba(96, 165, 250, 1)',
          color: 'white',
        };
      default:
        return {
          ...baseStyles,
          backgroundColor: 'rgba(107, 114, 128, 0.9)',
          borderColor: 'rgba(156, 163, 175, 1)',
          color: 'white',
        };
    }
  };

  const getIcon = () => {
    const iconStyle = { width: '20px', height: '20px', marginRight: '8px', flexShrink: 0 };
    
    switch (type) {
      case 'success':
        return (
          <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg style={iconStyle} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={getToastStyles()}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {getIcon()}
        <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>{message}</span>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            marginLeft: '12px',
            color: 'white',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 200ms',
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
import { useEffect, useRef, useCallback } from 'react';

interface UseContextScrollProps {
  showContext: boolean;
}

export const useContextScroll = ({ showContext }: UseContextScrollProps) => {
  const contextContainerRef = useRef<HTMLDivElement>(null);

  const handleContextScroll = useCallback(() => {
    // Scroll handling - fade effect removed
  }, []);

  useEffect(() => {
    if (showContext && contextContainerRef.current) {
      // Add scroll listener when context is shown
      const container = contextContainerRef.current;
      container.addEventListener('scroll', handleContextScroll);
      
      // Initial check
      handleContextScroll();
      
      return () => {
        container.removeEventListener('scroll', handleContextScroll);
      };
    }
  }, [showContext, handleContextScroll]);

  // Setup function to be called when context content loads
  const setupScrollListener = useCallback(() => {
    setTimeout(() => {
      if (contextContainerRef.current) {
        contextContainerRef.current.addEventListener('scroll', handleContextScroll);
        // Initial check
        handleContextScroll();
      }
    }, 100);
  }, [handleContextScroll]);

  // Cleanup function to be called when leaving context view
  const cleanupScrollListener = useCallback(() => {
    if (contextContainerRef.current) {
      contextContainerRef.current.removeEventListener('scroll', handleContextScroll);
    }
  }, [handleContextScroll]);

  return {
    contextContainerRef,
    setupScrollListener,
    cleanupScrollListener,
    handleContextScroll
  };
};
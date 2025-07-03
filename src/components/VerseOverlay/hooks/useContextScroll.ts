import { useEffect, useRef, useCallback } from 'react';

interface UseContextScrollProps {
  showContext: boolean;
}

export const useContextScroll = ({ showContext }: UseContextScrollProps) => {
  const contextContainerRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);

  const handleContextScroll = useCallback(() => {
    if (contextContainerRef.current && fadeOverlayRef.current) {
      const scrollHeight = contextContainerRef.current.scrollHeight;
      const scrollTop = contextContainerRef.current.scrollTop;
      const clientHeight = contextContainerRef.current.clientHeight;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;
      
      console.log('Scroll debug:', {
        scrollHeight,
        scrollTop,
        clientHeight,
        scrollBottom,
        shouldHide: scrollBottom <= 5
      });
      
      // If we're within 5 pixels of the bottom, hide the fade
      if (scrollBottom <= 5) {
        fadeOverlayRef.current.classList.add('hidden');
      } else {
        fadeOverlayRef.current.classList.remove('hidden');
      }
    }
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
    fadeOverlayRef,
    setupScrollListener,
    cleanupScrollListener,
    handleContextScroll
  };
};
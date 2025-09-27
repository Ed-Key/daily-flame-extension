import React, { useEffect } from 'react';
import { gsap } from 'gsap';
import { BibleTranslation } from '../../../types';
import SettingsContent from './SettingsContent';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  shadowRoot?: ShadowRoot;
  currentTheme: 'light' | 'dark';
  currentTranslation: BibleTranslation;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onTranslationChange: (translation: BibleTranslation) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  isOpen,
  onClose,
  shadowRoot,
  currentTheme,
  currentTranslation,
  onThemeChange,
  onTranslationChange
}) => {
  // Animate sidebar panel sliding in/out
  useEffect(() => {
    if (!isOpen) return;

    // Animate sidebar panel sliding in from right
    setTimeout(() => {
      const sidebarPanel = shadowRoot?.querySelector('.settings-sidebar-panel') as HTMLElement;
      if (sidebarPanel) {
        // Set initial state - fully hidden to the right
        gsap.set(sidebarPanel, {
          x: '100%' // Start position: fully hidden to the right
        });

        // Slide in to visible position
        gsap.to(sidebarPanel, {
          x: '0.5%', // Slide to slightly offset position (0.5% from edge)
          duration: 0.4,
          ease: "power2.out"
        });
      }
    }, 10);
  }, [isOpen, shadowRoot]);

  const handleClose = () => {
    // Animate sidebar sliding out before closing
    const sidebarPanel = shadowRoot?.querySelector('.settings-sidebar-panel') as HTMLElement;

    if (sidebarPanel) {
      gsap.to(sidebarPanel, {
        x: '100%', // Slide back out to the right
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible backdrop for click-outside-to-close */}
      <div
        className="settings-sidebar-backdrop"
        onClick={handleClose}
      />

      {/* Settings Panel - Slides in from right */}
      <div className="settings-sidebar-panel">
        {/* Header with title and back button */}
        <div className="settings-header">
          <h2 className="settings-header-title">Settings</h2>
          <button
            className="settings-back-btn"
            onClick={handleClose}
            aria-label="Back to verse"
          >
            <span className="settings-back-arrow">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor" style={{ transform: 'rotate(180deg)' }}>
                <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/>
              </svg>
            </span>
          </button>
        </div>

        <div className="settings-sidebar-separator"></div>

        <div className="settings-sidebar-content">
          {/* Settings Form Content */}
          <SettingsContent
            currentTheme={currentTheme}
            currentTranslation={currentTranslation}
            onThemeChange={onThemeChange}
            onTranslationChange={onTranslationChange}
          />
        </div>
      </div>
    </>
  );
};

export default SettingsSidebar;
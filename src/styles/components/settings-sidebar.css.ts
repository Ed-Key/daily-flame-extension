export const settingsSidebarStyles = `
  /* Dimming effect for verse content when settings are open */
  .verse-dimmed {
    filter: brightness(0.7);
    transition: filter 0.3s ease;
    pointer-events: none; /* Disable interaction with verse content */
  }

  /* Backdrop overlay - transparent, just for click detection */
  .settings-sidebar-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: transparent; /* No visual effect, just click detection */
    z-index: 100;
    cursor: default;
  }

  /* Sidebar Panel - slides in from right, extends to modal edges */
  .settings-sidebar-panel {
    position: absolute;
    top: 0;         /* Extend to top edge of modal */
    right: 0;       /* Extend to right edge of modal */
    bottom: 0;      /* Extend to bottom edge of modal */
    width: 40%;     /* Takes 40% of modal width */
    min-width: 300px;
    max-width: 450px;
    /* Glassmorphic effect - inspired by original profile dropdown */
    background: rgba(255, 255, 255, 0.08); /* Semi-transparent white */
    backdrop-filter: blur(16px); /* Frosted glass effect */
    -webkit-backdrop-filter: blur(16px); /* Safari support */
    z-index: 101;
    /* Enhanced glassmorphic shadow and border */
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.3), /* Ambient shadow */
                inset 0 0 0 1px rgba(255, 255, 255, 0.1); /* Subtle inner border */
    border-left: 1px solid rgba(255, 255, 255, 0.2); /* Left edge highlight */
    border-radius: 0 20px 20px 0; /* Round RIGHT corners to match modal's shape */
    transform: translateX(100%); /* Start fully hidden to the right */
    opacity: 1; /* Keep fully opaque, only slide animation */
    overflow: hidden; /* Ensure content respects rounded corners */
  }

  /* Content inside the settings panel */
  .settings-sidebar-content {
    padding: 48px 30px 30px 30px; /* Extra top padding for close button */
    height: 100%;
    overflow-y: auto;
    color: rgba(255, 255, 255, 0.95); /* White text for glassmorphic background */
  }

  .settings-sidebar-title {
    font-size: 24px;
    font-weight: 500;
    margin: 0 0 10px 0;
    color: rgba(255, 255, 255, 1); /* Pure white for title */
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* Subtle shadow for readability */
  }

  .settings-sidebar-description {
    font-size: 14px;
    margin: 0 0 20px 0;
    opacity: 0.8;
    color: rgba(255, 255, 255, 0.9); /* Slightly dimmed white */
  }

  /* Close button */
  .settings-sidebar-close {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 32px;
    height: 32px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1); /* Glassmorphic button */
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    color: rgba(255, 255, 255, 0.8);
    font-size: 24px;
    line-height: 1;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .settings-sidebar-close:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 1);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .settings-sidebar-panel {
      width: 70%;
      min-width: 250px;
    }
  }

  @media (max-width: 480px) {
    .settings-sidebar-panel {
      width: 85%;
      min-width: 200px;
    }
  }

  /* Light Theme Overrides */
  :host([data-theme="light"]) .settings-sidebar-panel {
    /* Light theme glassmorphic effect */
    background: rgba(0, 0, 0, 0.04); /* Very light dark overlay */
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.1),
                inset 0 0 0 1px rgba(0, 0, 0, 0.05);
    border-left: 1px solid rgba(0, 0, 0, 0.1);
  }

  :host([data-theme="light"]) .settings-sidebar-content {
    color: rgba(0, 0, 0, 0.9); /* Dark text for light theme */
  }

  :host([data-theme="light"]) .settings-sidebar-title {
    color: rgba(0, 0, 0, 1);
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  }

  :host([data-theme="light"]) .settings-sidebar-description {
    color: rgba(0, 0, 0, 0.7);
  }

  :host([data-theme="light"]) .settings-sidebar-close {
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.6);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  }

  :host([data-theme="light"]) .settings-sidebar-close:hover {
    background: rgba(0, 0, 0, 0.1);
    border-color: rgba(0, 0, 0, 0.15);
    color: rgba(0, 0, 0, 0.9);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;